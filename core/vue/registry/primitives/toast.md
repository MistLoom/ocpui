---

type: Component

id: C:TOAST

name: Toast

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
# Toast

源码：`src/components/utility/Toast.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form、overlay
- **Scene**：workbench、settings、editor、audit

## 安装

```bash
ocp add Toast
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 Toast 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
