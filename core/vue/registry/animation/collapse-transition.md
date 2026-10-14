---

type: Component

id: C:COLLAPSE-TRANSITION

name: CollapseTransition

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: 
  - "list"
  - "form"
  - "overlay"
  - "detail"
  - "chart"

scenes: 
  - "workbench"
  - "settings"
  - "editor"
  - "audit"

requires: [UiRoot]

composes: []

antiPatterns:[]

motion:
  trigger: expand_panel
  purpose: explain_spatial_origin
  tier: light
  interruptible: true
  stopWhen: result_readable
  mustNot: [reorder_selection]
since: "0.1.0"

---
# CollapseTransition

源码：`src/components/animation/CollapseTransition.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form、overlay、detail、chart
- **Scene**：workbench、settings、editor、audit

## 安装

```bash
ocp add CollapseTransition
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 CollapseTransition 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
