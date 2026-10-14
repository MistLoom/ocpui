---

type: Component

id: C:THEME-SELECTOR

name: ThemeSelector

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

antiPatterns:[]

since: "0.1.0"

---
# ThemeSelector

源码：`src/components/utility/ThemeSelector.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form、overlay
- **Scene**：workbench、settings、editor、audit

## 安装

```bash
ocp add ThemeSelector
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 ThemeSelector 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
