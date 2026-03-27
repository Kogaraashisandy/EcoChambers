import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,      // ← esto es lo que soluciona el problema en Windows
      interval: 1000,        // revisa cambios cada 1 segundo
    },
    proxy: {
      '/api': 'http://backend:8000'
    }
  }
})