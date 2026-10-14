---

type: Component

id: C:NUMBER-ANIMATION

name: NumberAnimation

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
  trigger: system_event
  purpose: explain_progress
  tier: micro
  interruptible: true
  stopWhen: result_readable
  mustNot: [imply_success]
since: "0.1.0"

---
# NumberAnimation

源码：`src/components/animation/NumberAnimation.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form、overlay、detail、chart
- **Scene**：workbench、settings、editor、audit

## 安装

```bash
ocp add NumberAnimation
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 NumberAnimation 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
