import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist']
        }
      }
    },
    // Ensure public assets are copied
    assetsDir: 'assets',
    copyPublicDir: true
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  publicDir: 'public'
})