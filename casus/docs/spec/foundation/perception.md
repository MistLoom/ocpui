---
id: F:PERCEPTION
doc_type: foundation
parent: O:ROOT
related:
  - F:INTERACTION-NET
  - F:MOTION
  - F:VISUAL-LANG
  - F:CONTAINER-CHAIN
  - F:STATE-SYSTEM
design_intent: "把输入收编为确定性信号，经策略产出可协同的响应意图，驱动焦点权重与多系统一致反应"
scope: "信号分层、焦点权重、motion.trigger 词表、场景策略包、运行时控制器契约"
status: stable
---

# 感知系统

## 1. 管线

感知管线固定为：**信号 → 识别 → 响应意图**。

- T0–T3 只产出**确定性**信号与意图；概率性推断（犹豫 / 急切 / 阅读模式等）**不进库**，归 T4（见 §3.4、§11.6）。
- 识别与响应意图由**场景策略包**声明（§11）；`KIND_PRESETS` 仅作 kind 词法兜底。
- 视觉 / 动效 / 反馈 **只消费**控制器产物，不互相直调；权重 token 见 [visual-language](./visual-language.md)，动效见 [motion-system](./motion-system.md)，调度宿主见 [container-chain](./container-chain.md)。

对齐 ui-design-planning 的感知→响应模型；OCP 将其收束为可机读契约与运行时 API。

## 2. 责任边界

| 层级 | 职责 | 落点 |
|------|------|------|
| **MUST 识别** | 库内控件必然产生且必须收编的信号 | T0–T3 组件 |
| **SHOULD 识别** | 常见但可按 registry 声明选用 | 组件 registry 字段 |
| **下放 T4** | 需页面叙事 / 业务上下文才能判别 | apps 策略或 Shell 注入 |
| **禁止进库** | 概率情绪标签、不可验证的「用户心情」字段 | 任意 Tier 契约与 schema |

## 3. 信号分层收编

本节「响应」指识别后的默认协同期望；「tier」取自 [motion-system](./motion-system.md) §3。场景级覆盖见 §11。

### 3.1 T0 控件

| 信号 | 约束 | 默认响应 | 权重路径 | tier |
|------|------|----------|----------|------|
| 悬停 / 离开 | MUST | 表明可点；**禁止**升为页内主焦点 | rest → afforded → rest | micro |
| 按下 / 抬起 | MUST | active 形态反馈 | afforded → afforded（脉冲） | micro |
| 提交（点击） | MUST | 进入提交反馈；与 submitting 数据态协同 | 权重不变（submitting 不占 W） | micro |
| 键盘焦点 / 失焦 | MUST | 可见 focus ring（≠ 选中 W2）；不改 DOM 选中语义 | rest → afforded → rest | micro |
| 提交-连点 | MUST | 默认 800ms 窗内忽略重复：submitting 态 + 防重复，**禁止**暗示成功 | 权重不变 | none |
| 禁用-点击 | MUST | token 降对比，不可操作 | — | - |
| 长按 | SHOULD | 经 registry 声明 `longpress` 后启用（如上下文菜单）；未声明则 **不** 识别 | afforded → afforded | micro |
| 右键 / 菜单 | 边界 | T0 不强制菜单；T2+ 需要时经 ContextMenu(T1) | - | - |

### 3.2 T1/T2 Block

| 信号 | 约束 | 默认响应 | 权重路径 | tier |
|------|------|----------|----------|------|
| 选中（行/卡片/树） | MUST | 唯一主焦点；原主焦点归 rest | 原 → primary；新 → primary | light（持久）/ micro（瞬时） |
| 列表-系统 patch / 他人变更 | MUST | systemChannel 原位 patch；**禁止**整表 key 重挂抢走选中 | 权重维持 rest / afforded，不升 W2 | light |
| 拖放 / 投放目标 | SHOULD | 目标 drop-zone 可投放提示；离开恢复 | 目标 rest → afforded | micro |
| 批量-选中工具条 | SHOULD | SelectionToolbar / BatchSelector 出现；不抢 Body 主叙事 | 工具条 → primary（局部） | light |
| 表单字段校验失败 | MUST | 贴近字段的 Form 反馈；不整页弹死 | 字段区 rest，可 afforded 警示 | light |

### 3.3 T3 Shell

| 信号 | 约束 | 默认响应 | 权重路径 | tier |
|------|------|----------|----------|------|
| overlay 打开（Modal/Drawer/Popup） | MUST | 滚动锁 + focus trap；背景不可点 | 背景 → deemphasized(W4)；overlay → elevated(W3) | light |
| overlay 关闭 | MUST | 释放锁；焦点恢复（`focusPolicy: restore-trigger`） | 恢复触发源 | light |
| 路由-进入 / 离开 | MUST(钩子) | Shell 提供保留 overlay 外的 scroll/selection 钩子；**禁止**库内假设路由实现 | 保持或归 rest（通常 W0） | light |
| 滚动-恢复 | MUST(钩子) | **禁止**库内偷偷改滚动位置；由 Shell 暴露 `restoreScroll` 钩子 | 不改权重 | none |
| 通知-到达（系统推送） | MUST | systemChannel notify 固定区 + 短反馈；**禁止**抢 Body 主焦点 | notify → afforded；Body 权重不变 | light |
| 快捷键-壳层 | 边界 | Tab / Esc / Enter 等与 T0 一致；页面级 chord 归 T4 | - | - |

### 3.4 下放 T4（概率 / 业务）

下列**不可**作为 T0–T3 契约字段；若产品需要，经 T4 策略注入（映射到 §11 策略 id）或 Shell 钩子：

| 能力 | 为何下放 | T4 接入方式 |
|------|----------|-------------|
| 犹豫 / 急切 / 阅读模式 | 概率 vs 确定性 | 可观测代理策略（§11.6）+ `restoreScroll` 等 |
| 跨页选中 + 返回定位 | 路由 | Shell 钩子 |
| 业务专属手势 chord | 产品 / 权限 | Shell 或页面策略 |
| 情绪-视觉（概率标签） | 不可验证 | 映射 `builtin:*` id，库不读情绪字段 |
| 情绪-动效 | 不可验证 | 同上 |
| 情绪-通道改写 | 不可验证 / 旁路风险 | 禁止改通道语义；仅可选启用策略 |

T4 产出 **MUST** 经 systemChannel 或 actionChannel 门面进入，不得绕过 T0–T3 控制器（禁止旁路：组件内私自改全局 W4）。

### 3.5 禁止的 Tier 行为

- hover / 焦点环自动升为页内主焦点
- 系统列表 patch 重排选中或抢焦点
- 提交成功仅靠动效 / 变色暗示
- 未声明 longpress 却弹出菜单
- 系统通知用 action 级 dialog 打断（复核类除外，走 notify）
- 同屏多个持久 primary 主焦点（overlay 例外：overlay primary + 背景 deemphasized）

## 4. 焦点权重

### 4.1 分级

| 级 | 名 | 语义 | 视觉手段（摘要） |
|----|------|------|------------------|
| W0 | rest | 默认在场 | 默认 surface / 字色 / 描边 |
| W1 | afforded | 可交互提示（hover、drop 目标等） | 轻底或描边；不改变选中语义 |
| W2 | primary | 页内主焦点 / 选中 | 主语义色 surface 与描边；态 + 形 + aria-selected |
| W3 | elevated | overlay-host | 抬升 surface + 阴影；可 trap |
| W4 | deemphasized | 背景降焦（overlay 开启） | opacity 为主，可选 blur；**不消失** |

规则：

1. **同一 focus-host 作用域内至多一个持久 W2**（瞬时 W2 动画帧除外）；新主焦点升起时旧主焦点归 W0。
2. W4 仅随 overlay-host 开启；T0/T2 不得私自给兄弟节点套 W4。
3. 权重变化 **MUST** 同步无障碍：W2 → `aria-selected` / `aria-current`，W3 → focus trap，W4 → `aria-hidden`（背景）或 inert。
4. disabled 用交互态表达，与 T0 一致；**禁止**用 W4 冒充 disabled。

### 4.2 权重 token（L1 contract）

落在 `themes/contract`，与 `visual-language` 对齐；组件只消费，L2 preset 不得另造：

| token | 对应 | 默认 |
|-------|------|------|
| `--focus-weight-rest-opacity` | W0 | 1 |
| `--focus-weight-afforded-bg` | W1 底 | `hsl(var(--primary) / 0.04)` |
| `--focus-weight-afforded-border` | W1 边 | `hsl(var(--primary) / 0.35)` |
| `--focus-weight-primary-bg` | W2 底 | `hsl(var(--primary) / 0.08)` |
| `--focus-weight-primary-border` | W2 边 | `hsl(var(--primary) / 0.6)` |
| `--focus-weight-elevated-surface` | W3 面 | `var(--background-elevated)` |
| `--focus-weight-elevated-shadow` | W3 影 | `var(--shadow-lg)` |
| `--focus-weight-deemph-opacity` | W4 主手段 | 0.58 |
| `--focus-weight-deemph-contrast` | W4 辅手段 | 0.92 |
| `--focus-weight-deemph-blur` | W4 可选 | 0px，overlay 声明 blur 时 2px |

`focus-deemphasis.css` 的 `--deemphasis-*` 须与上表同源，经 html 数据属性开关，禁止组件私有透明度。

### 4.3 转移时序

两宿主 A 失焦、B 获焦（含 overlay 开合）：

1. A 退出权重，时长 micro（50–150ms）
2. B 进入权重，时长 light（150–300ms），与 A 可重叠尾段
3. 背景降焦（W4）与 B 进入同相，整体 transition 取 light
4. 选中切换 **禁止** 用脉冲动画表达持久 W2（见 visual-language selected）

| 路径 | 表现 | tier | 备注 |
|------|------|------|------|
| A: W2 → W0，B: W0 → W2 | 选中移交 + 形态 | micro / light | aria-selected 同步 |
| overlay 开：背景 → W4，overlay → W3 | 降焦 + 抬升/trap | light | trap + 滚动锁 |
| overlay 关：恢复 | 解锁 + 归位 | light | restore-trigger |
| 列表 patch：行 W0 → W1 → W0 | 局部 afforded 闪，~600ms 上限 | light | mustNot reorder_selection |
| 焦点转移：旧区 → 新区 | 责任区移交（键盘 + 向导） | medium | 可中断 |

## 5. 信号 → motion trigger 词表

motion 四元组的 `trigger` 与感知 `SignalKind` **同一受控词表**；下列与 §3 默认期望对齐，schema enum 锁定：

| trigger | 典型来源 | 默认 purpose | 默认 tier |
|---------|----------|--------------|-----------|
| `pointer_hover` | 悬停 / 离开 | explain_focus | micro |
| `pointer_press` | 按下 / 抬起 | explain_focus | micro |
| `user_select` | 选中 / 取消选中 | explain_focus | micro(T0)/ light(T2 持久) |
| `user_submit` | 提交 / 确认 | explain_progress | micro |
| `overlay_open` | overlay 开 / 关 | explain_spatial_origin | light |
| `expand_panel` | 折叠 / 侧栏展开 | explain_spatial_origin | light |
| `list_update` | 列表 patch / 筛选 | explain_state | light |
| `focus_transfer` | 键盘 / 步骤推进 | explain_focus | medium |
| `system_event` | loading / 后台进度 | explain_progress | micro 起 |

规则：

1. registry 声明 `motion.trigger` 必须落在此表；禁止私造字符串。
2. 同类 trigger 默认共享 tier 与 ease（可中断）；例外写入 registry `decisions[]`。
3. `user_submit` 的 mustNot 含 `imply_success`；`list_update` 含 `steal_focus, reorder_selection`；`overlay_open` 含 `steal_focus`（背景仍可读）。

## 6. 与其它系统协作

| 系统 | 感知侧产出 | 对方消费 |
|------|------------|----------|
| 场景策略（本文件 §11） | **响应意图** | 见 §11 |
| 双通道（action/system） | [interaction-network](./interaction-network.md) | 用户明确动作 → action；系统/异步 → system |
| 容器调度 | [container-chain](./container-chain.md) | 调度优先级：焦点 > 呈现 > 样式 > 动效 > 元素 |
| 视觉权重 | [visual-language](./visual-language.md) | §4 token 为 L1 contract |
| 动效时长 / 目的 / 禁则 | [motion-system](./motion-system.md) | §5 trigger 词表 + §4.3 tier |
| 数据态（10 态） | [state-system](./state-system.md) | 数据态与焦点权重正交，互不冒充 |

正交：数据态回答「数据怎样了」，权重回答「注意力在哪」。`loading/error/empty` 不改焦点权重；错误可用 afforded 级警示，**禁止**自动夺 W2。

## 7. 降级

`prefers-reduced-motion` / `data-ui-reduced-motion` 开启时：

1. 非必要动效 tier 降为 none 或 micro（≤50ms），权重 **语义保留**——W2 选中、W4 降焦仍可辨。
2. W4 禁用 blur 依赖，仅用 opacity 等静态手段。
3. W1 闪示可缩短或取消形态动画（若 systemChannel 有文字/结构反馈则优先）。
4. 无障碍属性（aria-selected、trap、inert）**不**因降级省略。

## 8. 禁止

- 组件私有 opacity/blur 表达权重或降焦（须用 §4.2 token）
- 用脉冲动画表达持久 W2 选中（瞬时 press 除外）
- hover 直接升 W2（hover 最高 W1，除非显式选中 / 焦点转移策略）
- W4 把背景 DOM 从可访问树摘除却不做隔离（须配合 aria-hidden + inert 契约）
- T0–T3 读取或写入情绪概率字段（见 §3.4、§11.6）

## 9. 决策追溯

| 决策 | 依据 | 表现 |
|------|------|------|
| 信号分层收编 | interaction-network 感知→响应；5 类 SHOULD 可声明 | 本节 §3 + schema trigger enum |
| 概率 Tier 不进库 | 不可验证则不可契约化 | §3.4 下放 T4 + 策略映射 |
| 焦点权重 token | state-dispatch 主/次/低/降/高焦 ↔ OCP 五级；overlay 降焦统一 | §4 token + interactionStates.selected |
| trigger 受控词表 | schema 可 lint，registry 与运行时同源 | §5 + frontmatter-v2 schema enum |
| 与状态系统正交 | 10 态语义+形+位置完整，不抢权重 | §6 协作 |
| 场景策略包 | 页面深度定制、多系统协同、具名增删清空 | §11 |

## 10. 运行时契约（`@ocpui/vue/system`）

§2–§5 的运行时落点为 `system/perception/*`。识别链与控制器为现行实现；场景策略注册表（§11）为已确认契约，实现按本规格破坏性落地。

### 10.1 信号类型

```typescript
interface PerceptionSignal<P = unknown> {
  kind: SignalKind;        // §5 受控词表（9 种），策略不可改 kind
  source: 'pointer' | 'keyboard' | 'user' | 'system';
  intent: SignalIntent;    // afford | activate | commit | reveal | mutate | navigate | progress
  channel: 'action' | 'system';
  target?: SignalTarget;   // 载体（carrier / el）
  payload?: P;
  at: number;
}
```

仅确定性意图；概率标签不得进入 T0–T3（§3.4）。`commit` / `progress` 默认不产生持久权重（与数据态正交），`mutate` 不自动升 W1 为选中。

### 10.2 词法兜底与识别函数

- `KIND_PRESETS`：kind → intent/source/channel/tier 兜底；与 §3/§5 对齐；`createSignal()` 缺省字段取自此表。
- `SignalPolicy = (signal) => { recognized, intent?, channel? }`：低层识别函数，可改写 intent/channel，**不可**改 kind。
- 接入：`<UiRoot :perception-policies="policies">` 或 `controller.usePolicy(policy)`（后注册先执行；返回注销函数）。
- **开发者优先面**为 §11 场景策略；`SignalPolicy` 保留为策略 `decide` 的函数形态与兼容入口。

### 10.3 中央控制器

`createPerceptionController()` 经 `UiRoot` provide（`UI_PERCEPTION_KEY`），组件用 `usePerception()` 取得；脱离 UiRoot 时有无 inert 的兜底实例。

| API | 职责 |
|-----|------|
| `signal(input)` | 构造 → 策略/识别链 → 广播 `signal`；可派生并广播 `weight` |
| `on('signal'\|'weight'\|'overlay'\|'respond', handler)` | 订阅；视觉/动效/反馈只订阅，不直调 |
| `usePolicy(policy)` | 低层识别策略前置 |
| `strategies` | 场景策略注册表（§11.3） |
| `openOverlay(options)` | overlay 入栈，返回 `{ id, close() }` |

权重产物 `WeightTransition { from, to, weight, cause, tier }` 供视觉/动效消费。`DISPATCH_PRIORITY` 与容器链一致。

### 10.4 overlay 统一收口

组件用 `useOverlayLayer(visible, options)`，内部经控制器完成 overlay 契约：

- 打开：滚动锁 + `html[data-ui-overlay-active]` 驱动 W4 降焦 + 背景 `inert`/`aria-hidden`（§4.1 规则 3）+ 焦点 trap（`initialFocus`、Tab 循环、Esc 请求关闭）。
- 栈深 >1 时 W4 幂等，不重复 inert；Esc 按栈关闭。
- 选项：`blur`、`container`、`initialFocus`、`closeOnEscape`、`onRequestClose`、`releaseWhenHidden`（离场后再出栈）、`isolate:false`（非 Teleport 就地浮层）。
- 离场动画结束后经 `Transition` 的 `after-leave` 调 `afterLeave()` / `close()`。

### 10.5 动效解析

`useUiMotion().resolveTrigger(trigger, override?)` 解析默认 purpose/tier/ease，落实「同类 trigger 共享」（§5 规则 2）；`override` 可局部改写；尊重 registry `decisions[]`；降级时映射为 `none` / `micro`（§7）。策略 `respond.tier` 优先于纯 kind 兜底。

## 11. 场景策略包

### 11.1 定位

| 概念 | 职责 | 不负责 |
|------|------|--------|
| `KIND_PRESETS` | kind 词法兜底 | 情景叙事、多约束 match |
| `SignalPolicy` | 低层识别改写 | 具名管理、响应声明、清空 |
| **`PerceptionStrategy`** | 具名场景包：match → decide → **respond 声明** | 直接执行 motion/feedback/DOM |

策略产出**响应意图**；执行仍经控制器 `emit`，由各系统订阅方落实（禁旁路）。

### 11.2 Schema

```typescript
type MotionTier = 'micro' | 'light' | 'medium' | 'heavy' | 'scene' | 'none';
type MustNotFlag =
  | 'steal_focus'
  | 'reorder_selection'
  | 'imply_success'
  | 'elevate_to_primary'   // 禁止升 W2
  | 'use_blur_deemph'      // 禁止依赖 blur 表达 W4
  | 'nested_inert_duplicate';

interface StrategyContext {
  overlayDepth: number;
  reducedMotion: boolean;
  /** 同 target 上可观测计数（驻留 ms、窗内 commit 次数、hover 抖动次数等）；由运行时维护，非情绪字段 */
  proxies?: Record<string, number>;
  scopeId?: string;
}

interface PerceptionRespond {
  /** 目标权重；`null` = 明确不改权重 */
  weight?: FocusWeight | null;
  tier?: MotionTier;
  channel?: FeedbackChannel;
  intent?: SignalIntent;
  mustNot?: MustNotFlag[];
  /** 反馈落点提示，供 feedback 订阅方；非强制 UI 形态 */
  feedbackHint?: 'inline' | 'region' | 'overlay' | 'notify' | 'none';
  /** 弱化 afforded 强度等（0–1），默认 1；dwell-soften / read-region-quiet 用 */
  affordStrength?: number;
}

interface PerceptionStrategy {
  id: string;
  /** 数值越大越优先；同 priority 时后 add 覆盖同 id，不同 id 按注册序（后注册先匹配） */
  priority?: number;
  /** 工作流叙事（内置包 MUST；自定义 SHOULD）——设计说明，不参与运行时匹配 */
  narrative: string;
  match: (signal: PerceptionSignal, ctx: StrategyContext) => boolean;
  decide?: (signal: PerceptionSignal, ctx: StrategyContext) => {
    recognized: boolean;
    intent?: SignalIntent;
    channel?: FeedbackChannel;
  };
  respond?: PerceptionRespond | ((signal: PerceptionSignal, ctx: StrategyContext) => PerceptionRespond);
}
```

合并规则：

1. 对每个信号，收集所有 `match === true` 的策略；处理序为 **priority 升序**（高 priority 靠后）、同级 **注册序升序**（后 add 靠后），使「后者覆盖前者」时高 priority / 后注册胜出。
2. `decide`：按处理序依次叠改 intent/channel；`recognized: false` 跳过该策略的 respond。
3. `respond`：字段级合并（后者覆盖前者）；`mustNot` **并集**；`affordStrength` 取 **min**；`tier` 在 `reducedMotion` 或 `builtin:reduced-motion` 命中时按 §7 再降级。
4. 合并结果形成 `ResponseIntent`，经 `emit('respond')`（及既有 `signal` / `weight`）广播；`matchedIds` 按 priority 降序列出。

### 11.3 生命周期 API

```typescript
interface StrategyRegistry {
  add(strategy: PerceptionStrategy): void;           // 同 id 替换
  remove(id: string): boolean;
  clear(): void;                                     // 清空当前作用域全部（含已挂载的 builtin）
  get(id: string): PerceptionStrategy | undefined;
  list(): readonly PerceptionStrategy[];
}

/** DX 糖 */
declare function defineStrategy(s: PerceptionStrategy): PerceptionStrategy;
declare function when(kind: SignalKind): StrategyBuilder;
declare function createStrategySet(options: {
  include?: string[];   // 缺省 = 全部 builtin
  exclude?: string[];
  extras?: PerceptionStrategy[];
}): PerceptionStrategy[];
```

作用域：

| 作用域 | 挂载 | 合并 |
|--------|------|------|
| UiRoot | `perceptionStrategies` / `createStrategySet` | 应用默认集 |
| 区域 Scope | `providePerceptionScope({ strategies \| set })` | 子树内：Scope 覆盖同 id；`clear` 只清本 Scope |

控制器暴露 `controller.strategies` 指向**当前解析作用域**注册表；组件通过 `usePerception().strategies` 访问。

### 11.4 第一版内置包（15）

每条须满足：工作流叙事 + 多维协同（W / motion / channel / mustNot）。id 前缀 `builtin:`。

| id | 叙事 | respond 概要 |
|----|------|----------------|
| `builtin:hover-afford` | 表单/工具条上指针扫过可点控件，须立刻表明可点且不抢当前选中行 | weight W1；tier micro；channel action；mustNot: elevate_to_primary, steal_focus |
| `builtin:select-primary` | 工作列表点选一行进入主从编辑；选中为页内唯一主焦点 | weight W2；原 W2→W0；tier light；action；须 aria-selected |
| `builtin:submit-guard` | 用户点保存后网络未回；防连点且不假装成功 | weight null；tier micro；action；feedbackHint inline；mustNot: imply_success, steal_focus |
| `builtin:overlay-elevate` | 危险操作弹出确认；主内容退让，对话框接管 | 背景 W4；overlay W3；tier light；trap；action；可选 blur |
| `builtin:overlay-restore` | 关闭确认后回到触发控件继续编辑 | 解除 W4；restore-trigger；tier light；action；mustNot: steal_focus |
| `builtin:list-mutate-quiet` | 他人认领/后台同步改当前列表行；阅读不被打断 | weight null；tier light；system；mustNot: steal_focus, reorder_selection |
| `builtin:panel-expand` | 详情抽屉/折叠区展开看字段，列表选中仍保留 | 局部 reveal；不夺全局 W2；tier light；action |
| `builtin:focus-transfer` | 键盘或向导「下一步」把主焦点移到下一责任区 | 旧 W2→W0，新→W2；tier medium；action；aria-current |
| `builtin:system-progress` | 区域 loading / 任务进度；说明「在取得」而非换主焦点 | weight null；tier micro；system；mustNot: 整页 W4 语义（禁 elevate 背景） |
| `builtin:notify-no-steal` | 通知中心推送新消息；用户仍在编辑 | 通知区 afforded；Body 不改 W2；tier micro；system；mustNot: steal_focus |
| `builtin:stack-conflict` | 已有 Drawer 又开 Modal；叠层清晰、背景只降一次、Esc 按栈 | 栈深驱动；W4 幂等；mustNot: nested_inert_duplicate |
| `builtin:reduced-motion` | 系统或站点开启减动效；语义权重仍在 | W 语义保留；tier→none/micro；mustNot: use_blur_deemph；与其它包合并时**降级优先** |
| `builtin:dwell-soften` | 同 target 长驻留/反复进出 hover（可观测代理） | affordStrength 低于 1；press tier 降 micro；禁强脉冲升主焦点；**API 禁情绪词** |
| `builtin:rapid-commit-throttle` | 短窗多次 submit/click（可观测代理） | 强化 submit-guard；抑制多余 W 闪；action |
| `builtin:read-region-quiet` | content-host 内长静止后的首次 pointer_hover（可观测代理） | 弱 afford 或 skip respond；离开阅读区恢复 |

开发者可 `remove('builtin:…')` / `clear()` 后自建；可用 `createStrategySet({ exclude, extras })` 组装页面集。

### 11.5 定制范式

1. **替换默认**：`strategies.remove('builtin:select-primary'); strategies.add(defineStrategy({ ... }))`
2. **页面集**：`createStrategySet({ exclude: ['builtin:notify-no-steal'], extras: [myBatchSelect] })` 挂到区域 Scope
3. **链式糖**：`when('user_select').where((s, ctx) => …).respond({ weight: 'primary', tier: 'light' }).id('app:row-select').build()`
4. **订阅执行**：视觉读 `respond.weight` / `WeightTransition`；动效读 `respond.tier` + kind；反馈读 `channel` + `feedbackHint`；均不得在策略函数内直调

### 11.6 情绪边界（E1+E2）

| 层 | 规则 |
|----|------|
| **E1（库内）** | 仅匹配可观测代理（驻留时长、窗内 commit 次数、阅读区静止后首次 hover 等）；id / schema **禁止**犹豫、急切、阅读模式等情绪词 |
| **E2（T4）** | 概率情绪模型只在应用层；结果**映射到策略 id**（`add` / 启用同 id），库**不读**情绪字段、不扩 kind/intent 词表 |
| 叙事 | `narrative` 可写体验动机；不进入 match 条件与序列化契约 |

### 11.7 实现状态

| 项 | 状态 |
|----|------|
| §1–§10 信号 / 权重 / 控制器 / overlay | 已落地（S8/S9） |
| §11 StrategyRegistry / 15 builtin / Scope / respond 广播 | **已落地**（`system/perception/strategy-*` + controller `runWithRegistry`） |
| `SignalPolicy` | 保留为 decide 函数形态；新代码优先 `PerceptionStrategy` |
| DX | `defineStrategy` / `when` / `createStrategySet` / `providePerceptionScope` / UiRoot `perceptionStrategies` |
