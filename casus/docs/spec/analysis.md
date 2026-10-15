# OCP 融合分析

> 本文档记录 ui-design-planning 吸收进 OCP 的完整分析结论。规格正文见同目录各 foundation/guides 文件。

## 1. 现有 OCP 基线

OCP 已具备：

- **Tier T0–T4** 分包与升降级规则
- **容器链** UiRoot → UiScenarioScope → AppShell → Shell
- **机读 Registry** 204 条 YAML frontmatter + `ocp` CLI
- **L1–L4 主题** contract + surface/scene 差量
- **反馈桥** `createUiFeedbackBridge`（message/dialog/notify/loading）
- **组合约束** SizeScope、PopupPanel、antiPatterns、7 步选型

偏**工程选型与组合**，尚未系统化：职责字段、10 态契约、调度优先级、双通道责任、动效四元组、语义 ID、决策追溯。

## 2. 契合点（约 60% → 目标 90%）

| 设计精髓 | OCP 已有 | 缺口 |
|---------|---------|------|
| 层级/载体 | Tier + 容器链 | L5 流程层仅应用 |
| 呈现模式 | surface/scene | presentationMode |
| 机读知识 | Registry | v2 扩展字段 |
| 反馈集中 | UiRoot | action/system 分责 |
| 组合优于配置 | slots/composes | 状态编排标准 |
| 底线 | antiPatterns | decisions 追溯 |

## 3. 架构层融合策略

```
spec/           ← 设计-工程桥接（本次产出）
core/*/registry/      ← v2 机读知识
core/vue/   ← Provider、双通道、UiDataState 类型、motion token
core/vue-admin/ ← Shell dispatchRole、useUiRegionState
apps/admin/           ← AppShell、T4、L5 上下文
```

**不替换** `docs/组件库改造方案.md`（迁移施工）；**并行** Tier 与 L1–L5（tier-and-carrier.md）。

## 4. 逻辑层融合策略

| 能力 | 落地 |
|------|------|
| 10 态 | `UiDataState` 枚举 + Shell composable |
| 双通道 | useUiFeedback 内部分层 + feedbackChannel |
| 调度 | dispatchRole + 优先级 + presentationMode |
| 动效 | registry motion 四元组 + CSS vars |
| 语义 ID | C:/K:/S: + CI 唯一性 |
| 追溯 | registry decisions[] |

## 5. 已确立架构决策

1. **Registry v2 扩展** — 不推翻 v1，渐进 CI
2. **OCP 专用 ID 前缀** — 与 `.design-*` 分离
3. **双通道门面不变** — S4 内部分层，避免破坏调用方
4. **10 态强制 T2+ 数据型** — T0 仅 interactionStates
5. **动效强制 animation+overlay** — 四元组进 registry
6. **spec 与 guide 分工** — 权威 vs 消费指南
7. **AppShell 包外** — 不变

## 6. 实施顺序

S0 规格 → S1 ID → S2 状态 → S3 调度 → S4 双通道 → S5 动效 → S6 追溯

与改造 Phase 0–6 对齐，见 [index.md](./index.md)。

## 7. 协调者待确认项（默认采纳）

| 项 | 默认决策 |
|----|---------|
| 草案立场 | 组件库规格 stable；registry v2 字段渐进 draft→stable |
| Tier vs L 载体 | 并行映射 |
| v2 时机 | Phase 0 schema + id stub |
| 10 态范围 | T2+T3 |
| 动效范围 | animation + overlay |

若需调整，在 reality-feedback 或 corrections-log 记录后修正规格。
