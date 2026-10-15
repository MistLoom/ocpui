---
id: O:ESSENCE
doc_type: essence
parent: O:ROOT
related:
  - F:PHILOSOPHY
  - F:TIER-CARRIER
  - G:T4-BOUNDARY
  - I:UIP-MAP
design_intent: "约束 admin 界面组合方式，使 AI 与开发者在无业务上下文下仍能正确选型与编排"
scope: "OCP 包体系本质职责、系统位置、admin 场景边界"
status: stable
---

# OCP 本质

## 1. 职责锚定

### 本质职责

约束后台界面从原语到 Shell 的组合方式，提供可机读的组件知识，使选用、实现、审查均能在**无领域数据模型**前提下完成正确决策。

### 发展方向

从「组件清单 + Tier 分层」演进为「语义 ID + 调度链 + 状态/交互/动效契约」的活体系；Registry 承载职责与决策追溯，容器链承载调度优先级，逻辑层承载双通道与 10 态。

### 系统位置

| 边界 | 内容 |
|------|------|
| **上游** | 设计体系（`.design-*/`）、本仓库 `casus/docs/spec`、典型后台产品场景 |
| **下游** | 消费方应用（AppShell、T4 领域组件层）、Vite/Nuxt 站点 |
| **不承担** | 领域 API、业务 store、路由守卫、工作流状态机（属 T4/应用层） |
| **不承担** | 替代页面级设计产出；OCP 提供工程约束，不替代 `.design-*/` 的场景叙事 |

## 2. 场景叙事（admin 约束内）

- **角色**：平台管理员、编辑、审核、运维——多在高信息密度桌面端完成判断型任务。
- **环境**：列表筛选、详情对照、弹窗确认、异步传播跟踪；移动端保留核心判断，减少并行区域。
- **任务**：选型 → 容器链挂载 → 状态分支完整 → 反馈就近 → 跨页返回不丢上下文。
- **担忧**：同功能多形态导致分裂；loading/error 合并为「待处理」；系统推送抢焦点；动效掩盖状态语义。
- **异常**：部分失败、无权限、提交中、成功后续（传播未完成）须独立表达。

### 场景优先级

| 优先级 | 场景 | 约束力 |
|--------|------|--------|
| **首要** | 后台工作台（列表、详情、表单、审核、运维） | 本文与 `foundation/*` 的契约均以此为准；冲突时以 admin 为裁决依据 |
| 扩展演示 | 面向终端用户的内容应用（playground `/full/consumer-app`） | 用于验证响应式、移动端与 T0–T2 原语的通用性；不新增独立契约，不改变 admin 优先的取舍 |

C 端演示发现的问题若需改动契约，须先说明对 admin 场景的影响，再按 [reality-feedback](./reality-feedback/corrections-log.md) 记录。

## 3. 与 ui-design-planning 的关系

| 设计技能产出 | OCP 承接方式 |
|-------------|-------------|
| essence / foundation | 映射为 `spec/foundation/*` + Registry v2 字段 |
| pages/*/states | 映射为 `UiDataState` + Shell `handlesStates` |
| pages/*/interaction | 映射为双通道 + 容器链调度 |
| pages/*/motion | 映射为 `motion` 四元组 + theme token |
| shared/* (S:) | 映射为 OCP `S:` 跨页模式 + T4 引用 ID |

详见 [integration/ui-design-planning-map.md](./integration/ui-design-planning-map.md)。

## 4. 包归属

| 包 | Tier | 职责 |
|----|------|------|
| `@ocpui/vue` | T0–T2 | 原语、组合件、通用 Block；feedback/theme/locale/cli |
| `@ocpui/vue-admin` | T2–T3 | admin Block、Shell；列表/页面范式 |
| 消费方 `ui-business`（包外） | T4 | 领域组件；只组合 T0–T3 |

仓库根目录物理分组：

| 子目录 | 包 |
|--------|-----|
| `core/` | `vue`、`vue-admin`、`vue-docs` |
| `tool/` | `markdown-core`、`docgen` |
| `casus/` | `docs`（内容站）、`playground`（演示） |

npm 包名（`@ocpui/*`）不变；仅 monorepo 内目录归组。

## 5. 底线（跨形式不变）

1. T0–T3 零应用 `@/`、业务 api-client
2. 反馈经 `UiRoot` 单入口
3. 容器链不可跳过（除文档明示的 AppShell 包外边界）
4. 状态语义不可合并（等待 ≠ 失败 ≠ 成功后续）
5. 用户动作与系统事件分通道表达

## 6. 决策追溯

| 决策 | 依据 | 表现 |
|------|------|------|
| Registry 随包发布 | AI/消费方脱离 monorepo 选型 | `core/*/registry/` |
| AppShell 留 apps | 应用壳绑定路由/菜单/权限 | [integration/admin-app-shell.md](./integration/admin-app-shell.md) |
| Tier 保留 + Carrier 映射 | 工程分层已落地，设计技能用 L1–L5 | [foundation/tier-and-carrier.md](./foundation/tier-and-carrier.md) |
| 规格与迁移文档分离 | 活体系 vs Phase 施工 | 本目录 vs `组件库改造方案.md` |
