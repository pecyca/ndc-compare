import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/netlify/functions': {
                target: 'http://localhost:8888', // Netlify dev server
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/netlify\/functions/, ''),
            },
        },
    },
});
