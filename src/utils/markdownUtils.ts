/**
 * markdownUtils.ts — Markdown <-> Tiptap conversion
 * Primary path: tiptap-markdown 0.8.x storage API
 * Fallback: markdown-it + turndown (if primary unavailable)
 */

import type { Editor } from '@tiptap/core';

let useFallback = false;
let fallbackInitialized = false;

// Fallback modules (loaded only if needed)
let mdParser: any = null;
let turndownService: any = null;

/**
 * Check if tiptap-markdown primary path is available
 */
export function checkConversionPath(editor: Editor): 'primary' | 'fallback' {
  const hasParse = typeof editor.storage.markdown?.parser?.parse === 'function';
  const hasGetMd = typeof editor.storage.markdown?.getMarkdown === 'function';

  if (hasParse && hasGetMd) {
    console.log('[HangeulMD] Markdown conversion: primary path (tiptap-markdown 0.8.x)');
    return 'primary';
  }

  console.warn('[HangeulMD] Markdown conversion: fallback path (markdown-it + turndown)');
  useFallback = true;
  return 'fallback';
}

/**
 * Initialize fallback converters (lazy)
 */
async function initFallback(): Promise<void> {
  if (fallbackInitialized) return;
  try {
    const [markdownItModule, turndownModule, gfmModule] = await Promise.all([
      import('markdown-it'),
      import('turndown'),
      import('turndown-plugin-gfm'),
    ]);

    const MarkdownIt = markdownItModule.default || markdownItModule;
    const TurndownService = turndownModule.default || turndownModule;
    const { gfm } = gfmModule;

    mdParser = new MarkdownIt({ html: false, linkify: true });
    turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
    turndownService.use(gfm);
    fallbackInitialized = true;
  } catch (e) {
    console.error('[HangeulMD] Failed to init fallback converters:', e);
  }
}

/**
 * Convert Markdown string to HTML for editor.setContent()
 */
export function markdownToHtml(editor: Editor, md: string): string {
  if (!useFallback) {
    try {
      return editor.storage.markdown.parser.parse(md);
    } catch (e) {
      console.warn('[HangeulMD] Primary parse failed, falling back:', e);
      useFallback = true;
    }
  }

  // Fallback: simple conversion
  if (mdParser) {
    return mdParser.render(md);
  }

  // Ultra-fallback: return basic HTML wrapping
  return md
    .split('\n')
    .map((line: string) => `<p>${line}</p>`)
    .join('');
}

/**
 * Get Markdown string from editor content
 */
export function getMarkdownString(editor: Editor): string {
  if (!useFallback) {
    try {
      return editor.storage.markdown.getMarkdown();
    } catch (e) {
      console.warn('[HangeulMD] Primary getMarkdown failed, falling back:', e);
      useFallback = true;
    }
  }

  // Fallback
  if (turndownService) {
    return turndownService.turndown(editor.getHTML());
  }

  // Ultra-fallback: return text content
  return editor.getText();
}

/**
 * Initialize conversion system
 */
export async function initMarkdownConversion(editor: Editor): Promise<void> {
  const path = checkConversionPath(editor);
  if (path === 'fallback') {
    await initFallback();
  }
}
