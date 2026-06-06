import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The dev server proxies /api and /h2-console to the Spring Boot backend on :8080
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/h2-console': 'http://localhost:8080',
    },
  },
})
