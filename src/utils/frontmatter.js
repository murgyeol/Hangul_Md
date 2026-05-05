import matter from 'gray-matter'

export function parseMatter(content) {
  try {
    const parsed = matter(content)
    return {
      data: parsed.data,
      content: parsed.content,
    }
  } catch {
    return {
      data: {},
      content,
    }
  }
}

export function stringifyMatter(content, data) {
  try {
    return matter.stringify(content, data)
  } catch {
    return content
  }
}
