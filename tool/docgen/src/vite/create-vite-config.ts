import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { mergeConfig, type AliasOptions, type UserConfig } from 'vite';
import type { ResolvedDocgenConfig } from '../config.js';
import { docgenPlugin } from './plugin-docgen.js';
import { docDemosPlugin } from './plugin-doc-demos.js';
import { ocpuiResolvePlugin } from './plugin-ocpui-resolve.js';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function createOcpuiAlias(): AliasOptions {
  const ocpuiVueRoot = path.resolve(PKG_ROOT, '../../core/vue');
  const ocpuiVueDocsRoot = path.resolve(PKG_ROOT, '../../core/vue-docs');

  return [
    { find: '@ocpui/vue/styles/full', replacement: path.resolve(ocpuiVueRoot, 'src/themes/styles.css') },
    { find: '@ocpui/vue/styles', replacement: path.resolve(ocpuiVueRoot, 'src/themes/globals.css') },
    { find: '@ocpui/vue-docs/styles/doc-reading', replacement: path.resolve(ocpuiVueDocsRoot, 'src/styles/doc-reading.css') },
  ];
}

/** 生成 Vite 配置（dev / build / preview 共用） */
export function createViteConfig(config: ResolvedDocgenConfig, _command: 'serve' | 'build'): UserConfig {
  const primaryBase = config.collections[0]?.base ?? '/';
  const outDir = path.resolve(config.root, config.outDir);
  const ocpuiVueRoot = path.resolve(PKG_ROOT, '../../core/vue');
  const ocpuiVueAdminRoot = path.resolve(PKG_ROOT, '../../core/vue-admin');

  const viteBase = primaryBase === '/' ? '/' : `${primaryBase}/`;

  const demoRegistryRef: { current: Record<string, import('@ocpui/markdown-core').DocDemoEntry> } = {
    current: {},
  };

  const baseConfig: UserConfig = {
    root: config.themeDir,
    base: viteBase,
    publicDir: path.resolve(config.root, 'public'),
    optimizeDeps: {
      include: ['@milkdown/crepe', '@milkdown/vue', '@milkdown/kit'],
    },
    plugins: [
      ocpuiResolvePlugin(),
      docDemosPlugin({ getRegistry: () => demoRegistryRef.current }),
      vue({
        include: [/\.vue$/, /^virtual:ocp-demo\/.+\.vue$/],
      }),
      docgenPlugin({ config, onPayload: (payload) => {
        demoRegistryRef.current = payload.demoRegistry ?? {};
      } }),
    ],
    resolve: {
      alias: createOcpuiAlias(),
      dedupe: ['vue'],
    },
    build: {
      outDir,
      emptyOutDir: true,
    },
    server: {
      port: 5190,
      fs: {
        allow: [config.root, config.themeDir, PKG_ROOT, ocpuiVueRoot, ocpuiVueAdminRoot],
      },
    },
    preview: {
      port: 5191,
    },
  };

  return config.vite ? mergeConfig(baseConfig, config.vite) : baseConfig;
}
