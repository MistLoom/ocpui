import rehypeShiki from '@shikijs/rehype';
import { getSingletonHighlighter } from 'shiki';
import type { Root } from 'hast';
import type { OcpMarkdownPlugin } from '../types.js';
import { SHIKI_LANG_ALIASES } from '../shiki/lang-aliases.js';
import treeGrammar from '../languages/tree.tmLanguage.json' with { type: 'json' };
import cangjieGrammar from '../languages/cangjie.tmLanguage.json' with { type: 'json' };

export interface ShikiPluginOptions {
  /** 单主题（与 themes 二选一） */
  theme?: string;
  /** 亮/暗双主题，适配 theme-editorial */
  themes?: { light: string; dark: string };
  /** 覆盖/扩展语言别名 */
  langAlias?: Record<string, string>;
}

const DEFAULT_THEMES = {
  light: 'github-light',
  dark: 'github-dark',
} as const;

const CUSTOM_LANGS = [treeGrammar, cangjieGrammar] as const;

let customLangsPromise: Promise<void> | null = null;

/** 向 shiki 单例注入自定义 grammar */
function ensureCustomLangs(langAlias: Record<string, string>): Promise<void> {
  if (!customLangsPromise) {
    customLangsPromise = getSingletonHighlighter({
      themes: [DEFAULT_THEMES.light, DEFAULT_THEMES.dark],
      langAlias,
    }).then(async (highlighter) => {
      for (const grammar of CUSTOM_LANGS) {
        await highlighter.loadLanguage(grammar);
      }
    });
  }
  return customLangsPromise;
}

/** 预加载自定义语言后再执行 shiki：返回 unified 插件（工厂 → transformer） */
function rehypePreloadCustomLangs(langAlias: Record<string, string>) {
  return function preloadCustomLangs() {
    return async function transform(_tree: Root): Promise<void> {
      await ensureCustomLangs(langAlias);
    };
  };
}

/** 创建 shiki 高亮插件 */
export function createShikiPlugin(options: ShikiPluginOptions = {}): OcpMarkdownPlugin {
  const langAlias = {
    ...SHIKI_LANG_ALIASES,
    ...options.langAlias,
  };

  const shikiOptions = {
    ...(options.theme
      ? { theme: options.theme }
      : { themes: options.themes ?? DEFAULT_THEMES }),
    langAlias,
    addLanguageClass: true,
    /** 亮/暗均输出 --shiki-light / --shiki-dark，由 CSS 切换 */
    defaultColor: false,
  };

  return {
    id: 'shiki',
    rehypePlugins: [
      [rehypePreloadCustomLangs(langAlias)],
      [rehypeShiki, shikiOptions],
    ],
  };
}

/** 默认 shiki 插件（github-light / github-dark） */
export const shikiPlugin = createShikiPlugin();
