---
title: 组件
description: 通用组件与业务 Shell 文档
order: 3
---
# 组件

分层文档：T0 原语、T2 区块、T3 Shell 与 `@ocpui/vue-admin` 业务 Shell。

## 分类

| 分类                          | 说明                            |
| --------------------------- | ----------------------------- |
| [原语](./primitives/index.md) | Button、Input、Select 等 T0      |
| [区块](./blocks/index.md)     | MetricCard、Descriptions 等 T2  |
| [Shell](./shells/index.md)  | AdminPage、DataTable 等业务 Shell |

## 文档约定

* **duty / states**：以 registry 机读条目为准（`packages/ocpui/core/vue/registry/`）
* **Demo**：Markdown `::: demo` 内嵌 Vue 源码，构建时编译为可交互预览
* **规格冲突**：以 [spec/index.md](../spec/index.md) 为准

## 生成骨架

```bash
pnpm --filter @ocpui/docs run gen:components
```

# 组件

分层文档：T0 原语、T2 区块、T3 Shell 与 `@ocpui/vue-admin` 业务 Shell。

## 分类

| 分类                          | 说明                            |
| --------------------------- | ----------------------------- |
| [原语](./primitives/index.md) | Button、Input、Select 等 T0      |
| [区块](./blocks/index.md)     | MetricCard、Descriptions 等 T2  |
| [Shell](./shells/index.md)  | AdminPage、DataTable 等业务 Shell |

## 文档约定

* **duty / states**：以 registry 机读条目为准（`packages/ocpui/core/vue/registry/`）
* **Demo**：Markdown `::: demo` 内嵌 Vue 源码，构建时编译为可交互预览
* **规格冲突**：以 [spec/index.md](../spec/index.md) 为准

## 生成骨架

```bash
pnpm --filter @ocpui/docs run gen:components
```