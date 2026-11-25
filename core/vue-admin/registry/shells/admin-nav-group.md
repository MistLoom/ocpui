---

type: Component

id: C:ADMIN-NAV-GROUP

name: AdminNavGroup

tier: T0

package: "@ocpui/vue-admin"

status: stable

surfaces: [list]

scenes: [workbench]

requires: [UiRoot]

composes: []

antiPatterns:
  - "页根 padding"
  - "Card 包 DataTable"

since: "0.1.0"

---
# AdminNavGroup

源码：`src/components/shell/AdminNavGroup.vue`

## 选用

- **Tier**：T0
- **Surface**：list
- **Scene**：workbench

## 反模式

- 页根 padding
- Card 包 DataTable

## 安装

```bash
ocp add AdminNavGroup
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
