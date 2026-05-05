import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_ENV_DEBUG == 'true' ? 'esnext' : ['es2021', 'chrome100', 'safari14'],
    minify: process.env.TAURI_ENV_DEBUG != 'true',
  },
})
