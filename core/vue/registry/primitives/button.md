---

type: Component

id: C:BUTTON

name: Button

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: 
  - "list"
  - "form"
  - "overlay"

scenes: 
  - "workbench"
  - "settings"
  - "editor"
  - "audit"

requires: [UiRoot]

composes: []

antiPatterns:[原生 button 替代 T0 Button]

localeKeys: [utility.button.*]
duty: "承载单一可点击确认或导航动作"
since: "0.1.0"

---
# Button

源码：`src/components/utility/Button.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form、overlay
- **Scene**：workbench、settings、editor、audit

## 反模式

- 原生 button 替代 T0 Button

## i18n

- `utility.button.*`

## 安装

```bash
ocp add Button
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
