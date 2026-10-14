import type { DocCollection, DocNavNode, DocSource } from './types.js';
import { findSourceByPath, parseCollectionLink } from './manifest.js';

export interface DocLinkTarget {
  sourceId: string;
  anchor?: string;
}

/** 解析相对 Markdown 链接为 collection 内 path */
export function resolveMarkdownHref(sourcePath: string, href: string): string {
  const trimmed = href.trim();
  if (
    !trimmed ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed.replace(/^\//, '');
  }

  const normalizedSource = sourcePath.replace(/\\/g, '/');
  const dir = normalizedSource.includes('/')
    ? normalizedSource.slice(0, normalizedSource.lastIndexOf('/'))
    : '';

  const joined = dir
    ? `${dir}/${trimmed}`.split('/').filter(Boolean).reduce((acc, segment) => {
        if (segment === '..') {
          acc.pop();
          return acc;
        }
        if (segment === '.') {
          return acc;
        }
        acc.push(segment);
        return acc;
      }, [] as string[]).join('/')
    : trimmed.replace(/^\.\//, '');

  return joined;
}

function findSourceByResolvedPath(
  collection: DocCollection,
  resolved: string,
): DocSource | undefined {
  const normalized = resolved.replace(/^\//, '').replace(/\\/g, '/');
  const withoutMd = normalized.replace(/\.md$/i, '');
  const withMd = `${withoutMd}.md`;

  return (
    findSourceByPath(collection, withMd) ||
    findSourceByPath(collection, normalized) ||
    collection.sources.find((source) => source.path.replace(/\.md$/i, '') === withoutMd)
  );
}

function findSourceByPathInCollection(
  collection: DocCollection,
  fromSourcePath: string,
): DocSource | undefined {
  return (
    findSourceByPath(collection, fromSourcePath) ||
    collection.sources.find((source) => source.path === fromSourcePath)
  );
}

/** 将 Markdown 链接解析为文档 sourceId（含 .md / 相对路径 / collection:id 形式） */
export function resolveDocLinkTarget(
  collection: DocCollection,
  fromSourcePath: string,
  href: string,
): DocLinkTarget | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')) {
    return null;
  }

  let anchor: string | undefined;
  let pathPart = trimmed;

  if (pathPart.startsWith('#')) {
    const current = findSourceByPathInCollection(collection, fromSourcePath);
    if (!current) {
      return null;
    }
    const id = pathPart.slice(1);
    return id ? { sourceId: current.id, anchor: id } : { sourceId: current.id };
  }

  const hashIdx = pathPart.indexOf('#');
  if (hashIdx >= 0) {
    anchor = pathPart.slice(hashIdx + 1) || undefined;
    pathPart = pathPart.slice(0, hashIdx);
  }

  if (!pathPart) {
    const current = findSourceByPathInCollection(collection, fromSourcePath);
    return current ? { sourceId: current.id, anchor } : null;
  }

  const collectionLink = parseCollectionLink(pathPart);
  if (collectionLink) {
    if (collectionLink.collectionId !== collection.id) {
      return null;
    }
    pathPart = collectionLink.path;
    anchor = collectionLink.anchor ?? anchor;
  }

  const resolved = pathPart.startsWith('/')
    ? pathPart.replace(/^\//, '')
    : resolveMarkdownHref(fromSourcePath, pathPart);

  const source = findSourceByResolvedPath(collection, resolved);
  if (!source) {
    return null;
  }

  return { sourceId: source.id, anchor };
}

/** 侧栏展开当前文档的祖先节点 id */
export function collectNavExpandKeysForSource(nodes: DocNavNode[], sourceId: string): string[] {
  const keys: string[] = [];

  function walk(list: DocNavNode[], ancestors: string[]): boolean {
    for (const node of list) {
      if (node.sourceId === sourceId) {
        keys.push(...ancestors);
        return true;
      }
      if (node.children?.length) {
        if (walk(node.children, [...ancestors, node.id])) {
          return true;
        }
      }
    }
    return false;
  }

  walk(nodes, []);
  return keys;
}
