---

type: Component

id: C:TABLE

name: Table

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: [list]

scenes: 
  - "workbench"
  - "audit"

requires: [UiRoot]

composes: []

antiPatterns:[列表页直接用 Table 而非 DataTable/AdminWorkList]

localeKeys: [dataDisplay.table.*]
since: "0.1.0"

---
# Table

源码：`src/components/data-display/Table.vue`

## 选用

- **Tier**：T0
- **Surface**：list
- **Scene**：workbench、audit

## 反模式

- 列表页直接用 Table 而非 DataTable/AdminWorkList

## i18n

- `dataDisplay.table.*`

## 安装

```bash
ocp add Table
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
