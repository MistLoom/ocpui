# @ocpui/vue-docs

OCP Markdown Wiki 阅读组件（T2 Block）。依赖 `@ocpui/markdown-core` 编译管线与 `@ocpui/vue` 反馈/原语。

## 组件

| 组件 | ID | 说明 |
|------|-----|------|
| `MarkdownBody` | C:MARKDOWN-BODY | MD 编译 + 渲染 |
| `DocToc` | C:DOC-TOC | 页内目录 + scroll spy |
| `DocAdmonition` | C:DOC-ADMONITION | 提示块 |
| `DocCodeBlock` | C:DOC-CODE-BLOCK | 代码块 + 复制 |
| `DocReadingPrefs` | C:DOC-READING-PREFS | 字号/行宽/行距微调 |
| `DocReaderShell` | C:DOC-READER-SHELL | 单页阅读 Shell |
| `DocSearchSurface` | C:DOC-SEARCH-SURFACE | 文档检索（GlobalSearch 壳） |
| `DocNavTree` | C:DOC-NAV-TREE | 侧栏文档导航 |
| `DocWikiShell` | C:DOC-WIKI-SHELL | 多文档 Wiki Shell |
| `DocGlossaryTerm` | C:DOC-GLOSSARY-TERM | 术语标记 + 浮层释义 |
| `DocCrossPreview` | C:DOC-CROSS-PREVIEW | 跨文档预览卡片 |
| `DocEditorShell` | C:DOC-EDITOR-SHELL | 源码编辑 + 实时预览 |
| `DocMarkdownEditor` | — | CodeMirror 6 编辑器 |
| `DocFrontmatterPanel` | — | frontmatter 表单 / Raw |

## 用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { MarkdownBody, DocToc, DocReaderShell } from '@ocpui/vue-docs';
import '@ocpui/vue-docs/styles/doc-reading';
import '@ocpui/vue/themes/editorial';

const headings = ref([]);
</script>

<template>
  <MarkdownBody source="# 标题" @compiled="(r) => (headings = r.headings)" />
  <DocToc :headings="headings" />
</template>
```

## 命令

```bash
pnpm --filter @ocpui/vue-docs check
```
