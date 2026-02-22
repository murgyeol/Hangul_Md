/// <reference types="vite/client" />

declare module 'gray-matter' {
  interface GrayMatterOption {
    excerpt?: boolean | ((file: any) => void);
  }
  interface GrayMatterFile {
    data: Record<string, any>;
    content: string;
    excerpt?: string;
    orig: string;
  }
  function matter(input: string, options?: GrayMatterOption): GrayMatterFile;
  namespace matter {
    function stringify(content: string, data: Record<string, any>): string;
  }
  export = matter;
}

declare module 'tiptap-markdown' {
  import { Extension } from '@tiptap/core';
  const Markdown: Extension;
  export { Markdown };
}
