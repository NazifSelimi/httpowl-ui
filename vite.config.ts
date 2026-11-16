import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // `@/x` means `src/x` everywhere (also set in tsconfig.json "paths").
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    // `npm run dev` talks to a local API (`go run ./cmd/api` in httpowl-api).
    // Set VITE_API_TARGET=https://httpowl.net to use the live API instead.
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://127.0.0.1:8090',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
