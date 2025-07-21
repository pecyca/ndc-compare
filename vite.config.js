// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            // ✅ For local Netlify function testing
            '/netlify/functions': {
                target: 'http://localhost:8888',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/netlify\/functions/, ''),
            },

            // ✅ Proxy API calls to Express backend (e.g. /api/drug-info, /api/shortage-status)
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },

            // ✅ Proxy RxNav calls (e.g. /proxy/rxnav/rxcui.json?id=...)
            '/proxy': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
});
