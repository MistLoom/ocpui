import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const vueRuntime = require.resolve('vue/dist/vue.runtime.esm-bundler.js');

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
    alias: [
      { find: 'vue', replacement: vueRuntime },
      { find: '@', replacement: resolve(__dirname, './src') },
    ],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/**', 'dist/**'],
    server: {
      deps: {
        inline: ['vue', '@vue/test-utils'],
      },
    },
  },
});
