---

type: Component

id: C:NOTIFICATION

name: Notification

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
  trigger: system_event
  purpose: explain_state
  tier: light
  interruptible: true
  stopWhen: result_readable
  mustNot: [steal_focus]
since: "0.1.0"

---
# Notification

源码：`src/components/feedback/Notification.vue`

## 选用

- **Tier**：T0
- **Surface**：overlay
- **Scene**：workbench、editor、settings

## 反模式

- createApp 挂 Message
- messageService 旁路

## 安装

```bash
ocp add Notification
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
