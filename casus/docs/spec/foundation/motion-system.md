---
id: F:MOTION
doc_type: foundation
parent: O:ROOT
related:
  - F:PERCEPTION
  - F:CONTAINER-CHAIN
  - F:STATE-SYSTEM
  - F:VISUAL-LANG
design_intent: "用最少变化解释焦点、状态、空间来源与进度，且可停止、可降级"
scope: "动效四元组、时长分级、theme token、强制范围"
status: stable
---

# 动效系统

## 1. 职责边界

动效 **只解释四件事**：

1. 焦点落点
2. 状态变化
3. 临时内容空间来源
4. 异步进度

**不承担**：装饰、品牌表现、填补空状态视觉空白。

关闭动效后，文字+位置+形态仍须完整（state-system 多通道）。

## 2. 四元组 schema（registry `motion`）

```yaml
motion:
  trigger: pointer_hover | pointer_press | user_select | user_submit | overlay_open | expand_panel | list_update | focus_transfer | system_event  # 见 perception §5
  purpose: explain_focus | explain_state | explain_spatial_origin | explain_progress
  tier: micro | light | medium | heavy | scene
  interruptible: true | false
  stopWhen: result_readable | user_acknowledged | focus_stable
  mustNot: [steal_focus, reorder_selection, imply_success]
```

| 字段 | 说明 |
|------|------|
| trigger | 触发条件，**MUST** 取自 [perception](./perception.md) §5 受控词表，schema enum 约束 |
| purpose | 服务的判断问题 |
| tier | 时长分级，映射 theme token |
| interruptible | >500ms 须 true |
| stopWhen | 停止条件，须可验证 |
| mustNot | 硬约束，CI 可 lint |

## 3. 时长分级与 token

| tier | 时长 | CSS 变量（S5 纳入 themes/contract） |
|------|------|--------------------------------------|
| micro | 50–150ms | `--duration-micro` |
| light | 150–300ms | `--duration-light` |
| medium | 300–500ms | `--duration-medium` |
| heavy | 500–1000ms | `--duration-heavy` |
| scene | >1000ms | 须 purpose + 可跳过 |

缓动：

- `--ease-standard` — 通用
- `--ease-enter` — 进入视区
- `--ease-exit` — 离开视区

**约束**：单次用户操作累计动效 ≤600ms；同屏并发独立动效 ≤3 组。

## 4. 强制声明范围

| 组件类 | motion 必填 |
|--------|------------|
| registry/animation/* | 是 |
| Modal, Drawer, Dialog, PopupPanel | 是 |
| CollapseTransition, ListTransition | 是 |
| Button, Input 等 T0 | 否（仅 interactionStates） |
| AdminWorkList 态切换 | purpose=explain_state, tier=micro 或 none |

**CI 门禁**：`core/vue/scripts/check-registry-contract.mjs`（`pnpm --filter @ocpui/vue check:registry`）对上表「是」的类别强制要求 `motion` 四元组，并校验字段取值：

- 强制范围：`registry/animation/*`；overlay：Modal、Drawer、Dialog、ConfirmDialog、PopupPanel、Overlay、Popover、Tooltip、Popconfirm、Popselect、ContextMenu、Message、Notification、LoadingOverlay；过渡原语：CollapseTransition、ListTransition（`registry/primitives/`）；Shell：AdminWorkList。
- 任一声明了 `motion` 的条目都会做受控词表校验；`tier: none` 仅在 `purpose: explain_state` 时合法；`heavy` / `scene` 须 `interruptible: true`。
- Button、Input 等 T0 控件不在强制范围，新增强制项须先改本节再改脚本。

## 5. 典型映射

trigger 取值见 [perception](./perception.md) §5；mustNot 基线同该节规则 3。

| 场景 | trigger | purpose | tier | mustNot |
|------|---------|---------|------|---------|
| Drawer 打开 | overlay_open | explain_spatial_origin | light | steal_focus（背景仍可读） |
| 任务选中（T0 控件） | user_select | explain_focus | micro | reorder_selection |
| 行/卡片选中（T2） | user_select | explain_focus | light（权重升入，见 perception §4.3） | reorder_selection |
| 新任务到达 / 行 patch | list_update | explain_state | light | steal_focus, reorder_selection |
| 提交中 / 连点 | user_submit | explain_progress | micro | imply_success |
| 列表筛选结果 | list_update | explain_state | light | 整表大幅移动 |
| 向导步骤推进 | focus_transfer | explain_focus | medium | 不可中断超 500ms |
| 加载 / 后台任务 | system_event | explain_progress | micro 起 | imply_success |

## 6. 任务压力与 presentationMode

| presentationMode | 节奏 | 动效策略 |
|------------------|------|---------|
| scan | 紧密 | 局部、短促；禁止持续脉冲 |
| summary | 标准 | 选中过渡平稳 |
| detail | 宽松 | 静态层级为主，展开用 light |
| progressive | 步骤 | 焦点追踪 medium，可中断 |

## 7. prefers-reduced-motion

全局 `useReducedMotion()`（S5）：

- 非必要 transition → 0 或 ≤50ms
- 保留：进度条前进、必要 opacity 切换
- registry `motion.tier` 在降级时映射为 `none` 或 `micro`

## 8. 六项原则（对齐 ui-design-planning）

1. **目的性** — purpose 必填
2. **可感知性** — tier 与信息重要性匹配
3. **一致性** — 同类 trigger 共享 tier/ease
4. **克制** — 默认最简，证明必要再加
5. **可中断** — 用户操作优先于动画
6. **无障碍** — reduced-motion 分支 first-class

## 9. 禁止

- 闪烁、流光、粒子、Confetti 作常规反馈
- 新数据到达强制重排选中项
- submitting/waiting 动画像 success
- 用动效填补 Empty 区域

## 10. 决策追溯

| 决策 | 依据 | 表现 |
|------|------|------|
| 四元组进 registry | 散落 CSS 不可审查 | registry-spec v2 |
| overlay 强制 | 空间来源需可感知 | Modal/Drawer motion |
| 列表更新禁止大幅移动 | 工作记忆 | mustNot reorder_selection |
