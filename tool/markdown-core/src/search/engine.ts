import MiniSearch from 'minisearch';
import { buildSearchRecords } from './build-records.js';
import type {
  DocSearchCategory,
  DocSearchDocument,
  DocSearchHit,
  DocSearchIndexPayload,
  DocSearchRecord,
} from './types.js';
import { DOC_SEARCH_BOOST, SEARCH_INDEX_VERSION } from './types.js';

function createMiniSearch(): MiniSearch<DocSearchRecord> {
  return new MiniSearch<DocSearchRecord>({
    fields: ['title', 'text', 'path'],
    storeFields: ['docId', 'path', 'category', 'title', 'text', 'anchorId'],
    searchOptions: {
      boost: DOC_SEARCH_BOOST,
      fuzzy: 0.15,
      prefix: true,
    },
  });
}

function toHit(result: DocSearchRecord & { score: number; id: string | number }): DocSearchHit {
  const text = result.text ?? '';
  return {
    id: String(result.id),
    docId: result.docId,
    path: result.path,
    category: result.category,
    title: result.title,
    snippet: text.length > 120 ? `${text.slice(0, 120)}…` : text,
    score: result.score,
    anchorId: result.anchorId,
  };
}

export interface DocSearchEngine {
  search: (query: string, category?: DocSearchCategory | 'all') => DocSearchHit[];
  toPayload: () => DocSearchIndexPayload;
}

export function createDocSearchEngine(documents: DocSearchDocument[]): DocSearchEngine {
  const index = createMiniSearch();
  const records = buildSearchRecords(documents);
  index.addAll(records);

  return {
    search(query: string, category: DocSearchCategory | 'all' = 'all') {
      const trimmed = query.trim();
      if (!trimmed) {
        return [];
      }
      const raw = index.search(trimmed, {
        filter: category === 'all' ? undefined : (result) => result.category === category,
      });
      return raw
        .map((item) => toHit(item as unknown as DocSearchRecord & { score: number; id: string | number }))
        .sort((a, b) => b.score - a.score);
    },
    toPayload() {
      return {
        version: SEARCH_INDEX_VERSION,
        index: index.toJSON(),
      };
    },
  };
}

export function loadDocSearchEngine(payload: DocSearchIndexPayload): DocSearchEngine {
  const index = MiniSearch.loadJSON(JSON.stringify(payload.index), {
    fields: ['title', 'text', 'path'],
    storeFields: ['docId', 'path', 'category', 'title', 'text', 'anchorId'],
    searchOptions: {
      boost: DOC_SEARCH_BOOST,
      fuzzy: 0.15,
      prefix: true,
    },
  });

  return {
    search(query: string, category: DocSearchCategory | 'all' = 'all') {
      const trimmed = query.trim();
      if (!trimmed) {
        return [];
      }
      const raw = index.search(trimmed, {
        filter: category === 'all' ? undefined : (result) => result.category === category,
      });
      return raw
        .map((item) => toHit(item as unknown as DocSearchRecord & { score: number; id: string | number }))
        .sort((a, b) => b.score - a.score);
    },
    toPayload() {
      return {
        version: SEARCH_INDEX_VERSION,
        index: index.toJSON(),
      };
    },
  };
}

export function searchDocuments(
  documents: DocSearchDocument[],
  query: string,
  category: DocSearchCategory | 'all' = 'all',
): DocSearchHit[] {
  return createDocSearchEngine(documents).search(query, category);
}
