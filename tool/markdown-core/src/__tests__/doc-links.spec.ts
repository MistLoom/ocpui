import { describe, expect, it } from 'vitest';
import type { DocCollection } from '../wiki/types.js';
import {
  collectNavExpandKeysForSource,
  resolveDocLinkTarget,
  resolveMarkdownHref,
} from '../wiki/doc-links.js';

const COLLECTION: DocCollection = {
  id: 'ocpui',
  title: 'OCP UI',
  basePath: '/',
  defaultLocale: 'zh',
  sources: [
    { id: 'index', path: 'index.md', frontmatter: { title: 'Home' }, body: '# Home' },
    { id: 'guide-quickstart', path: 'guide/quickstart.md', frontmatter: { title: 'Quickstart' }, body: '# Quickstart' },
    {
      id: 'spec-foundation-doc-wiki-system',
      path: 'spec/foundation/doc-wiki-system.md',
      frontmatter: { title: 'Doc Wiki' },
      body: '# Doc Wiki',
    },
  ],
};

describe('resolveMarkdownHref', () => {
  it('解析相对 .md 链接', () => {
    expect(resolveMarkdownHref('spec/foundation/doc-wiki-system.md', '../../guide/quickstart.md')).toBe(
      'guide/quickstart.md',
    );
    expect(resolveMarkdownHref('guide/quickstart.md', './../index.md')).toBe('index.md');
  });
});

describe('resolveDocLinkTarget', () => {
  it('解析 .md 后缀链接', () => {
    expect(
      resolveDocLinkTarget(COLLECTION, 'index.md', 'guide/quickstart.md'),
    ).toEqual({ sourceId: 'guide-quickstart' });
  });

  it('解析无 .md 后缀的内部路径', () => {
    expect(
      resolveDocLinkTarget(COLLECTION, 'index.md', 'spec/foundation/doc-wiki-system'),
    ).toEqual({ sourceId: 'spec-foundation-doc-wiki-system' });
  });

  it('解析 collection:path 链接', () => {
    expect(
      resolveDocLinkTarget(COLLECTION, 'index.md', 'ocpui:guide/quickstart.md'),
    ).toEqual({ sourceId: 'guide-quickstart' });
  });

  it('解析带锚点的链接', () => {
    expect(
      resolveDocLinkTarget(COLLECTION, 'index.md', 'guide/quickstart.md#setup'),
    ).toEqual({ sourceId: 'guide-quickstart', anchor: 'setup' });
  });
});

describe('collectNavExpandKeysForSource', () => {
  it('收集祖先节点 id', () => {
    const keys = collectNavExpandKeysForSource(
      [
        {
          id: 'spec',
          label: 'spec',
          children: [
            {
              id: 'spec-foundation-doc-wiki-system',
              label: 'Doc Wiki',
              sourceId: 'spec-foundation-doc-wiki-system',
              path: 'spec/foundation/doc-wiki-system.md',
            },
          ],
        },
      ],
      'spec-foundation-doc-wiki-system',
    );
    expect(keys).toEqual(['spec']);
  });
});
