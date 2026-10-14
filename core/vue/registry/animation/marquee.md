---

type: Component

id: C:MARQUEE

name: Marquee

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
  tier: scene
  interruptible: true
  stopWhen: user_acknowledged
  mustNot: [steal_focus, reorder_selection]
since: "0.1.0"

---
# Marquee

源码：`src/components/animation/Marquee.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form、overlay、detail、chart
- **Scene**：workbench、settings、editor、audit

## 安装

```bash
ocp add Marquee
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 Marquee 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
