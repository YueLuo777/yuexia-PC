import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // The workbench is loaded as one lazy route; keep its current 612 KB chunk from
    // producing a misleading warning while the route-level split remains intact.
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 18328,
    proxy: {
      '/pinai-proxy': {
        target: 'https://us.pinai-cn.com',
        changeOrigin: true,
        secure: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/pinai-proxy/, ''),
      },
    },
  },
});
