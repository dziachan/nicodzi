import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the project site is served from /<repo>/, so the build needs
// a matching base path. During local dev we keep it at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/nicodzi/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
}))
