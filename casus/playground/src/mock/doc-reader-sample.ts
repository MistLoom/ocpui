export const DOC_READER_SAMPLE = `---
title: 平台操作手册
description: DocReaderShell 阅读场景演示
---

# 平台操作手册

本文演示 **DocReaderShell**：正文编译、页内目录、阅读偏好与 scroll 恢复。

## 快速开始

1. 安装依赖
2. 启动服务
3. 打开管理后台

::: tip 提示
右侧目录可点击跳转；桌面端宽屏显示 TOC，移动端可折叠浏览。
:::

## 配置说明

| 项 | 默认值 | 说明 |
| --- | --- | --- |
| \`baseUrl\` | \`/\` | API 根路径 |
| \`locale\` | \`zh\` | 界面语言 |

### 代码示例

\`\`\`ts
import { DocReaderShell } from '@ocpui/vue-docs';

const source = '# Hello';
\`\`\`

## 常见问题

### 如何调整行宽？

使用顶栏 **阅读偏好** 滑块，设置保存在 \`localStorage\`（键 \`ocp-doc-prefs\`）。

### 如何恢复阅读位置？

设置 \`doc-id\` 与 \`preserve-reading-position\`，离开页面后返回将恢复 scroll。

## 延伸阅读

- [设计规格](/spec/doc-wiki)
- [markdown-core 编译 API](/api/compile)
`;
