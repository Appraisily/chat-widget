import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { terser } from 'rollup-plugin-terser';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, './src/widget/index.tsx'),
      name: 'AppraisilyChatWidget',
      fileName: 'widget',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true,
        manualChunks: undefined
      },
      plugins: [
        terser({
          format: {
            comments: false
          },
          compress: {
            passes: 2
          }
        })
      ]
    },
    sourcemap: false,
    minify: 'terser'
  }
});