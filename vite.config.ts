import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/webhooks': 'http://localhost:8787',
      '/api': 'http://localhost:8787',
      '/health': 'http://localhost:8787',
    },
  },
})
