# @ocpui/markdown-core

OCP Markdown 解析管线。基于 unified / remark / rehype，供 `@ocpui/vue-docs` 与 `@ocpui/docgen` 共用。

规格：[docs/spec/foundation/doc-wiki-system.md](../../casus/docs/spec/foundation/doc-wiki-system.md)

## 安装

```bash
pnpm add @ocpui/markdown-core
```

## 用法

```typescript
import { compile } from '@ocpui/markdown-core';

const { html, frontmatter, headings, body } = await compile(`---
title: 指南
---

# 标题

正文。
`);
```

## 内置插件

| id | 说明 |
|----|------|
| `gfm` | GFM 表格、任务列表等 |
| `slug` | 标题 slug + autolink |
| `admonition` | `::: tip` 容器 |
| `infer-fence-lang` | 无 lang 围栏推断 tree 等语言 |
| `shiki` | 代码块语法高亮（shiki 内置全集 + tree / cangjie） |
| `code-meta` | 代码块 meta 属性 |

## 检索

```typescript
import { buildSearchDocumentFromMarkdown, createDocSearchEngine } from '@ocpui/markdown-core';

const doc = await buildSearchDocumentFromMarkdown('id', 'path.md', source);
const engine = createDocSearchEngine([doc]);
engine.search('关键词');
const payload = engine.toPayload(); // 供 SSG 输出 search-index.json
```

## Wiki / Manifest

```typescript
import {
  buildManifestFromCollection,
  buildNavTreeFromSources,
  type DocCollection,
} from '@ocpui/markdown-core';

const manifest = buildManifestFromCollection(collection);
// manifest.navTree / manifest.routes / manifest.searchIndexPath
```

## 命令

```bash
pnpm --filter @ocpui/markdown-core check
```
