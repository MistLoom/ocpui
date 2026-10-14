import type { DocFrontmatter, DocHeading, DocReadingPrefs } from '../types.js';

/** 单个 MD 源 */
export interface DocSource {
  id: string;
  path: string;
  locale?: string;
  frontmatter: DocFrontmatter;
  /** 不含 frontmatter 的正文 */
  body: string;
  /** 可选：完整 Markdown（含 frontmatter），优先于 body */
  content?: string;
  revision?: string;
  /** docgen SSG 预编译 HTML（含 shiki 高亮） */
  compiledHtml?: string;
  /** 与 compiledHtml 对应的标题结构 */
  compiledHeadings?: DocHeading[];
}

/** 侧栏导航节点 */
export interface DocNavNode {
  id: string;
  label: string;
  path?: string;
  sourceId?: string;
  children?: DocNavNode[];
}

/** 文档集 */
export interface DocCollection {
  id: string;
  title: string;
  basePath: string;
  defaultLocale: string;
  nav?: DocNavNode[];
  sources: DocSource[];
}

/** manifest 路由项 */
export interface DocRoute {
  path: string;
  sourcePath: string;
  title: string;
  sourceId: string;
}

/** SSG / 运行时共用 manifest */
export interface DocManifest {
  collectionId: string;
  title: string;
  basePath: string;
  routes: DocRoute[];
  navTree: DocNavNode[];
  searchIndexPath?: string;
}

export type { DocFrontmatter, DocReadingPrefs };
