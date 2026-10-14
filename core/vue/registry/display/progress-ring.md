---

type: Component

id: C:PROGRESS-RING

name: ProgressRing

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: 
  - "list"
  - "detail"
  - "chart"

scenes: 
  - "workbench"
  - "audit"
  - "settings"

requires: [UiRoot]

composes: []

antiPatterns:
  - "Card 包裹 DataTable"
  - "装饰性外层 Card 套图表"

since: "0.1.0"

---
# ProgressRing

源码：`src/components/data-display/ProgressRing.vue`

## 选用

- **Tier**：T0
- **Surface**：list、detail、chart
- **Scene**：workbench、audit、settings

## 反模式

- Card 包裹 DataTable
- 装饰性外层 Card 套图表

## 安装

```bash
ocp add ProgressRing
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
