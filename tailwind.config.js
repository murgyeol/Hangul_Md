/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#2D2D2D',
        'titlebar-bg': '#1E1E1E',
        'toolbar-bg': '#C0C0C0',
        'toolbar-face': '#DFDFDF',
        'toolbar-highlight': '#FFFFFF',
        'toolbar-shadow': '#808080',
        'a4-paper': '#FFFFFF',
        'editor-text': '#1A1A1A',
        'page-break-line': '#4A90D9',
        'page-break-label': '#888888',
        'active-btn': '#A0A0A0',
        'print-hf': '#888888',
      },
      fontFamily: {
        'body': ['"Malgun Gothic"', '"Segoe UI"', 'sans-serif'],
        'code': ['Consolas', '"D2Coding"', 'monospace'],
      },
    },
  },
  plugins: [],
};
