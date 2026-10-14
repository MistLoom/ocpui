---
id: F:CONTAINER-CHAIN
doc_type: foundation
parent: O:ROOT
related:
  - F:TIER-CARRIER
  - F:PERCEPTION
  - F:INTERACTION-NET
  - F:MOTION
  - G:SHELL
design_intent: "让 DOM 嵌套顺序与调度优先级一致，使焦点/呈现/反馈可预测"
scope: "UiRoot 链、调度优先级、dispatchRole、presentation-mode"
status: stable
---

# 容器链与调度

## 1. 语义容器链

```
UiRoot                         # 全局：theme / locale / feedback / portal / 默认 surface·scene
 └─ UiScenarioScope            # 可选局部：surface + scene + presentationMode 覆盖
     └─ AppShell               # 应用壳（消费方布局层，包外）
         └─ Shell (T3)         # AdminPage / Editor 壳
             ├─ #toolbar       # SizeScope sm
             ├─ #tabs          # 可选
             └─ Body            # 唯一主内容面（focus-host）
                 └─ Block / Part / Primitive
```

容器链 **MUST** 自顶向下挂载；跳过 UiRoot 则 feedback/theme/locale 无保证。

## 2. 调度优先级

来自 ui-design-planning 状态调度模型，在 OCP 中 **机读化**：

```
焦点 > 呈现模式 > 元素 > 样式 > 动效 > 氛围
```

| 优先级 | OCP 承载 | 实现要点 |
|--------|---------|---------|
| 焦点 | Shell `dispatchRole: focus-host` | Body 内单一主焦点；Modal 锁定 trap |
| 呈现模式 | `data-ui-presentation-mode` | scan / summary / detail / progressive |
| 元素 | slot 结构、`composes` | 位置稳定，禁止 key 整表刷新 |
| 样式 | L3 surface / L4 scene token | 降焦：opacity / contrast，见 visual-language |
| 动效 | registry `motion` | 服从 motion-system，不可抢焦点 |
| 氛围 | theme L2 preset | 最低优先级；禁止持续装饰动效 |

**冲突规则**：用户主动操作 > 系统自动 > 定时；同优先级后到覆盖先到。

## 3. Shell dispatchRole

T3 registry **SHOULD** 声明：

| dispatchRole | 职责 | 示例 |
|--------------|------|------|
| `focus-host` | 持有主焦点，编排 Body | AdminPage Body |
| `chrome-host` | 工具栏/标签，不抢 Body 焦点 | AdminPage #toolbar |
| `overlay-host` | 浮层，触发背景降焦 | Modal, Drawer（T1，联动 Shell） |
| `content-host` | 数据体，继承 Shell 焦点策略 | AdminWorkList, DataTable |

Modal/Drawer 打开时：
1. 背景进入降焦（权重 W4，opacity + 可选 blur，token 见 [perception](./perception.md) §4.2）
2. 焦点锁定 overlay-host（overlay 自身权重 W3）
3. 关闭后焦点回触发源（focusPolicy: `restore-trigger`），背景权重还原

焦点权重分级（W0–W4）与转移路径统一定义在 [perception](./perception.md) §4；dispatchRole 决定谁是焦点宿主，权重决定各宿主的视觉注意力分配。

## 4. presentationMode

`UiScenarioScope` 扩展 prop / attribute：

| 模式 | 适用 | 呈现 |
|------|------|------|
| `scan` | 队列、列表筛选 | 紧密密度，可扫读 |
| `summary` | 任务项、卡片 | 标准密度，理由+状态+动作邻近 |
| `detail` | 详情对照 | 宽松，辅助信息渐进披露 |
| `progressive` | 向导、分步表单 | 步骤条 + 焦点追踪 |

与 `surface` / `scene` 正交：surface 管 token 差量，presentationMode 管信息密度与焦点策略。

## 5. 容器决策表（继承改造方案 §0.3）

| 场景意图 | 必选容器 | 主内容 | dispatchRole | 禁止 |
|----------|----------|--------|--------------|------|
| 列表 CRUD | AdminPage + surface=list | DataTable / AdminWorkList | focus-host + content-host | Card 包表格；页根 padding |
| 详情只读 | AdminPage 或 scope surface=detail | Descriptions / Card | focus-host | 自建 header 块 |
| 表单录入 | scene=editor + surface=form | Form + FormItem | focus-host | 页内自建校验 UI；**FormItem 禁止 margin-bottom，字段节奏由 Form gap 承担** |
| 弹窗确认 | surface=overlay | Modal / Dialog | overlay-host | createApp 挂 Message |
| 抽屉编辑 | surface=overlay | Drawer | overlay-host | Modal+Drawer 双壳并行 |
| 图表指标 | surface=chart | Chart 系 | content-host | 外层装饰 Card |
| 筛选摘要行 | AdminPage #toolbar 或 Body 内 `.filter-bar` | FilterTagGroup + ActiveFilterTags | chrome-host / content-host | 组件根 `padding-block`；label 单独 margin |

## 6. DOM 与 data 属性

| 属性 | 注入者 | 用途 |
|------|--------|------|
| `data-ui-surface` | UiRoot / UiScenarioScope | L3 token 差量 |
| `data-ui-scene` | UiRoot / UiScenarioScope | L4 token 差量 |
| `data-ui-presentation-mode` | UiScenarioScope | 密度与焦点策略 |
| `data-ui-dispatch-role` | Shell 根元素 | 调度器识别 |
| `data-ui-focus-policy` | overlay 类 | restore-trigger / lock |

## 7. 决策追溯

| 决策 | 依据 | 表现 |
|------|------|------|
| 调度写进容器链 | 避免各组件自行改 opacity/z-index | dispatchRole + 优先级文档 |
| AppShell 包外 | 绑定路由菜单 | integration/admin-app-shell.md |
| presentationMode 扩展 | 同 surface 下列表 vs 详情密度不同 | UiScenarioScope prop |
