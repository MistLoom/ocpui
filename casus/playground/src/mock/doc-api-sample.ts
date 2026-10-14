export const DOC_API_SAMPLE = `---
title: 编译 API
tags: [api, markdown-core]
glossary:
  compile: 将 Markdown 源编译为 HTML 的统一入口
---

# 编译 API

\`compile(source, options)\` 返回 \`html\`、\`headings\` 与 \`frontmatter\`。

## 用法

\`\`\`ts
import { compile } from '@ocpui/markdown-core';
\`\`\`

## 检索

配合 \`createDocSearchEngine\` 构建 minisearch 索引，供 DocSearchSurface 消费。
`;
