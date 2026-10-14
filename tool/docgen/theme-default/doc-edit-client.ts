import {
  DocEditorConflictError,
  type DocEditorSavePayload,
  type DocEditorSaveResult,
} from '@ocpui/vue-docs';
import { getSourceMarkdown, type DocCollection } from '@ocpui/markdown-core';

const API_PREFIX = '/__ocp-doc/api';

export interface FetchDocSourceResult {
  markdown: string;
  revision: string;
  path: string;
}

export async function fetchDocSource(options: {
  collectionId: string;
  sourceId: string;
}): Promise<FetchDocSourceResult> {
  const params = new URLSearchParams({
    collectionId: options.collectionId,
    sourceId: options.sourceId,
  });
  const response = await fetch(`${API_PREFIX}/source?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`加载文档失败 (${response.status})`);
  }
  return response.json() as Promise<FetchDocSourceResult>;
}

export async function saveDocSource(
  payload: DocEditorSavePayload & { collectionId: string; sourceId: string },
): Promise<DocEditorSaveResult> {
  const response = await fetch(`${API_PREFIX}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collectionId: payload.collectionId,
      sourceId: payload.sourceId,
      markdown: payload.markdown,
      revision: payload.revision,
    }),
  });

  if (response.status === 409) {
    const conflict = (await response.json()) as {
      remoteMarkdown: string;
      remoteRevision: string;
    };
    throw new DocEditorConflictError(
      'conflict',
      conflict.remoteMarkdown,
      conflict.remoteRevision,
    );
  }

  if (!response.ok) {
    throw new Error(`保存失败 (${response.status})`);
  }

  return response.json() as Promise<DocEditorSaveResult>;
}

/** 从集合内解析跨链预览摘要 */
export function resolveCrossPreviewFromCollection(
  collection: DocCollection,
  href: string,
): { title: string; excerpt: string; path: string } | null {
  const normalized = href.replace(/^\.\//, '').split('#')[0]?.trim() ?? '';
  if (!normalized) {
    return null;
  }
  const source =
    collection.sources.find((item) => item.path === normalized) ??
    collection.sources.find((item) => item.path.endsWith(`/${normalized}`));
  if (!source) {
    return null;
  }
  const title = source.frontmatter.title ?? source.path.replace(/\.md$/i, '');
  const body = getSourceMarkdown(source).replace(/^---[\s\S]*?---\n?/, '').trim();
  const excerpt = body.split('\n').find((line) => line.trim() && !line.startsWith('#'))?.trim() ?? '';
  return { title, excerpt: excerpt.slice(0, 160), path: source.path };
}
