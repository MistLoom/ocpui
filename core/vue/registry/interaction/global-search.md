---

type: Component

id: C:GLOBAL-SEARCH

name: GlobalSearch

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
# GlobalSearch

源码：`src/components/interaction/GlobalSearch.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form
- **Scene**：workbench、editor

## 安装

```bash
ocp add GlobalSearch
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 GlobalSearch 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
