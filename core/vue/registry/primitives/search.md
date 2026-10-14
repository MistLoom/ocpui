---

type: Component

id: C:SEARCH

name: Search

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: [list]

scenes: 
  - "workbench"
  - "audit"

requires: [UiRoot]

composes: 
  - "Input"
  - "PopupPanel"

antiPatterns:[普通 Input 冒充搜索框]

localeKeys: [dataEntry.search.*]
since: "0.1.0"

---
# Search

源码：`src/components/data-entry/Search.vue`

## 选用

- **Tier**：T0
- **Surface**：list
- **Scene**：workbench、audit

## 组合

- Input
- PopupPanel

## 反模式

- 普通 Input 冒充搜索框

## i18n

- `dataEntry.search.*`

## 安装

```bash
ocp add Search
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
