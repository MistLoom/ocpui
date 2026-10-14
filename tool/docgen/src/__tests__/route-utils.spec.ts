import { describe, expect, it } from 'vitest';
import type { DocManifest } from '@ocpui/markdown-core';
import {
  normalizeDocRoutePath,
  resolveEditModeFromRoute,
  resolveEditRouterPath,
  resolveRouterPath,
  resolveSourceIdFromRoute,
} from '../../theme-default/route-utils.js';

const MANIFEST: DocManifest = {
  collectionId: 'demo',
  title: 'Demo',
  basePath: '/',
  searchIndexPath: '/assets/search-index.json',
  routes: [
    { path: '/components/button', sourcePath: 'components/button.md', title: 'Button', sourceId: 'components-button' },
    { path: '/spec/foundation/doc-wiki-system', sourcePath: 'spec/foundation/doc-wiki-system.md', title: 'Doc Wiki', sourceId: 'spec-foundation-doc-wiki-system' },
  ],
  navTree: [],
};

describe('route-utils', () => {
  it('normalizeDocRoutePath 折叠重复斜杠', () => {
    expect(normalizeDocRoutePath('/components//button')).toBe('/components/button');
    expect(normalizeDocRoutePath('/spec/foundation/doc-wiki-system/')).toBe('/spec/foundation/doc-wiki-system');
  });

  it('resolveSourceIdFromRoute 优先 meta.sourceId', () => {
    const sourceId = resolveSourceIdFromRoute(
      { meta: { sourceId: 'spec-foundation-doc-wiki-system' }, name: 'components-button', path: '/components/button' } as never,
      MANIFEST,
    );
    expect(sourceId).toBe('spec-foundation-doc-wiki-system');
  });

  it('resolveSourceIdFromRoute 精确匹配，避免 endsWith 误匹配', () => {
    const sourceId = resolveSourceIdFromRoute(
      { meta: {}, name: undefined, path: '/spec/foundation/doc-wiki-system' } as never,
      MANIFEST,
    );
    expect(sourceId).toBe('spec-foundation-doc-wiki-system');
  });

  it('resolveSourceIdFromRoute 无匹配时不回退首项', () => {
    const sourceId = resolveSourceIdFromRoute(
      { meta: {}, name: undefined, path: '/unknown/page' } as never,
      MANIFEST,
    );
    expect(sourceId).toBe('');
  });

  it('resolveRouterPath 规范化 push 路径', () => {
    expect(resolveRouterPath(MANIFEST, '/components//button')).toBe('/components/button');
  });

  it('resolveEditModeFromRoute 识别编辑态', () => {
    expect(resolveEditModeFromRoute({ meta: { mode: 'edit' }, path: '/components/button/edit' } as never)).toBe(true);
    expect(resolveEditModeFromRoute({ meta: { mode: 'read' }, path: '/components/button' } as never)).toBe(false);
  });

  it('resolveSourceIdFromRoute 编辑路由解析 sourceId', () => {
    const sourceId = resolveSourceIdFromRoute(
      { meta: { sourceId: 'components-button', mode: 'edit' }, name: 'components-button--edit', path: '/components/button/edit' } as never,
      MANIFEST,
    );
    expect(sourceId).toBe('components-button');
  });

  it('resolveEditRouterPath 生成 /edit 后缀', () => {
    expect(resolveEditRouterPath(MANIFEST, '/components/button')).toBe('/components/button/edit');
  });
});
