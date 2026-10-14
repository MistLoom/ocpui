import type { OcpMarkdownPlugin, OcpMarkdownPluginId } from '../types.js';
import { admonitionPlugin } from './admonition.js';
import { demoPlugin } from './demo.js';
import { codeMetaPlugin } from './code-meta.js';
import { crossDocPlugin } from './cross-doc.js';
import { glossaryPlugin } from './glossary.js';
import { gfmPlugin } from './gfm.js';
import { createSlugPlugin } from './slug.js';

import { docCodeBlockPlugin } from './doc-code-block.js';
import { inferFenceLangPlugin } from './infer-fence-lang.js';

const BUILTIN: Record<Exclude<OcpMarkdownPluginId, 'shiki'>, OcpMarkdownPlugin> = {
  gfm: gfmPlugin,
  slug: createSlugPlugin(),
  admonition: admonitionPlugin,
  demo: demoPlugin,
  'code-meta': codeMetaPlugin,
  'infer-fence-lang': inferFenceLangPlugin,
  'doc-code-block': docCodeBlockPlugin,
  glossary: glossaryPlugin,
  'cross-doc': crossDocPlugin,
};

/** 按需加载 shiki；Node / 预编译走静态注入，浏览器降级为 no-op */
async function loadShikiPlugin(): Promise<OcpMarkdownPlugin> {
  const isBrowser = 'window' in globalThis;
  if (!isBrowser) {
    const { shikiPlugin } = await import('./shiki.js');
    return shikiPlugin;
  }
  try {
    const { shikiPlugin } = await import('./shiki.js');
    return shikiPlugin;
  } catch (cause) {
    console.warn('[markdown-core] 浏览器端 shiki 不可用，请使用 docgen 预编译 HTML', cause);
    return { id: 'shiki' };
  }
}

export async function resolvePlugins(
  ids: (OcpMarkdownPluginId | OcpMarkdownPlugin)[],
  options?: { autolinkHeadings?: boolean },
): Promise<OcpMarkdownPlugin[]> {
  return Promise.all(
    ids.map(async (entry) => {
      if (typeof entry === 'string') {
        if (entry === 'slug') {
          return createSlugPlugin({ autolinkHeadings: options?.autolinkHeadings ?? true });
        }
        if (entry === 'shiki') {
          return loadShikiPlugin();
        }
        const plugin = BUILTIN[entry];
        if (!plugin) {
          throw new Error(`未知 Markdown 插件: ${entry}`);
        }
        return plugin;
      }
      return entry;
    }),
  );
}

export function getBuiltinPlugin(id: Exclude<OcpMarkdownPluginId, 'shiki'>): OcpMarkdownPlugin {
  return BUILTIN[id];
}

export { admonitionPlugin, demoPlugin, codeMetaPlugin, docCodeBlockPlugin, gfmPlugin, createSlugPlugin, glossaryPlugin, crossDocPlugin };
export { demoIdFromSource, extractVueDemoSource, normalizeDemoSyntax } from './demo.js';
export { ADMONITION_TYPES, normalizeAdmonitionSyntax } from './admonition.js';
export { normalizeGlossarySyntax } from './glossary.js';
export { isCrossDocHref } from './cross-doc.js';
export { inferFenceLangPlugin, inferFenceLanguage } from './infer-fence-lang.js';
export { SHIKI_LANG_ALIASES } from '../shiki/lang-aliases.js';
export { createShikiPlugin, shikiPlugin } from './shiki.js';
export { resolvePrecompilePluginList, resolveBrowserCompilePluginList, isSyntaxHighlightedHtml } from './precompile-plugins.js';