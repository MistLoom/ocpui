import type { OcpMarkdownPluginId } from '@ocpui/markdown-core';
import type { UserConfig as ViteUserConfig } from 'vite';

/** 单个文档集配置 */
export interface DocgenCollectionConfig {
  id: string;
  /** Markdown 源目录（相对项目根） */
  src: string;
  /** 站点 base path，如 `/` 或 `/docs/` */
  base?: string;
  title?: string;
  defaultLocale?: string;
}

/** ocp-doc.config.ts 结构 */
export interface DocgenConfig {
  /** 项目根（默认 cwd） */
  root?: string;
  /** 构建输出目录（相对 root） */
  outDir?: string;
  collections: DocgenCollectionConfig[];
  markdown?: {
    plugins?: OcpMarkdownPluginId[];
  };
  /** 主题包路径，默认 `@ocpui/docgen/theme-default` */
  theme?: string;
  search?: {
    provider: 'minisearch';
  };
  /** 开发态源码编辑（仅 dev server 生效） */
  edit?: {
    enabled?: boolean;
  };
  vite?: ViteUserConfig;
}

/** 解析后的运行时配置 */
export interface ResolvedDocgenConfig {
  root: string;
  outDir: string;
  collections: DocgenCollectionConfig[];
  markdownPlugins: OcpMarkdownPluginId[];
  themeDir: string;
  searchProvider: 'minisearch';
  editEnabled: boolean;
  vite?: ViteUserConfig;
}

const DEFAULT_MARKDOWN_PLUGINS: OcpMarkdownPluginId[] = ['gfm', 'slug', 'admonition', 'infer-fence-lang', 'shiki', 'code-meta', 'doc-code-block'];

/** 定义 docgen 配置（类型辅助，原样返回） */
export function defineDocgenConfig(config: DocgenConfig): DocgenConfig {
  return config;
}

/** 规范化用户配置 */
export function normalizeDocgenConfig(root: string, config: DocgenConfig, themeDir: string): ResolvedDocgenConfig {
  if (!config.collections?.length) {
    throw new Error('[ocp-doc] collections 不能为空');
  }

  return {
    root,
    outDir: config.outDir ?? 'dist',
    collections: config.collections.map((item) => ({
      ...item,
      base: normalizeBasePath(item.base ?? '/'),
      title: item.title ?? item.id,
      defaultLocale: item.defaultLocale ?? 'zh',
    })),
    markdownPlugins: config.markdown?.plugins ?? DEFAULT_MARKDOWN_PLUGINS,
    themeDir,
    searchProvider: config.search?.provider ?? 'minisearch',
    editEnabled: config.edit?.enabled !== false,
    vite: config.vite,
  };
}

/** 统一 base path：以 / 开头、不以 / 结尾（根路径为 /） */
export function normalizeBasePath(base: string): string {
  let value = base.trim();
  if (!value.startsWith('/')) {
    value = `/${value}`;
  }
  if (value.length > 1 && value.endsWith('/')) {
    value = value.slice(0, -1);
  }
  return value || '/';
}
