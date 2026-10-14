---
id: O:ROOT
doc_type: index
children:
  - O:ESSENCE
  - F:PHILOSOPHY
  - F:TIER-CARRIER
  - F:CONTAINER-CHAIN
  - F:REGISTRY-SPEC
  - F:SEMANTIC-IDS
  - F:STATE-SYSTEM
  - F:PERCEPTION
  - F:INTERACTION-NET
  - F:MOTION
  - F:VISUAL-LANG
  - F:DOC-WIKI
  - G:SELECTION
  - G:AUTHORING
  - G:SHELL
  - G:T4-BOUNDARY
  - I:UIP-MAP
  - I:APP-SHELL
  - I:DOCS-SYNC
scope: "OCP 组件库设计体系入口：哲学、架构契约、Registry、容器链、状态/交互/动效系统"
status: stable
---

# OCP 设计体系

## 一句话

以 **可组合层级（Tier）+ 类 OKF 语义容器链 + 机读 Registry** 约束组件设计与选用；吸收 ui-design-planning 的**职责锚定、调度优先级、双通道反馈、10 态语义、动效四元组**，使每一行代码与每次选用可追溯、可机读、可生长。

## 文档分工

| 文档 | 职责 |
|------|------|
| **本目录 `spec/`** | 设计-工程桥接规格（权威） |
| **`guide/`、`components/`** | VitePress 消费指南与 Demo |
| **`packages/ocpui/core/vue/registry/`** | 机读组件知识（随 npm 发布） |

## 导航

### 分析

| 文件 | 摘要 |
|------|------|
| [analysis.md](./analysis.md) | ui-design-planning 融合分析、契合度、架构决策与实施顺序 |

### 本质与哲学

| ID | 文件 | 摘要 |
|----|------|------|
| O:ESSENCE | [essence.md](./essence.md) | OCP 本质职责、admin 边界、与消费方应用分层 |
| F:PHILOSOPHY | [foundation/philosophy.md](./foundation/philosophy.md) | 方向与底线、活系统、决策追溯 |

### 架构契约

| ID | 文件 | 摘要 |
|----|------|------|
| F:TIER-CARRIER | [foundation/tier-and-carrier.md](./foundation/tier-and-carrier.md) | T0–T4 ↔ L1–L5 映射 |
| F:CONTAINER-CHAIN | [foundation/container-chain.md](./foundation/container-chain.md) | 容器链 + 调度优先级 |
| F:REGISTRY-SPEC | [foundation/registry-spec.md](./foundation/registry-spec.md) | Registry v2 frontmatter 契约 |
| F:SEMANTIC-IDS | [foundation/semantic-ids.md](./foundation/semantic-ids.md) | OCP 语义 ID 编码 |

### 逻辑系统

| ID | 文件 | 摘要 |
|----|------|------|
| F:STATE-SYSTEM | [foundation/state-system.md](./foundation/state-system.md) | 10 态 + Shell 编排 |
| F:PERCEPTION | [foundation/perception.md](./foundation/perception.md) | 信号分层收编 + 焦点权重 + 场景策略包 + 联动 |
| F:INTERACTION-NET | [foundation/interaction-network.md](./foundation/interaction-network.md) | 双通道 + 载体关联 |
| F:MOTION | [foundation/motion-system.md](./foundation/motion-system.md) | 动效四元组 + 降级 |
| F:VISUAL-LANG | [foundation/visual-language.md](./foundation/visual-language.md) | L1–L4 token + 多通道状态 |
| F:LAYER-STACK | [foundation/layer-stack.md](./foundation/layer-stack.md) | 浮层 z-index + Teleport 约束 |
| F:DOC-WIKI | [foundation/doc-wiki-system.md](./foundation/doc-wiki-system.md) | MD Wiki 阅读/编辑、检索、SSG |

### 实施指南

| ID | 文件 | 摘要 |
|----|------|------|
| G:SELECTION | [guides/selection-protocol.md](./guides/selection-protocol.md) | 选型协议（含职责锚定前置） |
| G:AUTHORING | [guides/component-authoring.md](./guides/component-authoring.md) | 新增/改造 T0–T3 规范 |
| G:SHELL | [guides/shell-composition.md](./guides/shell-composition.md) | Shell 组合与状态编排 |
| G:QUICK-INTEG | [guides/quick-integration.md](./guides/quick-integration.md) | 业务项目快速接入 |
| G:T4-BOUNDARY | [guides/t4-boundary.md](./guides/t4-boundary.md) | ui-business 边界 |

### 集成

| ID | 文件 | 摘要 |
|----|------|------|
| I:UIP-MAP | [integration/ui-design-planning-map.md](./integration/ui-design-planning-map.md) | 设计技能 ↔ OCP 对照 |
| I:APP-SHELL | [integration/admin-app-shell.md](./integration/admin-app-shell.md) | AppShell 包外契约 |
| I:DOCS-SYNC | [integration/ocpui-docs-sync.md](./integration/ocpui-docs-sync.md) | 文档同步策略 |

### 机读 Schema

| 文件 | 摘要 |
|------|------|
| [registry/frontmatter-v2.schema.yaml](./registry/frontmatter-v2.schema.yaml) | Registry v2 JSON Schema |

## MUST follow

1. 新增 T0–T3 组件：registry 条目 + 语义 ID + tier 合规 + antiPatterns
2. 数据型 Block/Shell：声明 `handlesStates` 或委托 Shell 编排
3. 反馈：经 `UiRoot` 注入的 `useUiFeedback()`，区分 action/system 通道
4. 动效：animation/overlay 类组件 registry 声明 `motion` 四元组，`trigger` 取自 [perception](./foundation/perception.md) §5 受控词表
5. 选中/焦点权重：使用 [perception](./foundation/perception.md) §4 权重 token，禁止组件私有 opacity/blur
6. 场景定制：经 [perception](./foundation/perception.md) §11 场景策略包（识别 + 响应声明）；禁止策略内直调 motion/feedback；情绪概率归 T4 映射策略 id
7. 选型：先职责锚定，再走 [选型协议](./guides/selection-protocol.md)

## MAY explore

- T4 在 apps 内组合 T0–T3，形态可变
- `ocp add` 本地覆盖，registry ID 不变
- 扩展基础（interaction/motion）从具体 Shell 自下而上修正

## 实施顺序

| 阶段 | 内容 | 对齐改造 Phase |
|------|------|----------------|
| S0 | 本规格就绪 | ✅ |
| S1 | Registry 补 `id` + CI 唯一性 | ✅ |
| S2 | `UiDataState` + `useUiRegionState` + AdminWorkList | ✅ |
| S3 | `presentationMode` + Shell `dispatchRole` | ✅ |
| S4 | feedback `action`/`system` 双通道 | ✅ |
| S5 | motion 四元组 + theme token + `useReducedMotion` | ✅ |
| S6 | T3 示范 `decisions[]` + CI 门禁 | ✅ |
| S7 | 间距/密度/overlay 覆盖门禁 + 8 类 type CSS | ✅ |
| S8 | F:PERCEPTION：信号分层收编 + 焦点权重 token + motion.trigger 受控词表 | ✅ |
| S9 | 感知运行时：类型化信号 + 策略链 + 中央控制器 + overlay 统一收口 | ✅ |
| S10 | 场景策略包：PerceptionStrategy schema + 15 builtin + Registry/Scope API + respond 广播 | ✅ |

S7 覆盖矩阵见 [component-authoring §11](./guides/component-authoring.md#11-设计系统覆盖门禁)。
