import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  build: {
    target: 'ES2022',
    minify: 'terser',
    outDir: 'dist-standalone',
  },
  plugins: [viteSingleFile()],
});
