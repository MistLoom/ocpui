---
id: F:VISUAL-LANG
doc_type: foundation
parent: O:ROOT
related:
  - F:STATE-SYSTEM
  - F:PERCEPTION
  - F:MOTION
  - F:CONTAINER-CHAIN
design_intent: "全库视觉参数从同一基准派生，状态可扫读且不依赖单一通道"
scope: "L1–L4 主题、间距/圆角、降焦、语义色、交互态"
status: stable
---

# 视觉语言

## 1. 四级主题（继承 OCP §0.6）

| 级别 | 机制 | 维护者 | 示例 |
|------|------|--------|------|
| L1 Token | `themes/contract` 语义变量 | 设计系统 | `--primary`, `--border`, `--surface` |
| L2 Style | `themeStyle` preset | 品牌 | `tech`, `editorial` |
| L3 Surface | `data-ui-surface` | 容器/区块 | `list`, `form`, `overlay`, `chart`, `detail` |
| L4 Scene | `data-ui-scene` | 页面壳 | `workbench`, `editor`, `settings`, `audit` |

L3/L4 只覆盖 **差量 token**；未定义组合回退 L2。

定制入口唯一：`UiRoot` + `UiScenarioScope`。

## 2. 间距与密度

| 档位 | 用途 | 与 presentationMode |
|------|------|---------------------|
| tight | 队列、表格行、工具栏 | scan |
| standard | 表单、卡片内容 | summary |
| relaxed | 详情、恢复说明、空状态 | detail |

组件 **禁止** 自定义 padding scale；使用 `--space-*` / `--space-4-*` 或 SizeScope（sm/md/lg）。

### 2.1 容器与组件间距职责

| 职责 | 归属 | 允许 | 禁止 |
|------|------|------|------|
| 与兄弟区块的 **margin**、页面 **inline inset**、区块 **padding-block** | **容器**（AdminPage Body、Stack、#toolbar 行、业务 `__filters` 区） | `padding` / `gap` on wrapper | 在 T0 组件根上写 `margin-*` 假定页面位置 |
| 行内 **label ↔ 控件** 对齐、chip 间距、控件 **intrinsic 高度** | **组件**（FilterTagGroup、ActiveFilterTags） | `gap`、`align-items: center`、共享 `ocp-filter-row` | 根节点 `padding: Npx 0`；子 label 单独 `padding-top` / `margin-left` 做光学补偿 |
| pill 尺寸（sm/md/lg） | **主题令牌** `--pill-*` | Chip / FilterTag / Tag-sm / 清除按钮共用 | 各组件私有 `--filter-hit` 或硬编码高度 |

**对齐规则**

1. 组件根 **MUST NOT** 设置对外 `margin` 或非零 `padding-block`，除非组件即容器（T3 Shell）。
2. 行首 label **MUST** 通过 `line-height: var(--pill-height-*)` 与 pill 垂直居中，**禁止** `padding-top` 微调。
3. 筛选行组件 **SHOULD** 使用 `themes/filter-row.css` 中的 `ocp-filter-row*` 类，保证 FilterTagGroup 与 ActiveFilterTags 视觉一致。
4. 页面居中/栅格由容器 `display:flex; justify-content` 或 Grid 承担；组件保持 `inline-flex` 或 `width:100%`（`block` prop）即可。

详见 [component-authoring.md §10](../guides/component-authoring.md#10-容器与组件间距职责)。

### 2.2 组合模式（Phase 2）

样式定义见 `themes/shared/combination-patterns.css`。

| 模式 | 组件组合 | 容器职责 | 移动策略 |
|------|----------|----------|----------|
| filter-row | FilterTagGroup + ActiveFilterTags + Search | 外层 `gap`；`ocp-filter-row` 对齐 | 筛选行 `flex-direction: column` |
| form-submit | Form 字段 + ConfigActionBar / Modal footer | `ocp-form-action-bar` 底栏 + safe-area | 按钮全宽、逆序堆叠 |
| list-page | Table/DataTable + SelectionToolbar + Pagination | 表格容器 `overflow-x`；`.ocp-list-page-stack` gap | 选择条 `ocp-list-selection-bar` 底固定 |
| detail-panel | Descriptions / Card + 侧栏 | `.ocp-detail-panel` 双栏 gap | 单栏 stack |
| chart-dashboard | MetricCard grid + Chart | `.ocp-chart-dashboard`；`surface=chart` | 2→1 列 |
| progressive-wizard | Steps + Form + action bar | `.ocp-progressive-wizard` | 步骤条简化 |

Shell 页面内边距由 `.admin-page__body` + `--page-inline-*` token 承担，组件根禁止对外 margin。

## 3. 圆角

| 用途 | 尺度 |
|------|------|
| 交互控件（Button, Input） | 小圆角 token |
| 内容分组（Card, Panel） | 大圆角 token，须有明确分组语义 |

禁止「万物 Card」：无 grouping 关系不用 Card 容器。

## 4. 层级手段

**主手段择一**：背景分组 **或** 描边 **或** 阴影，避免混用多套。

admin 默认：背景分组为主，描边辅助（对齐内置 editorial 主题基准）。

## 5. 语义色

| 角色 | 用途 | 边界 |
|------|------|------|
| primary | 主操作 | 一屏一个主 CTA |
| success | 成功确认 | 不单独表达 partial_error |
| warning | 待复核、风险 | 不制造持续紧迫感 |
| error | 失败、阻断 | 配文案与恢复路径 |
| muted | 辅助、降焦 | 非 disabled |

状态 **须** 形+色+文案；禁止仅 color 区分 ready/error/forbidden。

## 6. 字体层级

| 级别 | 用途 |
|------|------|
| title | 区域标题 |
| body | 正文 |
| caption | 辅助、元数据 |
| data | 数字、指标（等宽/tabular 优先） |

## 7. 交互态（T0 统一语法）

| 态 | 反馈 |
|----|------|
| default | 可识别边界 |
| hover | 形态微变（tier=micro），权重 W1，见 [perception](./perception.md) §4 |
| focus | 可见 focus ring |
| active | 按下形态 |
| selected | 持久选中：主语义色描边/面 + `aria-selected`，权重 W2；**禁止**用脉冲动画表达 |
| disabled | 对比度降低 + 不可操作 |
| loading | 形态+文案，禁止仅 spinner |

全库同一语法；禁止某 Button 单独 invent hover shadow。selected 态的视觉参数取自 `--focus-weight-*` token，禁止组件私有选中色。

## 8. 降焦（样式调度）

低优先级区域 **不消失**，降焦是焦点权重 W4 的视觉表达，手段与 token 统一见 [perception](./perception.md) §4：

- opacity 降低为主手段（`--focus-weight-deemph-opacity`）
- blur 可选（overlay 声明时启用，`--focus-weight-deemph-blur`）
- contrast 微调（`--focus-weight-deemph-contrast`）

非 overlay 场景（侧栏展开、已读段落）SHOULD 使用同一组 token，禁止组件私有透明度。

与 container-chain 调度优先级一致：样式低于焦点。

浮层 z-index 与 Teleport 裁切规则见 [layer-stack.md](./layer-stack.md)。

## 9. 一致性派生

新组件视觉参数 **先扩展 contract**，再派生；禁止组件内补丁 `--radius: 13px`。

## 10. 禁止

- 霓虹、流光、无依据渐变、持续装饰动效
- 高饱和渐变大面积铺底
- 语义色纯装饰
- 大卡片只放一个次要数字

## 11. 决策追溯

| 决策 | 依据 | 表现 |
|------|------|------|
| surface/scene 已实施 | 改造方案 L3/L4 | UiRoot data 属性 |
| 降焦不消失 | ui-design 降焦保留原则 | overlay 背景策略 |
| 三档密度 | 任务压力分档 | presentationMode 联动 |
