import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// One self-contained twenty.html: JS, CSS and fonts inlined, hash routing.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  css: { preprocessorOptions: { scss: { api: 'modern-compiler' } } },
  define: { 'import.meta.env.VITE_SINGLE': 'true' },
  build: { outDir: 'dist-single', assetsInlineLimit: 100000000, chunkSizeWarningLimit: 5000 },
});
