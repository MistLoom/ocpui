---
id: F:TIER-CARRIER
doc_type: foundation
parent: O:ROOT
related:
  - F:CONTAINER-CHAIN
  - F:REGISTRY-SPEC
  - G:T4-BOUNDARY
design_intent: "统一工程 Tier 与设计载体分级，避免双轨命名冲突"
scope: "T0–T4 与 L1–L5 映射、升降级规则"
status: stable
---

# Tier 与载体分级

## 1. 并行映射

OCP **保留 Tier**（工程分包与 npm 边界）；ui-design-planning **载体 L1–L5**（交互影响范围）。二者并行，通过下表互译。

| OCP Tier | 名称 | 载体 | 影响范围 | 典型组件 |
|----------|------|------|---------|---------|
| **T0** | Primitive | **L1 元素** | 自身交互态 | Button, Input, Badge |
| **T1** | Part | **L2 单元**（结构） | 单元内子元素 | Form, Modal, Drawer |
| **T2** | Block | **L2 单元**（段落） | 区域级段落 | ConfirmDialog, Empty, ErrorStateBlock |
| **T3** | Shell | **L3 区域** | 页面分区 | AdminPage, AdminWorkList, DataTable |
| **T4** | Product | **L4 页面 / L5 流程** | 全页或跨页 | EntryEditor, TaskItem（apps/ui-business） |
| — | — | **L5 流程** | 跨页上下文 | 路由 + store 协议（应用层，非 OCP 组件） |

**L5** 无对应 Tier：跨页上下文由应用层协议实现，OCP 通过 [interaction-network](./interaction-network.md) 定义容器与反馈边界。

## 2. Tier 职责（不变）

| Tier | 包 | 禁止 |
|------|-----|------|
| T0 | `@ocpui/vue` | 页面语义 prop；领域数据类型 |
| T1 | `@ocpui/vue` | 绑定 API 响应 shape |
| T2 | `@ocpui/vue` 或 `@ocpui/vue-admin` | 领域模型；须声明 states/motion（如适用） |
| T3 | `@ocpui/vue-admin` | 业务 store；须声明 dispatchRole |
| T4 | `apps/*/ui-business` | import 业务 API 进 packages；复制 T0 样式 |

## 3. 升降级规则

- 第二处产品复用同一 Block → 上提到 T2/T3，写入 registry。
- T4 只组合 T0–T3；出现 T0 样式复制 → 下沉为 T0 或 Block。
- Shell 内重复状态分支 → 提取 T2 Block 或扩展 AdminWorkList 模式。

## 4. 载体与 Registry 字段

| 载体 | 建议 registry 字段 |
|------|-------------------|
| L1 T0 | `interactionStates: [hover, focus, disabled, loading]` |
| L2 T1/T2 | `handlesStates` 或 `delegatesStatesTo` |
| L3 T3 | `dispatchRole`, `focusPolicy`, `handlesStates` |
| L4/5 T4+ | 引用 OCP `S:` 模式 ID，不重复定义 T0–T3 |

## 5. 决策追溯

| 决策 | 依据 | 表现 |
|------|------|------|
| 保留 Tier 命名 | 改造方案已全库使用 | package.json、目录、CLI |
| 增加 Carrier 对照 | 与设计技能调度模型对齐 | 本文档 + Shell dispatchRole |
| L5 不归 OCP 组件 | 流程上下文属应用 | interaction-network 跨页协议 |
