---

type: Component

id: C:CONFIRM-DIALOG

name: ConfirmDialog

tier: T2

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

duty: "承载用户确认动作、影响说明与提交反馈"
dispatchRole: overlay-host
focusPolicy: restore-trigger
motion:
  trigger: overlay_open
  purpose: explain_state
  tier: medium
  interruptible: false
  stopWhen: user_acknowledged
  mustNot: [imply_success]
since: "0.1.0"

---
# ConfirmDialog

源码：`src/components/feedback/ConfirmDialog.vue`

## 选用

- **Tier**：T2
- **Surface**：overlay
- **Scene**：workbench、editor、settings

## 反模式

- createApp 挂 Message
- messageService 旁路

## 安装

```bash
ocp add ConfirmDialog
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
