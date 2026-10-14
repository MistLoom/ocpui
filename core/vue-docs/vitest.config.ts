import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const vueRuntime = require.resolve('vue/dist/vue.runtime.esm-bundler.js');
const vueRuntimeCore = require.resolve('@vue/runtime-core/dist/runtime-core.esm-bundler.js');
const vueRuntimeDom = require.resolve('@vue/runtime-dom/dist/runtime-dom.esm-bundler.js');

/** 构建期由 docgen 注入的虚拟模块，单测环境提供空实现 */
const virtualDocDemosStub = {
  name: 'virtual-ocp-doc-demos-stub',
  resolveId(id: string) {
    if (id === 'virtual:ocp-doc-demos') {
      return '\0virtual:ocp-doc-demos';
    }
    return undefined;
  },
  load(id: string) {
    if (id === '\0virtual:ocp-doc-demos') {
      return 'export async function loadDocDemo() { return null; }';
    }
    return undefined;
  },
};

export default defineConfig({
  plugins: [vue(), virtualDocDemosStub],
  resolve: {
    dedupe: ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
    alias: [
      { find: '@ocpui/markdown-core', replacement: resolve(__dirname, '../../tool/markdown-core/src/index.ts') },
      { find: '@ocpui/vue/feedback', replacement: resolve(__dirname, '../vue/src/components/feedback/index.ts') },
      { find: '@ocpui/vue/composables/useUiT', replacement: resolve(__dirname, '../vue/src/composables/useUiT.ts') },
      { find: '@ocpui/vue/utility', replacement: resolve(__dirname, '../vue/src/components/utility/index.ts') },
      { find: '@ocpui/vue', replacement: resolve(__dirname, '../vue/src') },
      { find: 'vue', replacement: vueRuntime },
      { find: '@vue/runtime-core', replacement: vueRuntimeCore },
      { find: '@vue/runtime-dom', replacement: vueRuntimeDom },
    ],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    server: {
      deps: {
        inline: ['vue', '@vue/test-utils'],
      },
    },
  },
});
