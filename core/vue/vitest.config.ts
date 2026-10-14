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
      { find: '@ocpui/vue/composables/useUiT', replacement: resolve(__dirname, './src/composables/useUiT.ts') },
      { find: '@ocpui/vue/types', replacement: resolve(__dirname, './src/types/index.ts') },
      { find: 'vue', replacement: vueRuntime },
      { find: '@', replacement: resolve(__dirname, './src') },
    ],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      // 依赖完整 Vue 运行时挂载，待 monorepo 内 vue 去重后恢复
      'src/components/utility/__tests__/RefreshButton.spec.ts',
      'src/components/data-entry/__tests__/Suggestion.spec.ts',
    ],
    server: {
      deps: {
        inline: ['vue', '@vue/test-utils'],
      },
    },
  },
});
