/**
 * printUtils.ts — Print injection utilities for 한글MD 1.0
 * Implements: token substitution (Rule B), page splitting (Rule A), print DOM generation.
 */

import { PrintSettings } from './types';

// ========== Token Substitution (Rule B — no regex) ==========

const ESC_PAGE = '__HANGEULMD_ESC_PAGE__';
const ESC_PAGES = '__HANGEULMD_ESC_PAGES__';

function replaceAllLiteral(haystack: string, needle: string, value: string): string {
  if (!needle) return haystack;
  return haystack.split(needle).join(value);
}

export function substituteTokens(
  text: string,
  pageNum: number,
  totalPages: number
): string {
  let s = text ?? '';

  // 1) protect escapes
  s = replaceAllLiteral(s, '\\{pages\\}', ESC_PAGES);
  s = replaceAllLiteral(s, '\\{page\\}', ESC_PAGE);

  // 2) replace tokens (pages first)
  s = replaceAllLiteral(s, '{pages}', String(totalPages));
  s = replaceAllLiteral(s, '{page}', String(pageNum));

  // 3) restore escaped literals
  s = replaceAllLiteral(s, ESC_PAGES, '{pages}');
  s = replaceAllLiteral(s, ESC_PAGE, '{page}');

  return s;
}

// ========== Header/Footer Row Builder ==========

export function buildHeaderFooterRowHtml(
  left: string,
  center: string,
  right: string,
  pageNum: number,
  totalPages: number
): string {
  const l = substituteTokens(left, pageNum, totalPages);
  const c = substituteTokens(center, pageNum, totalPages);
  const r = substituteTokens(right, pageNum, totalPages);

  return `<div>${l}</div><div>${c}</div><div>${r}</div>`;
}

// ========== Split Content at .page-break-node (querySelectorAll + Range) ==========

export function splitAtPageBreaks(editorHtml: string): string[] {
  const root = document.createElement('div');
  root.innerHTML = editorHtml;

  const breaks = Array.from(root.querySelectorAll('.page-break-node'));

  if (breaks.length === 0) return [root.innerHTML];

  const segments: string[] = [];

  const rangeToHtml = (range: Range): string => {
    const wrapper = document.createElement('div');
    wrapper.appendChild(range.cloneContents());
    return wrapper.innerHTML;
  };

  const safeStart = root.firstChild;
  if (!safeStart) return [''];

  // Segment 0: before first break
  {
    const r = document.createRange();
    r.setStartBefore(safeStart);
    r.setEndBefore(breaks[0]);
    segments.push(rangeToHtml(r));
  }

  // Middle segments: between breaks
  for (let i = 0; i < breaks.length - 1; i++) {
    const r = document.createRange();
    r.setStartAfter(breaks[i]);
    r.setEndBefore(breaks[i + 1]);
    segments.push(rangeToHtml(r));
  }

  // Last segment: after last break
  {
    const r = document.createRange();
    r.setStartAfter(breaks[breaks.length - 1]);
    if (root.lastChild) {
      r.setEndAfter(root.lastChild);
    }
    segments.push(rangeToHtml(r));
  }

  return segments;
}

// ========== Page Numbering ==========

export function computePageNumber(segmentIndex: number, excludeFirstPage: boolean): number {
  return excludeFirstPage ? segmentIndex : segmentIndex + 1;
}

// ========== Main Print DOM Preparation ==========

export function preparePrintDOM(editorHtml: string, settings: PrintSettings): void {
  // Step 1: container
  const container = document.createElement('div');
  container.className = 'print-container';
  document.body.appendChild(container);

  // Step 2: split
  const segments = splitAtPageBreaks(editorHtml);

  // Step 3: counts
  const totalPhysicalPages = segments.length;
  const totalPrintablePages = settings.excludeFirstPage
    ? Math.max(0, totalPhysicalPages - 1)
    : totalPhysicalPages;

  // Step 4: build pages
  for (let i = 0; i < segments.length; i++) {
    const page = document.createElement('div');
    page.className = 'print-page';

    const skipHF = settings.excludeFirstPage && i === 0;
    const pageNum = computePageNumber(i, settings.excludeFirstPage);

    if (!skipHF) {
      const header = document.createElement('div');
      header.className = 'print-header';
      header.innerHTML = buildHeaderFooterRowHtml(
        settings.headerLeft,
        settings.headerCenter,
        settings.headerRight,
        pageNum,
        totalPrintablePages
      );
      page.appendChild(header);
    }

    const body = document.createElement('div');
    body.className = 'print-page-body tiptap-content';
    body.innerHTML = segments[i];
    page.appendChild(body);

    if (!skipHF) {
      const footer = document.createElement('div');
      footer.className = 'print-footer';
      footer.innerHTML = buildHeaderFooterRowHtml(
        settings.footerLeft,
        settings.footerCenter,
        settings.footerRight,
        pageNum,
        totalPrintablePages
      );
      page.appendChild(footer);
    }

    container.appendChild(page);
  }

  // Step 5: cleanup hook
  cleanupPrintContainer(container);

  // Step 6: print
  window.print();
}

export function cleanupPrintContainer(container: HTMLElement): void {
  const handler = () => {
    container.remove();
    window.removeEventListener('afterprint', handler);
  };
  window.addEventListener('afterprint', handler);
}
