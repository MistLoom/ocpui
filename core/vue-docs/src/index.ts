export { DEFAULT_DOC_MARKDOWN_PLUGINS } from './constants/default-markdown-plugins.js';
export * from './components/index.js';
export { useMarkdownCompile } from './composables/useMarkdownCompile.js';
export type { UseMarkdownCompileOptions } from './composables/useMarkdownCompile.js';
export {
  useDocReadingPrefs,
  DOC_READING_PREFS_KEY,
  DOC_READING_DEFAULTS,
  docReadingPrefsToCssVars,
} from './composables/useDocReadingPrefs.js';
export type {
  DocReadingPrefsState,
  DocFontSizePreset,
  DocLeadingPreset,
  UseDocReadingPrefsReturn,
} from './composables/useDocReadingPrefs.js';
export { useReadingScrollRestore } from './composables/useReadingScrollRestore.js';
export { useDocSearch } from './composables/useDocSearch.js';
export type { DocSearchResultItem, DocSearchCategoryItem, UseDocSearchOptions } from './composables/useDocSearch.js';
export { applyDocSearchNavigation, clearDocSearchMarks } from './utils/highlightDocMatch.js';
export { useDocWiki } from './composables/useDocWiki.js';
export type { UseDocWikiOptions } from './composables/useDocWiki.js';
export { useDocEditor, DocEditorConflictError } from './composables/useDocEditor.js';
export type {
  DocEditorSavePayload,
  DocEditorSaveResult,
  UseDocEditorOptions,
  UseDocEditorReturn,
} from './composables/useDocEditor.js';
export { useDebouncedRef } from './composables/useDebouncedRef.js';
export { mergeGlossaryMaps } from './types/doc-enhance.js';
export type { DocCrossPreviewData, DocCrossPreviewResolver } from './types/doc-enhance.js';
