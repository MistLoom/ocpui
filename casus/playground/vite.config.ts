import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ocpuiResolvePlugin } from '../../tool/docgen/src/vite/plugin-ocpui-resolve.ts';
import { docDemosPlugin } from '../../tool/docgen/src/vite/plugin-doc-demos.ts';
import { ocpuiComponents } from '../../core/vue/src/vite/index.ts';
import { playgroundDocPrecompilePlugin } from './src/vite/plugin-playground-doc-precompile.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ocpuiVueAdminRoot = path.resolve(__dirname, '../../core/vue-admin');
const srcDir = path.resolve(__dirname, 'src');

export default defineConfig({
  plugins: [
    ocpuiResolvePlugin(),
    // playground 预编译链不产出 inline vue-demo，提供空 registry 仅为满足 vue-docs 对 virtual:ocp-doc-demos 的静态解析
    docDemosPlugin({ getRegistry: () => ({}) }),
    playgroundDocPrecompilePlugin(),
    vue(),
    ocpuiComponents({
      root: __dirname,
      adminPkgRoot: ocpuiVueAdminRoot,
      dts: path.resolve(srcDir, 'components.d.ts'),
    }),
  ],
  resolve: {
    alias: {
      '@': srcDir,
    },
    // micromark 等 unified 包在 development 条件下指向缺失的 dev/ 入口
    conditions: ['browser', 'module', 'import', 'default'],
  },
  optimizeDeps: {
    include: ['shiki', '@shikijs/rehype'],
    esbuildOptions: {
      conditions: ['browser', 'module', 'import', 'default'],
    },
  },
  server: {
    port: 5175,
    open: true,
  },
});
