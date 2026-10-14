import { describe, expect, it } from 'vitest';
import {
  buildSearchRecords,
  buildSearchDocumentFromMarkdown,
  createDocSearchEngine,
  loadDocSearchEngine,
  DOC_SEARCH_CATEGORY_LABELS,
} from '../search/index.js';

const SAMPLE = `---
title: 安装指南
tags: [setup]
glossary:
  UiRoot: 全局主题与反馈容器
---

# 安装指南

## 快速开始

运行 \`pnpm install\` 安装依赖。
`;

describe('search', () => {
  it('buildSearchRecords 展开多类别记录', async () => {
    const doc = await buildSearchDocumentFromMarkdown('install', 'guide/install.md', SAMPLE);
    const records = buildSearchRecords([doc]);
    expect(records.some((r) => r.category === 'page')).toBe(true);
    expect(records.some((r) => r.category === 'heading' && r.title === '快速开始')).toBe(true);
    expect(records.some((r) => r.category === 'term' && r.title === 'UiRoot')).toBe(true);
    expect(records.some((r) => r.category === 'path')).toBe(true);
  });

  it('createDocSearchEngine 检索标题与正文', async () => {
    const doc = await buildSearchDocumentFromMarkdown('install', 'guide/install.md', SAMPLE);
    const engine = createDocSearchEngine([doc]);
    const hits = engine.search('pnpm install');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.docId).toBe('install');
  });

  it('按类别过滤', async () => {
    const doc = await buildSearchDocumentFromMarkdown('install', 'guide/install.md', SAMPLE);
    const engine = createDocSearchEngine([doc]);
    const hits = engine.search('UiRoot', 'term');
    expect(hits.every((h) => h.category === 'term')).toBe(true);
    expect(hits[0]?.title).toBe('UiRoot');
  });

  it('索引可序列化并加载', async () => {
    const doc = await buildSearchDocumentFromMarkdown('install', 'guide/install.md', SAMPLE);
    const engine = createDocSearchEngine([doc]);
    const payload = engine.toPayload();
    const loaded = loadDocSearchEngine(payload);
    expect(loaded.search('快速开始').length).toBeGreaterThan(0);
  });

  it('类别标签映射', () => {
    expect(DOC_SEARCH_CATEGORY_LABELS.heading).toBe('标题');
  });
});
