---

type: Component

id: C:DATA-TABLE

name: DataTable

tier: T3

package: "@ocpui/vue-admin"

status: stable

surfaces: [list]

scenes: 
  - "workbench"
  - "audit"

requires: [UiRoot]

composes: 
  - "Table"
  - "Pagination"
  - "Empty"
  - "Loading"
  - "Search"

slots: 
  - "toolbar"
  - "footer"
antiPatterns:
  - "Card wrapping DataTable"
  - "padding on page root"
  - "页内重复筛选条"

replaces: [Table]
localeKeys: 
  - "dataDisplay.dataTable.*"
  - "dataDisplay.table.*"
duty: "编排表格行展示、选择与批量操作区域"
dispatchRole: content-host
decisions:
  - intent: "让列表页不裸用 Table"
    sceneRef: "标准 CRUD 列表"
    manifestation: "registry 替代 Table；antiPattern Card 包裹"
  - intent: "让批量选择与行操作同区可辨"
    sceneRef: "工作台任务队列"
    manifestation: "toolbar/footer slot + BatchSelector 组合"
  - intent: "让状态分支委托 Shell 而非表格内部"
    sceneRef: "加载/空/错"
    manifestation: "delegatesStatesTo AdminWorkList 或外层 Shell"
since: "0.1.0"

---
# DataTable

源码：`src/components/data-display/DataTable.vue`

## 选用

- **Tier**：T3
- **Surface**：list
- **Scene**：workbench、audit

## 组合

- Table
- Pagination
- Empty
- Loading
- Search

## 插槽

- `#toolbar`
- `#footer`

## 反模式

- Card wrapping DataTable
- padding on page root
- 页内重复筛选条

## 替代

- Table

## i18n

- `dataDisplay.dataTable.*`
- `dataDisplay.table.*`

## 安装

```bash
ocp add DataTable
```

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
