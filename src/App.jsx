import { useState, useEffect } from 'react'
import { open, save } from '@tauri-apps/plugin-dialog'
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import Toolbar from './components/Toolbar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import { parseMatter, stringifyMatter } from './utils/frontmatter'
import { markdownToHtml } from './utils/markdown'

function App() {
  const [markdown, setMarkdown] = useState('# 안녕하세요\n\n한글MD 1.0에 오신 것을 환영합니다.\n\n---\n\n## 기능 소개\n\n- **Paste-to-Print**: LLM이 생성한 Markdown을 붙여넣고 바로 인쇄하세요\n- **WYSIWYG 편집**:所见即所得 편집 환경\n- **페이지 구분**: `---`로 페이지를 구분합니다\n- **PDF 내보내기**: A4 용지에 전문적인 헤더/푸터와 함께 출력')
  const [currentFile, setCurrentFile] = useState(null)
  const [viewMode, setViewMode] = useState('split')
  const [printSettings, setPrintSettings] = useState({
    header: '',
    footer: '{page} / {pages}',
    showHeader: false,
    showFooter: true,
    fontSize: 14,
    fontFamily: 'Noto Sans KR',
  })
  const [statusText, setStatusText] = useState('준비됨')

  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length
  const charCount = markdown.length

  async function handleOpen() {
    try {
      const selected = await open({
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
      })
      if (selected) {
        const content = await readTextFile(selected)
        const { data, content: md } = parseMatter(content)
        setMarkdown(md)
        setCurrentFile(selected)
        if (data.header !== undefined) {
          setPrintSettings(prev => ({ ...prev, ...data }))
        }
        setStatusText(`열림: ${selected}`)
      }
    } catch (e) {
      setStatusText(`파일 열기 실패: ${e}`)
    }
  }

  async function handleSave() {
    try {
      let filePath = currentFile
      if (!filePath) {
        filePath = await save({
          filters: [{ name: 'Markdown', extensions: ['md'] }],
        })
      }
      if (filePath) {
        const yamlData = {
          header: printSettings.header || undefined,
          footer: printSettings.footer || undefined,
          showHeader: printSettings.showHeader || undefined,
          showFooter: printSettings.showFooter === false ? false : undefined,
          fontSize: printSettings.fontSize !== 14 ? printSettings.fontSize : undefined,
        }
        Object.keys(yamlData).forEach(k => yamlData[k] === undefined && delete yamlData[k])
        const content = stringifyMatter(markdown, yamlData)
        await writeTextFile(filePath, content)
        setCurrentFile(filePath)
        setStatusText(`저장됨: ${filePath}`)
      }
    } catch (e) {
      setStatusText(`파일 저장 실패: ${e}`)
    }
  }

  async function handleSaveAs() {
    currentFile && setCurrentFile(null)
    await handleSave()
  }

  async function handlePrint() {
    const html = markdownToHtml(markdown)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const headerHtml = printSettings.showHeader && printSettings.header
        ? `<div class="print-header">${printSettings.header.replace(/\{page\}/g, '<span class="page-num"></span>').replace(/\{pages\}/g, '<span class="total-pages"></span>')}</div>`
        : ''
      const footerHtml = printSettings.showFooter && printSettings.footer
        ? `<div class="print-footer">${printSettings.footer.replace(/\{page\}/g, '<span class="page-num"></span>').replace(/\{pages\}/g, '<span class="total-pages"></span>')}</div>`
        : ''

      printWindow.document.write(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>인쇄 - 한글MD</title>
<style>
  @page { size: A4; margin: 0; }
  body { font-family: '${printSettings.fontFamily}', sans-serif; font-size: ${printSettings.fontSize}px; line-height: 1.6; }
  .page { width: 210mm; min-height: 297mm; padding: 20mm 15mm; position: relative; box-sizing: border-box; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .print-header { position: absolute; top: 10mm; left: 15mm; right: 15mm; font-size: 10px; color: #666; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  .print-footer { position: absolute; bottom: 10mm; left: 15mm; right: 15mm; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 4px; text-align: right; }
  h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
  h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
  h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
  p { margin: 1em 0; }
  ul, ol { padding-left: 1.5em; margin: 1em 0; }
  code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: Consolas, monospace; }
  pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 3px solid #ccc; padding-left: 1em; color: #666; }
  hr { border: none; border-top: 2px dashed #ccc; margin: 2em 0; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #ddd; padding: 8px; }
  th { background: #f5f5f5; font-weight: bold; }
  a { color: #0366d6; }
  img { max-width: 100%; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>
<div class="page">${headerHtml}${html}${footerHtml}</div>
</body>
</html>`)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
    setStatusText('인쇄 창 열림')
  }

  function handleInsertCoverPage() {
    const coverMd = `---
title: 제목
author: 작성자
date: ${new Date().toLocaleDateString('ko-KR')}
---

# 제목

작성자: 작성자  
작성일: ${new Date().toLocaleDateString('ko-KR')}

---

`
    setMarkdown(coverMd + markdown)
    setStatusText('커버 페이지 삽입됨')
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault()
        handleOpen()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        handlePrint()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className="flex flex-col h-screen bg-[#c0c0c0]">
      <div className="retro-title-bar">
        <span>한글MD 1.0{currentFile ? ` - ${currentFile.split('/').pop()}` : ' - 새 문서'}</span>
        <div className="flex gap-1">
          <button className="w-5 h-5 bg-[#c0c0c0] border border-white border-b-gray-600 border-r-gray-600 text-xs flex items-center justify-center">_</button>
          <button className="w-5 h-5 bg-[#c0c0c0] border border-white border-b-gray-600 border-r-gray-600 text-xs flex items-center justify-center">□</button>
          <button className="w-5 h-5 bg-[#c0c0c0] border border-white border-b-gray-600 border-r-gray-600 text-xs flex items-center justify-center">×</button>
        </div>
      </div>

      <Toolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onPrint={handlePrint}
        onInsertCover={handleInsertCoverPage}
      />

      <div className="flex-1 flex overflow-hidden retro-window mx-1 mt-0 mb-1">
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2' : 'w-full'}>
            <Editor markdown={markdown} onChange={setMarkdown} />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2' : 'w-full'}>
            <Preview markdown={markdown} printSettings={printSettings} setPrintSettings={setPrintSettings} />
          </div>
        )}
      </div>

      <div className="status-bar">
        <span>{statusText}</span>
        <span>{charCount}자 | {wordCount}단어</span>
      </div>
    </div>
  )
}

export default App
