---

type: Component

id: C:GLOBAL-STYLE

name: GlobalStyle

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
# GlobalStyle

源码：`src/components/utility/GlobalStyle.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form、overlay
- **Scene**：workbench、settings、editor、audit

## 安装

```bash
ocp add GlobalStyle
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 GlobalStyle 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
