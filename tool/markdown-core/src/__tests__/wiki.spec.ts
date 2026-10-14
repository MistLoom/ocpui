import { describe, expect, it } from 'vitest';
import {
  buildManifestFromCollection,
  buildNavTreeFromSources,
  buildBreadcrumbItems,
  findSourceById,
  getSourceTitle,
  parseCollectionLink,
  resolveBreadcrumbSourceId,
} from '../wiki/index.js';
import type { DocCollection } from '../wiki/types.js';

const COLLECTION: DocCollection = {
  id: 'manual',
  title: '产品手册',
  basePath: '/docs',
  defaultLocale: 'zh',
  sources: [
    {
      id: 'install',
      path: 'guide/install.md',
      frontmatter: { title: '安装', order: 1 },
      body: '# 安装',
    },
    {
      id: 'config',
      path: 'guide/config.md',
      frontmatter: { title: '配置', order: 2 },
      body: '# 配置',
    },
    {
      id: 'faq',
      path: 'faq/index.md',
      frontmatter: { title: 'FAQ' },
      body: '# FAQ',
    },
  ],
};

describe('wiki manifest', () => {
  it('buildNavTreeFromSources 按路径分组', () => {
    const tree = buildNavTreeFromSources(COLLECTION.sources);
    expect(tree).toHaveLength(2);
    const guide = tree.find((node) => node.id === 'guide');
    expect(guide?.children?.length).toBe(2);
  });

  it('buildManifestFromCollection 输出 routes 与 navTree', () => {
    const manifest = buildManifestFromCollection(COLLECTION);
    expect(manifest.collectionId).toBe('manual');
    expect(manifest.routes).toHaveLength(3);
    expect(manifest.navTree.length).toBeGreaterThan(0);
    expect(manifest.searchIndexPath).toContain('search-index.json');
  });

  it('findSourceById 与 getSourceTitle', () => {
    const source = findSourceById(COLLECTION, 'install');
    expect(source?.path).toBe('guide/install.md');
    expect(getSourceTitle(source!)).toBe('安装');
  });

  it('parseCollectionLink', () => {
    expect(parseCollectionLink('manual:guide/install.md#quick-start')).toEqual({
      collectionId: 'manual',
      path: 'guide/install.md',
      anchor: 'quick-start',
    });
    expect(parseCollectionLink('invalid')).toBeNull();
  });

  it('buildBreadcrumbItems 含可导航 sourceId', () => {
    const source = findSourceById(COLLECTION, 'install')!;
    const items = buildBreadcrumbItems(COLLECTION, source);
    expect(items.map((item) => item.label)).toEqual(['产品手册', 'guide', '安装']);
    expect(items[0]?.sourceId).toBe('faq');
    expect(items[1]?.sourceId).toBe('config');
    expect(items[2]?.sourceId).toBeUndefined();
  });

  it('resolveBreadcrumbSourceId 优先 index.md', () => {
    const source = findSourceById(COLLECTION, 'install')!;
    expect(resolveBreadcrumbSourceId(COLLECTION, source, 0)).toBe('faq');
  });
});
