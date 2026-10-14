---

type: Component
id: C:DIALOG

name: Dialog

tier: T1

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

dispatchRole: overlay-host
focusPolicy: restore-trigger
motion:
  trigger: overlay_open
  purpose: explain_spatial_origin
  tier: light
  interruptible: true
  stopWhen: focus_stable
  mustNot: [steal_focus]
since: "0.1.0"

---
# Dialog

源码：`src/components/feedback/Dialog.vue`

## 选用

- **Tier**：T1
- **Surface**：overlay
- **Scene**：workbench、editor、settings

## 反模式

- createApp 挂 Message
- messageService 旁路

## 安装

```bash
ocp add Dialog
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
