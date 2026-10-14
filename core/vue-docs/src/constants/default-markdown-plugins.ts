import type { OcpMarkdownPluginId } from '@ocpui/markdown-core';

/** 文档阅读/预览默认 Markdown 插件（浏览器运行时；代码高亮由 docgen SSG 预编译承担） */
export const DEFAULT_DOC_MARKDOWN_PLUGINS: OcpMarkdownPluginId[] = [
  'gfm',
  'slug',
  'admonition',
  'demo',
  'code-meta',
  'infer-fence-lang',
  'doc-code-block',
  'glossary',
  'cross-doc',
];