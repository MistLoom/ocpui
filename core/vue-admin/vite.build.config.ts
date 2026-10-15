/**
 * @ocpui/vue-admin 发布构建（vite library mode + preserveModules）
 *
 * - 产物：dist/ 下的 .js（ESM，保留模块结构以便 tree-shaking）+ dist/ocpui-vue-admin.css（SFC 样式）
 * - 浏览器入口与 Node 入口（vite / nuxt 插件）分开构建：见 BUILD_TARGET
 * - workspace 开发不走 dist：package.json `exports` 仍指向 src，发布时由 `publishConfig.exports` 覆盖为 dist
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { builtinModules } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8'));
const deps = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
];
const isExternal = (id: string) =>
  id.startsWith('node:') ||
  builtinModules.includes(id) ||
  deps.some((d) => id === d || id.startsWith(`${d}/`)) ||
  id.startsWith('@ocpui/') ||
  /^(vite|unplugin-|@vue\/|@nuxt\/|@tiptap\/|@floating-ui\/)/.test(id);

const target = process.env.BUILD_TARGET === 'node' ? 'node' : 'browser';

const browserEntries: Record<string, string> = {
  index: 'src/index.ts',
  'validation/index': 'src/validation/index.ts',
  'patterns/index': 'src/patterns/index.ts',
};
const nodeEntries: Record<string, string> = {
  'vite/index': 'src/vite/index.ts',
};

export default defineConfig({
  plugins: target === 'browser' ? [vue()] : [],
  resolve: { alias: [{ find: /^@\//, replacement: `${resolve(__dirname, 'src')}/` }] },
  build: {
    outDir: 'dist',
    emptyOutDir: target === 'browser',
    sourcemap: true,
    minify: false,
    ssr: target === 'node',
    cssCodeSplit: false,
    lib: {
      entry: target === 'browser' ? browserEntries : nodeEntries,
      formats: ['es'],
      cssFileName: 'ocpui-vue-admin',
    },
    rollupOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
