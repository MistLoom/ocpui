import type { DocSearchDocument, DocSearchRecord } from './types.js';
import { extractPlainText } from './plain-text.js';

function snippet(text: string, max = 120): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) {
    return normalized;
  }
  return `${normalized.slice(0, max)}…`;
}

/** 将文档集展开为可索引记录 */
export function buildSearchRecords(documents: DocSearchDocument[]): DocSearchRecord[] {
  const records: DocSearchRecord[] = [];

  for (const doc of documents) {
    records.push({
      id: `${doc.docId}:page`,
      docId: doc.docId,
      path: doc.path,
      category: 'page',
      title: doc.title,
      text: [doc.title, doc.body ?? ''].filter(Boolean).join(' '),
    });

    for (const heading of doc.headings ?? []) {
      records.push({
        id: `${doc.docId}:heading:${heading.id}`,
        docId: doc.docId,
        path: doc.path,
        category: 'heading',
        title: heading.text,
        text: heading.text,
        anchorId: heading.id,
      });
    }

    for (const [term, definition] of Object.entries(doc.glossary ?? {})) {
      records.push({
        id: `${doc.docId}:term:${term}`,
        docId: doc.docId,
        path: doc.path,
        category: 'term',
        title: term,
        text: `${term} ${extractPlainText(definition)}`,
      });
    }

    const pathText = [doc.path, ...(doc.tags ?? [])].join(' ');
    if (pathText.trim()) {
      records.push({
        id: `${doc.docId}:path`,
        docId: doc.docId,
        path: doc.path,
        category: 'path',
        title: doc.path,
        text: pathText,
      });
    }
  }

  return records;
}

export { buildSearchRecords as buildSearchIndexRecords };
