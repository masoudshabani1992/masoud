import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = 'https://manooshorganic.com'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    watch: { ignored: ['**/android/**', '**/dist/**'] },
    proxy: {
      '/api/store': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api\/store/, '/wp-json/wc/store/v1'),
        headers: { 'User-Agent': 'Mozilla/5.0 ManooshApp' },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
})
