---

type: Component

id: C:MODAL

name: Modal

tier: T1

package: "@ocpui/vue"

status: stable

surfaces: [overlay]

scenes: 
  - "workbench"
  - "editor"
  - "settings"

requires: [UiRoot]

composes: [PopupPanel]

slots: 
  - "default"
  - "header"
  - "footer"
antiPatterns:[createApp 挂弹层]

localeKeys: [feedback.modal.*]
duty: "承载阻断性浮层内容与焦点锁定"
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
# Modal

源码：`src/components/feedback/Modal.vue`

## 选用

- **Tier**：T1
- **Surface**：overlay
- **Scene**：workbench、editor、settings

## 组合

- PopupPanel

## 插槽

- `#default`
- `#header`
- `#footer`

## 反模式

- createApp 挂弹层

## i18n

- `feedback.modal.*`

## 安装

```bash
ocp add Modal
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
