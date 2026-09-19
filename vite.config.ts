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
  preview: {
    port: 4173,
    proxy: {
      '/webhooks': 'http://localhost:8787',
      '/api': 'http://localhost:8787',
      '/health': 'http://localhost:8787',
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor'
          if (id.includes('node_modules/lucide-react')) return 'icons'
        },
      },
    },
  },
})
