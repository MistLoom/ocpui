---

type: Component

id: C:SEARCH-HISTORY

name: SearchHistory

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: 
  - "list"
  - "form"

scenes: 
  - "workbench"
  - "editor"

requires: [UiRoot]

composes: []

antiPatterns:[]

since: "0.1.0"

---
# SearchHistory

源码：`src/components/interaction/SearchHistory.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form
- **Scene**：workbench、editor

## 安装

```bash
ocp add SearchHistory
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 SearchHistory 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
