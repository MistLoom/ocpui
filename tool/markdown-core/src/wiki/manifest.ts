import { stringifyFrontmatter } from '../frontmatter.js';
import type { DocCollection, DocManifest, DocNavNode, DocRoute, DocSource } from './types.js';

/** 获取可编译的 Markdown 全文 */
export function getSourceMarkdown(source: DocSource): string {
  if (source.content?.trim()) {
    return source.content;
  }
  return stringifyFrontmatter(source.body, source.frontmatter ?? {});
}

/** 解析 source 标题 */
export function getSourceTitle(source: DocSource): string {
  const title = source.frontmatter?.title;
  if (typeof title === 'string' && title.trim()) {
    return title.trim();
  }
  const basename = source.path.split('/').pop()?.replace(/\.md$/i, '') ?? source.id;
  return basename;
}

/** 由 path 构建侧栏树 */
export function buildNavTreeFromSources(sources: DocSource[]): DocNavNode[] {
  const roots: DocNavNode[] = [];
  const published = sources.filter((source) => !source.frontmatter.draft);

  const sorted = [...published].sort((a, b) => {
    const orderA = typeof a.frontmatter.order === 'number' ? a.frontmatter.order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.frontmatter.order === 'number' ? b.frontmatter.order : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return getSourceTitle(a).localeCompare(getSourceTitle(b), 'zh');
  });

  function resolveFolderLabel(folderPath: string, segment: string): string {
    const indexPath = `${folderPath}/index.md`;
    const indexSource = published.find((item) => item.path === indexPath);
    if (indexSource) {
      return getSourceTitle(indexSource);
    }
    const navLabelSource = published.find((item) => {
      const navLabel = item.frontmatter.navLabel;
      return typeof navLabel === 'string' && item.path.startsWith(`${folderPath}/`);
    });
    if (navLabelSource && typeof navLabelSource.frontmatter.navLabel === 'string') {
      return navLabelSource.frontmatter.navLabel;
    }
    return segment;
  }

  for (const source of sorted) {
    const segments = source.path.replace(/\.md$/i, '').split('/').filter(Boolean);
    let level = roots;
    let prefix = '';

    segments.forEach((segment, index) => {
      const isLeaf = index === segments.length - 1;
      prefix = prefix ? `${prefix}/${segment}` : segment;
      const nodeId = isLeaf ? source.id : prefix;
      let node = level.find((item) => item.id === nodeId);
      if (!node) {
        node = {
          id: nodeId,
          label: isLeaf ? getSourceTitle(source) : resolveFolderLabel(prefix, segment),
          children: isLeaf ? undefined : [],
          ...(isLeaf ? { path: source.path, sourceId: source.id } : {}),
        };
        level.push(node);
      } else if (!isLeaf && node.label === segment) {
        node.label = resolveFolderLabel(prefix, segment);
      }
      if (!isLeaf) {
        if (!node.children) {
          node.children = [];
        }
        level = node.children;
      }
    });
  }

  return roots;
}

/** 构建 doc-manifest.json 结构 */
export function buildManifestFromCollection(collection: DocCollection): DocManifest {
  const navTree = collection.nav ?? buildNavTreeFromSources(collection.sources);
  const routes: DocRoute[] = collection.sources
    .filter((source) => !source.frontmatter.draft)
    .map((source) => ({
      path: `${collection.basePath.replace(/\/$/, '')}/${source.path.replace(/\.md$/i, '')}`.replace(/\/+/g, '/'),
      sourcePath: source.path,
      title: getSourceTitle(source),
      sourceId: source.id,
    }));

  return {
    collectionId: collection.id,
    title: collection.title,
    basePath: collection.basePath,
    routes,
    navTree,
    searchIndexPath: `${collection.basePath.replace(/\/$/, '')}/assets/search-index.json`.replace(/\/+/g, '/'),
  };
}

/** 按 sourceId 查找 */
export function findSourceById(collection: DocCollection, sourceId: string): DocSource | undefined {
  return collection.sources.find((source) => source.id === sourceId);
}

/** 按 path 查找 */
export function findSourceByPath(collection: DocCollection, path: string): DocSource | undefined {
  const normalized = path.replace(/^\//, '');
  return collection.sources.find((source) => source.path === normalized || source.path === path);
}

/** 解析 collection:path#anchor */
export function parseCollectionLink(href: string): {
  collectionId: string;
  path: string;
  anchor?: string;
} | null {
  const trimmed = href.trim();
  const match = trimmed.match(/^([^:#\s]+):([^#\s]+?)(?:#([\w-]+))?$/);
  if (!match) {
    return null;
  }
  return {
    collectionId: match[1],
    path: match[2],
    anchor: match[3],
  };
}

/** 从 path 生成面包屑标签 */
export function buildBreadcrumbLabels(collection: DocCollection, source: DocSource): string[] {
  const segments = source.path.replace(/\.md$/i, '').split('/').filter(Boolean);
  return [collection.title, ...segments.slice(0, -1), getSourceTitle(source)];
}

export interface DocBreadcrumbItem {
  label: string;
  sourceId?: string;
}

function publishedSources(collection: DocCollection): DocSource[] {
  return collection.sources.filter((item) => !item.frontmatter.draft);
}

/** 解析面包屑项对应的目标文档 */
export function resolveBreadcrumbSourceId(
  collection: DocCollection,
  source: DocSource,
  labelIndex: number,
): string | undefined {
  const sources = publishedSources(collection);
  if (sources.length === 0) {
    return undefined;
  }

  if (labelIndex === 0) {
    return (
      sources.find((item) => item.path === 'index.md') ??
      sources.find((item) => item.path.endsWith('/index.md')) ??
      sources[0]
    )?.id;
  }

  const segments = source.path.replace(/\.md$/i, '').split('/').filter(Boolean);
  const prefix = segments.slice(0, labelIndex).join('/');
  if (!prefix) {
    return undefined;
  }

  const indexPath = `${prefix}/index.md`;
  const indexSource = sources.find((item) => item.path === indexPath);
  if (indexSource) {
    return indexSource.id;
  }

  const underPrefix = sources
    .filter((item) => item.path.startsWith(`${prefix}/`))
    .sort((a, b) => a.path.localeCompare(b.path, 'zh'));
  return underPrefix[0]?.id;
}

/** 构建带导航目标的面包屑项 */
export function buildBreadcrumbItems(
  collection: DocCollection,
  source: DocSource,
): DocBreadcrumbItem[] {
  return buildBreadcrumbLabels(collection, source).map((label, index, labels) => ({
    label,
    sourceId:
      index < labels.length - 1
        ? resolveBreadcrumbSourceId(collection, source, index)
        : undefined,
  }));
}
