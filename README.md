# 한글MD 1.0 (HangeulMD 1.0)

Ultra-lightweight desktop Markdown editor for the paste-to-print workflow.

## Features

- Paste LLM-generated Markdown and see pixel-consistent WYSIWYG rendering
- Print or export to PDF on A4 with professional headers/footers/page numbering
- Horizontal rules (`---`) always represent page breaks (Rule A)
- Token substitution `{page}` / `{pages}` in headers/footers (Rule B)
- Retro Windows-style toolbar UI
- Syntax highlighting for code blocks
- Table support
- Cover page insertion

## Tech Stack

- **Tauri v2** - Native desktop shell (Windows)
- **React 18 + Vite** - Frontend framework
- **Tailwind CSS v3** - Styling
- **Tiptap v2** - WYSIWYG editor (ProseMirror-based)
- **tiptap-markdown 0.8.x** - Markdown I/O
- **gray-matter** - YAML front-matter parsing
- **lowlight** - Syntax highlighting

## Development

```bash
# Install dependencies
npm install

# Run frontend dev server (browser preview)
npm run dev

# Run as Tauri desktop app (requires Rust toolchain)
npm run tauri dev

# Build for production
npm run tauri build
```

## File Format

Saves/loads only `.md` files. Print settings are stored as YAML front-matter.

## License

Private project.
