import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'ES2022',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'diff-lib': ['diff', 'diff-match-patch'],
          'parsers': ['mammoth', 'pdfjs-dist', 'htmlparser2', 'turndown'],
          'search': ['fuse.js'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
});
