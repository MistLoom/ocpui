---
id: F:LAYER-STACK
doc_type: foundation
parent: O:ROOT
related:
  - F:VISUAL-LANG
  - F:CONTAINER-CHAIN
  - C:TOOLTIP
  - C:FLOATING-HINT
design_intent: "浮层层级与 overflow 裁切约束"
scope: "z-index scale、Teleport 浮层、图表 crosshair 提示"
status: stable
---

# 浮层层级

## 问题

容器上的 `overflow: hidden/auto` 会裁切子元素的 `position: absolute` 浮层。折线图、MetricCard 内嵌图表等场景下，悬停数值提示常被 Card、列表行、Shell body 遮挡。

**根因**：浮层与锚点同属一个 DOM  subtree，却未脱离裁切上下文。

## 层级 scale

定义于 `packages/ocpui/core/vue/src/themes/layer-tokens.css`：

| Token | 值 | 用途 |
|-------|-----|------|
| `--z-base` | 1 | 组件内叠层（sticky 表头） |
| `--z-sticky` | 100 | 吸顶栏 |
| `--z-dropdown` | 1000 | 下拉面板 |
| `--z-tooltip` | 1100 | Tooltip、图表 hover 提示 |
| `--z-popover` | 1200 | Popover、Popselect |
| `--z-overlay` | 1300 | 遮罩 |
| `--z-modal` | 1400 | Modal、Drawer |
| `--z-toast` | 1500 | 全局 Toast/Notify |
| `--z-max` | 9999 | 主题过渡等特例 |

禁止在组件内硬编码 `z-index: 100` / `9999`；必须引用 token。

## 浮层挂载规则

| 类型 | 实现 | 示例 |
|------|------|------|
| 锚定 DOM 元素 | `Tooltip` / `Popover` + `Teleport to="body"` + `useFloatingPosition` | 按钮提示 |
| 虚拟锚点（图表 crosshair） | `FloatingHint` + `useFloatingPosition`（虚拟锚点）+ `Teleport` | MiniLineChart、TrendChart |
| 已有正确范例 | `HeatmapChart` Teleport + `position: fixed` | 热力图 cell |

### MUST

1. **悬停/弹出层不得**在带 `overflow: hidden` 的容器内使用 `position: absolute` 作为最终呈现方式
2. 图表类 hover 提示 **必须** `Teleport` 至 `body`（或通过 `FloatingHint`）
3. 定位策略 **`position: fixed`** + 视口坐标（clientX/clientY 或 virtual anchor）
4. `z-index` 使用 `--z-tooltip` 及以上 token

### MUST NOT

- 仅靠提高 `z-index` 解决裁切（overflow 裁切与 z-index 无关）
- 在 Card / AdminWorkList row 内 absolute 定位 tooltip

## 组件分工

| 组件 | 职责 |
|------|------|
| `Tooltip` | 有 DOM trigger 的通用提示 |
| `FloatingHint` | 无 DOM trigger、虚拟锚点的提示（图表、gauge） |
| `useFloatingPosition`（虚拟锚点形态） | 虚拟锚点 + floating-ui 定位 |

## 容器侧约束

Shell / Card 等容器：

- **可以**对图表绘制区使用 `overflow: hidden`（裁剪 SVG 溢出）
- **不得**假设子组件 absolute 浮层可见
- overlay 类容器使用 `dispatchRole: overlay-host`，层级 `--z-modal`

## 新增组件检查

编写含 hover 提示的组件时：

1. 是否 Teleport？
2. 是否 fixed + token z-index？
3. 若嵌入 MetricCard / 列表，是否在 playground 中验证悬停不被裁切？

CI：`pnpm check:floating-layer`（`scripts/check-floating-layer.mjs`）
