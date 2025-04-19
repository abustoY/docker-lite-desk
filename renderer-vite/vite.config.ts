import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

import path from 'path';

export default defineConfig({
  base: './',
  plugins: [vue(), vuetify()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  build: {
    outDir: 'dist'
  }
});