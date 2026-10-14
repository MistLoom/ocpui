---
title: OCP UI
description: 设计系统与组件库
order: 1
---

# OCP UI

设计系统与组件库文档站（`@ocpui/docgen` + `vue-docs`）。

## 入口

| 分区 | 说明 |
| --- | --- |
| [指南](./guide/index.md) | 快速接入、选型 |
| [设计体系](./spec/index.md) | 架构契约与 Registry 规格 |
| [组件](./components/index.md) | 通用组件与业务 Shell + 内嵌 Demo |

## 能力

| 能力 | 说明 |
| --- | --- |
| DocWikiShell | 侧栏导航、页内 TOC、Ctrl+K 检索 |
| `::: demo` | Markdown 内嵌 Vue 交互预览 |
| 阅读偏好 | 字号、行宽、暗色主题 |

## 命令

```bash
pnpm docs:dev
pnpm docs:build
pnpm --filter @ocpui/docs gen:components
```
