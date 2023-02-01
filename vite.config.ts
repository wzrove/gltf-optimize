import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: [
      {
        find: /\/@\//,
        replacement: pathResolve('src') + '/',
      },
    ],
  },
  build: {
    outDir: './server/dist',
    rollupOptions: {
      output: {
        manualChunks: {
          123: ['vue'],
          333: ['three'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/uploadFile': 'http://localhost:3000/',
    },
  },
});
