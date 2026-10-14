export { compile, extractHeadingsFromMdast, extractHeadingIdsFromHtml } from './compile.js';
export { splitFrontmatter, stringifyFrontmatter, formatFrontmatterYaml } from './frontmatter.js';
export type {
  CompileContext,
  CompileOptions,
  CompileResult,
  DocFrontmatter,
  DocHeading,
  DocReadingPrefs,
  IndexContributor,
  OcpMarkdownPlugin,
  OcpMarkdownPluginId,
} from './types.js';
export {
  resolvePlugins,
  getBuiltinPlugin,
  gfmPlugin,
  admonitionPlugin,
  demoPlugin,
  codeMetaPlugin,
  createSlugPlugin,
  ADMONITION_TYPES,
  normalizeAdmonitionSyntax,
  normalizeDemoSyntax,
  demoIdFromSource,
  extractVueDemoSource,
  glossaryPlugin,
  crossDocPlugin,
  inferFenceLangPlugin,
  normalizeGlossarySyntax,
  isCrossDocHref,
  createShikiPlugin,
  shikiPlugin,
  inferFenceLanguage,
  SHIKI_LANG_ALIASES,
  resolvePrecompilePluginList,
  resolveBrowserCompilePluginList,
  isSyntaxHighlightedHtml,
} from './plugins/index.js';
export type {
  DocSearchCategory,
  DocSearchDocument,
  DocSearchHit,
  DocSearchIndexPayload,
} from './search/types.js';
export {
  SEARCH_INDEX_VERSION,
  DOC_SEARCH_CATEGORY_LABELS,
  buildSearchRecords,
  buildSearchDocumentFromMarkdown,
  createDocSearchEngine,
  loadDocSearchEngine,
  searchDocuments,
  extractPlainText,
} from './search/index.js';
export type { DocSearchEngine } from './search/index.js';
export type {
  DocSource,
  DocNavNode,
  DocCollection,
  DocManifest,
  DocRoute,
  DocBreadcrumbItem,
} from './wiki/index.js';
export {
  getSourceMarkdown,
  getSourceTitle,
  buildNavTreeFromSources,
  buildManifestFromCollection,
  findSourceById,
  findSourceByPath,
  parseCollectionLink,
  buildBreadcrumbLabels,
  buildBreadcrumbItems,
  resolveBreadcrumbSourceId,
  resolveMarkdownHref,
  resolveDocLinkTarget,
  collectNavExpandKeysForSource,
  collectDemoRegistry,
} from './wiki/index.js';
export {
  splitDocBlocks,
  serializeDocBlocks,
} from './blocks/split-doc-blocks.js';
export type {
  DocBlock,
  DocBlockKind,
  DocProseBlock,
  DocAdmonitionBlock,
  DocDemoBlock,
  DocRawBlock,
  DocAdmonitionType,
} from './blocks/split-doc-blocks.js';
export type { DocLinkTarget, DocDemoEntry } from './wiki/index.js';
