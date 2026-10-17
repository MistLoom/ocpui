---

type: Component

id: C:LOADING-OVERLAY

name: LoadingOverlay

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
  purpose: explain_progress
  tier: micro
  interruptible: true
  stopWhen: result_readable
  mustNot: [imply_success]
since: "0.1.0"

---
# LoadingOverlay

源码：`src/components/feedback/LoadingOverlay.vue`

## 选用

- **Tier**：T0
- **Surface**：overlay
- **Scene**：workbench、editor、settings

## 反模式

- createApp 挂 Message
- messageService 旁路

## 安装

```bash
ocp add LoadingOverlay
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
