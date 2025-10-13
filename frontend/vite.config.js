import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    viteCommonjs(),
  ],
  optimizeDeps: {
    exclude: [
      '@cornerstonejs/dicom-image-loader',
      '@cornerstonejs/core',
      '@cornerstonejs/tools',
    ],
    include: [
      'dicom-parser',
      'xmlbuilder2 > xmlbuilder2/lib/index.js',
    ],
  },
  worker: {
    format: 'es',
  },
  assetsInclude: [
    '**/*.wasm',
    '**/*.wasm?raw',
  ],
  resolve: {
    alias: [
      {
        find: 'xmlbuilder2/lib/xmlbuilder2.min.js',
        replacement: path.resolve(__dirname, 'node_modules/xmlbuilder2/lib/index.js')
      },
      {
        find: /^xmlbuilder2$/,
        replacement: path.resolve(__dirname, 'node_modules/xmlbuilder2/lib/index.js')
      },
    ],
  },
});