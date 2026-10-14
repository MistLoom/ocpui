import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import type { DocCollection } from '@ocpui/markdown-core';
import { useDocWiki } from '../useDocWiki.js';

const COLLECTION: DocCollection = {
  id: 'demo',
  title: 'Demo',
  basePath: '/',
  defaultLocale: 'zh',
  sources: [
    {
      id: 'a',
      path: 'guide/a.md',
      frontmatter: { title: '文档 A' },
      body: '# A',
    },
    {
      id: 'b',
      path: 'guide/b.md',
      frontmatter: { title: '文档 B' },
      body: '# B',
    },
  ],
};

describe('useDocWiki', () => {
  it('初始化 activeSource 与 navTree', async () => {
    const collection = ref(COLLECTION);
    const { activeSourceId, activeSource, navTree, activeMarkdown } = useDocWiki({
      collection,
      initialSourceId: 'a',
    });

    expect(activeSourceId.value).toBe('a');
    expect(activeSource.value?.id).toBe('a');
    expect(activeMarkdown.value).toContain('# A');
    expect(navTree.value.length).toBeGreaterThan(0);
  });

  it('navigateToSource 切换文档', () => {
    const { navigateToSource, activeSourceId } = useDocWiki({
      collection: COLLECTION,
      initialSourceId: 'a',
    });

    navigateToSource('b');
    expect(activeSourceId.value).toBe('b');
  });

  it('applySavedSource 覆盖正文并清空预编译', () => {
    const collection = ref<DocCollection>({
      ...COLLECTION,
      sources: [
        {
          id: 'a',
          path: 'guide/a.md',
          frontmatter: { title: '文档 A' },
          body: '# A',
          content: '# A',
          compiledHtml: '<h1>A</h1>',
          compiledHeadings: [{ depth: 1, text: 'A', id: 'a' }],
        },
      ],
    });
    const { applySavedSource, activeMarkdown, activeCompiledHtml } = useDocWiki({
      collection,
      initialSourceId: 'a',
    });

    expect(activeCompiledHtml.value).toContain('<h1>');
    applySavedSource('a', '# A 已改\n', 'rev-2');
    expect(activeMarkdown.value).toContain('# A 已改');
    expect(activeCompiledHtml.value).toBe('');
  });

  it('initialSourceId 变更时同步 activeSource', async () => {
    const collection = ref(COLLECTION);
    const initialSourceId = ref('a');
    const { activeSourceId, activeMarkdown } = useDocWiki({
      collection,
      initialSourceId,
    });

    expect(activeSourceId.value).toBe('a');
    expect(activeMarkdown.value).toContain('# A');

    initialSourceId.value = 'b';
    await Promise.resolve();

    expect(activeSourceId.value).toBe('b');
    expect(activeMarkdown.value).toContain('# B');
  });
});
