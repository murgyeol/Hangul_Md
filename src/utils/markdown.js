import { createLowlight } from 'lowlight'
import js from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import htmlLang from 'highlight.js/lib/languages/xml'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import rust from 'highlight.js/lib/languages/rust'
import go from 'highlight.js/lib/languages/go'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'
import kotlin from 'highlight.js/lib/languages/kotlin'
import swift from 'highlight.js/lib/languages/swift'

const lowlight = createLowlight()
lowlight.register({
  js, python, bash, ts: typescript, css, html: htmlLang,
  java, cpp, rust, go, sql, json, yaml, md: markdown,
  kt: kotlin, swift,
})

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseInline(text) {
  let result = escapeHtml(text)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  result = result.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>')
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>')
  result = result.replace(/_(.+?)_/g, '<em>$1</em>')
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>')
  result = result.replace(/==(.+?)==/g, '<mark>$1</mark>')
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>')
  return result
}

function highlightCode(code, lang) {
  if (lang && lowlight.registered(lang)) {
    try {
      const result = lowlight.highlight(lang, code)
      return result.children.map(toHtml).join('')
    } catch {
      return escapeHtml(code)
    }
  }
  return escapeHtml(code)
}

function toHtml(node) {
  if (node.type === 'text') return node.value
  if (node.type === 'element') {
    const attrs = Object.entries(node.properties || {})
      .map(([k, v]) => {
        const attrName = k.replace(/([A-Z])/g, '-$1').toLowerCase()
        if (v === true) return attrName
        if (v === false) return ''
        return `${attrName}="${Array.isArray(v) ? v.join(' ') : v}"`
      })
      .filter(Boolean)
      .join(' ')
    const inner = (node.children || []).map(toHtml).join('')
    return attrs ? `<${node.tagName} ${attrs}>${inner}</${node.tagName}>` : `<${node.tagName}>${inner}</${node.tagName}>`
  }
  return ''
}

function parseTable(lines) {
  const headerCells = lines[0].split('|').filter(c => c.trim()).map(c => c.trim())
  const alignRow = lines[1].split('|').filter(c => c.trim())
  const alignments = alignRow.map(cell => {
    const trimmed = cell.trim()
    if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center'
    if (trimmed.endsWith(':')) return 'right'
    return 'left'
  })
  const rows = lines.slice(2).map(line =>
    line.split('|').filter(c => c.trim()).map(c => c.trim())
  )
  return { headerCells, alignments, rows }
}

function renderTable(lines) {
  const { headerCells, alignments, rows } = parseTable(lines)
  let html = '<table><thead><tr>'
  headerCells.forEach((cell, i) => {
    const align = alignments[i] ? ` style="text-align:${alignments[i]}"` : ''
    html += `<th${align}>${parseInline(cell)}</th>`
  })
  html += '</tr></thead><tbody>'
  rows.forEach(row => {
    html += '<tr>'
    row.forEach((cell, i) => {
      const align = alignments[i] ? ` style="text-align:${alignments[i]}"` : ''
      html += `<td${align}>${parseInline(cell)}</td>`
    })
    html += '</tr>'
  })
  html += '</tbody></table>'
  return html
}

export function markdownToHtml(md) {
  const lines = md.split('\n')
  let html = ''
  let i = 0
  let inCodeBlock = false
  let codeLang = ''
  let codeContent = ''
  let inList = null
  let listItems = []
  let inTable = false
  let tableLines = []
  let inBlockquote = false
  let blockquoteLines = []

  function flushList() {
    if (inList && listItems.length > 0) {
      html += `<${inList}>${listItems.join('')}</${inList}>`
      inList = null
      listItems = []
    }
  }

  function flushBlockquote() {
    if (inBlockquote && blockquoteLines.length > 0) {
      const content = blockquoteLines.join('\n')
      html += `<blockquote>${markdownToHtml(content)}</blockquote>`
      inBlockquote = false
      blockquoteLines = []
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    if (inCodeBlock) {
      if (line.trimStart().startsWith('```')) {
        const highlighted = highlightCode(codeContent, codeLang)
        html += `<pre><code class="hljs language-${codeLang}">${highlighted}</code></pre>`
        inCodeBlock = false
        codeContent = ''
        codeLang = ''
      } else {
        codeContent += (codeContent ? '\n' : '') + line
      }
      i++
      continue
    }

    if (line.trimStart().startsWith('```')) {
      flushList()
      flushBlockquote()
      inCodeBlock = true
      codeLang = line.trimStart().slice(3).trim() || 'text'
      i++
      continue
    }

    if (inTable) {
      if (line.trim() === '' || !line.includes('|')) {
        html += renderTable(tableLines)
        inTable = false
        tableLines = []
        continue
      }
      tableLines.push(line)
      i++
      continue
    }

    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s\-:|]+\|/.test(lines[i + 1])) {
      flushList()
      flushBlockquote()
      inTable = true
      tableLines = [line]
      i++
      continue
    }

    if (line.trimStart().startsWith('>')) {
      flushList()
      inBlockquote = true
      blockquoteLines.push(line.replace(/^\s*>\s?/, ''))
      i++
      continue
    } else if (inBlockquote) {
      flushBlockquote()
    }

    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      flushList()
      flushBlockquote()
      html += '<hr />'
      i++
      continue
    }

    if (line.trim() === '') {
      flushList()
      flushBlockquote()
      i++
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)/)
    if (headingMatch) {
      flushList()
      flushBlockquote()
      const level = headingMatch[1].length
      const text = headingMatch[2]
      html += `<h${level}>${parseInline(text)}</h${level}>`
      i++
      continue
    }

    const ulMatch = line.match(/^\s*[-*+]\s+(.*)/)
    const olMatch = line.match(/^\s*\d+\.\s+(.*)/)
    if (ulMatch) {
      if (inList !== 'ul') flushList()
      flushBlockquote()
      inList = 'ul'
      listItems.push(`<li>${parseInline(ulMatch[1])}</li>`)
      i++
      continue
    }
    if (olMatch) {
      if (inList !== 'ol') flushList()
      flushBlockquote()
      inList = 'ol'
      listItems.push(`<li>${parseInline(olMatch[1])}</li>`)
      i++
      continue
    }

    flushList()
    flushBlockquote()
    html += `<p>${parseInline(line)}</p>`
    i++
  }

  if (inCodeBlock) {
    const highlighted = highlightCode(codeContent, codeLang)
    html += `<pre><code class="hljs language-${codeLang}">${highlighted}</code></pre>`
  }
  flushList()
  flushBlockquote()
  if (inTable) {
    html += renderTable(tableLines)
  }

  return html
}
