import type { DocSearchCategory, DocSearchDocument, DocSearchHit, DocSearchIndexPayload, DocSearchRecord } from './types.js';

export type { DocSearchCategory, DocSearchDocument, DocSearchHit, DocSearchIndexPayload, DocSearchRecord };
export { SEARCH_INDEX_VERSION, DOC_SEARCH_CATEGORY_LABELS, DOC_SEARCH_BOOST } from './types.js';
export { buildSearchRecords } from './build-records.js';
export { createDocSearchEngine, loadDocSearchEngine, searchDocuments, type DocSearchEngine } from './engine.js';
export { buildSearchDocumentFromMarkdown } from './document.js';
export { extractPlainText } from './plain-text.js';
