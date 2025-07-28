// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    viteCommonjs({
      // Опции interop (например, 'compat', 'node') могут понадобиться для сложных CJS зависимостей,
      // но часто 'auto' (по умолчанию) достаточно.
      // interop: 'auto',
    }),
  ],
  optimizeDeps: {
    exclude: [
      // Пакеты, которые Vite не должен предварительно собирать (pre-bundle)
      '@cornerstonejs/dicom-image-loader',
      '@cornerstonejs/core',
      '@cornerstonejs/tools',
      // 'xmlbuilder2', // Можно оставить, если 'include' ниже недостаточно
    ],
    include: [
      // Пакеты, которые Vite должен принудительно включить в оптимизацию
      'dicom-parser',
      // Для проблемных CommonJS зависимостей, таких как xmlbuilder2:
      // Указываем Vite оптимизировать конкретный CommonJS файл, на который мы сделаем алиас.
      'xmlbuilder2 > xmlbuilder2/lib/index.js',
    ],
  },
  worker: {
    // Формат для Web Workers, используемых Cornerstone
    format: 'es',
  },
  assetsInclude: [
    // Указываем Vite обрабатывать WASM файлы как статические ассеты (важно для кодеков)
    '**/*.wasm',
    '**/*.wasm?raw',
  ],
  resolve: {
    alias: [
      // Алиас для решения проблемы с импортом `xmlbuilder2.min.js` из `vtk.js` (зависимость `@cornerstonejs/core`)
      {
        find: 'xmlbuilder2/lib/xmlbuilder2.min.js',
        replacement: path.resolve(__dirname, 'node_modules/xmlbuilder2/lib/index.js')
      },
      // Дополнительный алиас для общего импорта 'xmlbuilder2', чтобы обеспечить консистентность
      {
        find: /^xmlbuilder2$/, // Точное совпадение
        replacement: path.resolve(__dirname, 'node_modules/xmlbuilder2/lib/index.js')
      },
      // Если возникнет ошибка "No known conditions for "./types" specifier in "@cornerstonejs/core" package"
      // (Troubleshooting #2 из документации Cornerstone), может понадобиться следующий алиас:
      // {
      //   find: "@cornerstonejs/core",
      //   replacement: path.resolve(__dirname, 'node_modules/@cornerstonejs/core/dist/esm/index.js') // или другой актуальный путь к ESM входу
      // },
    ],
  },
  // Если возникнет проблема с минификацией имен инструментов (Troubleshooting #3),
  // можно добавить для отладки:
  /*
  build: {
    minify: false,
  }
  */
});