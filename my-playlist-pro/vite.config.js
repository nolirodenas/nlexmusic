import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: '/nlexmusic/',   // 👈 IMPORTANT: needed for GitHub Pages
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/Music%20Playlist%20App/my-playlist-pro',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/pages': {
        target: 'http://localhost/Music%20Playlist%20App/my-playlist-pro',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/pages/, '/pages')
      }
    }
  }
})
