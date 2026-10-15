---

type: Component

id: C:LIST-TRANSITION

name: ListTransition

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: 
  - "list"
  - "form"
  - "overlay"

scenes: 
  - "workbench"
  - "settings"
  - "editor"
  - "audit"

requires: [UiRoot]

composes: []

antiPatterns:[]

motion:
  trigger: list_update
  purpose: explain_state
  tier: light
  interruptible: true
  stopWhen: result_readable
  mustNot: [steal_focus, reorder_selection]
since: "0.1.0"

---
# ListTransition

源码：`src/components/utility/ListTransition.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form、overlay
- **Scene**：workbench、settings、editor、audit

## 安装

```bash
ocp add ListTransition
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 ListTransition 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
