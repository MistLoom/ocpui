---

type: Component

id: C:POPCONFIRM

name: Popconfirm

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
  stopWhen: user_acknowledged
  mustNot: [steal_focus, imply_success]
since: "0.1.0"

---
# Popconfirm

源码：`src/components/feedback/Popconfirm.vue`

## 选用

- **Tier**：T0
- **Surface**：overlay
- **Scene**：workbench、editor、settings

## 反模式

- createApp 挂 Message
- messageService 旁路

## 安装

```bash
ocp add Popconfirm
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
