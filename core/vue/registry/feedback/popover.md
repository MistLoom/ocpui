---

type: Component

id: C:POPOVER

name: Popover

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: [overlay]

scenes: 
  - "workbench"
  - "editor"
  - "settings"

requires: [UiRoot]

composes: []

antiPatterns:
  - "createApp 挂 Message"
  - "messageService 旁路"

motion:
  trigger: overlay_open
  purpose: explain_spatial_origin
  tier: micro
  interruptible: true
  stopWhen: focus_stable
  mustNot: [steal_focus]
since: "0.1.0"

---
# Popover

源码：`src/components/feedback/Popover.vue`

## 选用

- **Tier**：T0
- **Surface**：overlay
- **Scene**：workbench、editor、settings

## 反模式

- createApp 挂 Message
- messageService 旁路

## 安装

```bash
ocp add Popover
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
