import type { PluggableList } from 'unified';

/** 内置插件 id（首版） */
export type OcpMarkdownPluginId =
  | 'gfm'
  | 'slug'
  | 'admonition'
  | 'demo'
  | 'code-meta'
  | 'infer-fence-lang'
  | 'shiki'
  | 'doc-code-block'
  | 'glossary'
  | 'cross-doc';

/** 文档 frontmatter（子集，应用层可扩展） */
export interface DocFrontmatter {
  title?: string;
  description?: string;
  order?: number;
  tags?: string[];
  draft?: boolean;
  glossary?: Record<string, string>;
  reading?: DocReadingPrefs;
  [key: string]: unknown;
}

export interface DocReadingPrefs {
  measure?: string;
  fontSize?: string;
  leading?: string;
}

/** 标题节点，供 DocToc / 检索索引 */
export interface DocHeading {
  id: string;
  text: string;
  depth: number;
}

/** SSG 索引贡献（后续插件扩展） */
export interface IndexContributor {
  field: string;
  weight: number;
  extract: (ctx: CompileContext) => string | string[];
}

export interface CompileContext {
  frontmatter: DocFrontmatter;
  body: string;
  headings: DocHeading[];
}

export interface OcpMarkdownPlugin {
  id: string;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  /** 编译前预处理 Markdown 正文 */
  preprocess?: (body: string) => string;
  indexContributors?: IndexContributor[];
}

export interface CompileOptions {
  /** 默认 ['gfm', 'slug', 'admonition'] */
  plugins?: (OcpMarkdownPluginId | OcpMarkdownPlugin)[];
  basePath?: string;
  /** 默认 true */
  sanitize?: boolean;
  /** 默认 true */
  autolinkHeadings?: boolean;
}

export interface CompileResult {
  html: string;
  frontmatter: DocFrontmatter;
  body: string;
  headings: DocHeading[];
}
