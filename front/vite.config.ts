import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
            // 네이버 검색 API 프록시
            '/naver-search': {
                target: 'https://openapi.naver.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/naver-search/, ''),
                secure: false,
            },
        },
    },
})