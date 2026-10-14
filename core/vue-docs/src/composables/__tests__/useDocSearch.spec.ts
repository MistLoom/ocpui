import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import {
  buildSearchDocumentFromMarkdown,
  createDocSearchEngine,
} from '@ocpui/markdown-core';
import { useDocSearch } from '../useDocSearch.js';

const SAMPLE = `---
title: 测试
glossary:
  Wiki: 文档集合
---

# 测试

## 章节

正文关键词 alpha-beta。
`;

describe('useDocSearch', () => {
  it('检索并生成分类', async () => {
    const doc = await buildSearchDocumentFromMarkdown('t', 't.md', SAMPLE);
    const documents = ref([doc]);
    const { results, categories, search } = useDocSearch({ documents });

    search('Wiki');
    expect(results.value.length).toBeGreaterThan(0);
    expect(categories.value.some((c) => c.label === '术语')).toBe(true);

    search('章节');
    expect(results.value.some((r) => r.title === '章节')).toBe(true);
  });

  it('空查询清空结果', async () => {
    const doc = await buildSearchDocumentFromMarkdown('t', 't.md', SAMPLE);
    const { results, search } = useDocSearch({ documents: [doc] });
    search('');
    expect(results.value).toEqual([]);
  });
});

describe('createDocSearchEngine', () => {
  it('与 composable 结果结构一致', async () => {
    const doc = await buildSearchDocumentFromMarkdown('t', 't.md', SAMPLE);
    const engine = createDocSearchEngine([doc]);
    const hits = engine.search('alpha');
    expect(hits[0]?.snippet).toContain('alpha');
  });
});
