export const SEARCH_INDEX_VERSION = 1 as const;

export type DocSearchCategory = 'page' | 'heading' | 'term' | 'path';

export interface DocSearchDocument {
  id: string;
  docId: string;
  path: string;
  title: string;
  headings?: Array<{ id: string; text: string }>;
  body?: string;
  glossary?: Record<string, string>;
  tags?: string[];
}

export interface DocSearchHit {
  id: string;
  docId: string;
  path: string;
  category: DocSearchCategory;
  title: string;
  snippet: string;
  score: number;
  anchorId?: string;
}

export interface DocSearchIndexPayload {
  version: typeof SEARCH_INDEX_VERSION;
  index: Record<string, unknown>;
}

export interface DocSearchRecord {
  id: string;
  docId: string;
  path: string;
  category: DocSearchCategory;
  title: string;
  text: string;
  anchorId?: string;
}

export const DOC_SEARCH_CATEGORY_LABELS: Record<DocSearchCategory, string> = {
  page: '页面',
  heading: '标题',
  term: '术语',
  path: '路径',
};

export const DOC_SEARCH_BOOST: Record<string, number> = {
  title: 3,
  text: 1,
  path: 0.5,
};
