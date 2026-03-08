import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'ES2022',
    minify: 'esbuild',
  },
  server: {
    port: 5173,
  },
});
