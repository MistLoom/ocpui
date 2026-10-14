---

type: Component

id: C:DRAWER

name: Drawer

tier: T1

package: "@ocpui/vue"

status: stable

surfaces: [overlay]

scenes: 
  - "editor"
  - "workbench"

requires: [UiRoot]

composes: []

slots: 
  - "default"
  - "header"
  - "footer"
antiPatterns:[Modal+Drawer 双壳并行]

localeKeys: [feedback.drawer.*]
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
# Drawer

源码：`src/components/feedback/Drawer.vue`

## 选用

- **Tier**：T1
- **Surface**：overlay
- **Scene**：editor、workbench

## 插槽

- `#default`
- `#header`
- `#footer`

## 反模式

- Modal+Drawer 双壳并行

## i18n

- `feedback.drawer.*`

## 安装

```bash
ocp add Drawer
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
