import type { Plugin } from 'vite';
import type { DocDemoEntry } from '@ocpui/markdown-core';

const DEMO_MODULE_PREFIX = 'virtual:ocp-demo/';
const DEMO_LOADER_ID = 'virtual:ocp-doc-demos';

export interface DocDemosPluginOptions {
  getRegistry: () => Record<string, DocDemoEntry>;
}

/** 将 Markdown inline vue demo 暴露为可 import 的虚拟 SFC 模块 */
export function docDemosPlugin(options: DocDemosPluginOptions): Plugin {
  const { getRegistry } = options;

  return {
    name: 'ocp-doc-demos',
    enforce: 'pre',
    resolveId(id) {
      if (id === DEMO_LOADER_ID) {
        return id;
      }
      if (id.startsWith(DEMO_MODULE_PREFIX) && id.endsWith('.vue')) {
        return id;
      }
    },
    load(id) {
      if (id === DEMO_LOADER_ID) {
        const registry = getRegistry();
        const cases = Object.keys(registry)
          .map(
            (demoId) =>
              `    case ${JSON.stringify(demoId)}: return (await import(${JSON.stringify(`${DEMO_MODULE_PREFIX}${demoId}.vue`)})).default;`,
          )
          .join('\n');

        return `
export async function loadDocDemo(id) {
  switch (id) {
${cases}
    default:
      throw new Error(\`[ocp-doc] 未找到 demo: \${id}\`);
  }
}
`;
      }

      if (!id.startsWith(DEMO_MODULE_PREFIX) || !id.endsWith('.vue')) {
        return;
      }

      const demoId = id.slice(DEMO_MODULE_PREFIX.length, -'.vue'.length);
      const entry = getRegistry()[demoId];
      if (!entry) {
        throw new Error(`[ocp-doc] 未找到 demo 模块: ${demoId}`);
      }

      return entry.source;
    },
  };
}
