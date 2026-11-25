---

type: Component

id: C:ADMIN-COMPACT-ITEM

name: AdminCompactItem

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
# AdminCompactItem

源码：`src/components/data-display/AdminCompactItem.vue`

## 选用

- **Tier**：T0
- **Surface**：list
- **Scene**：workbench

## 反模式

- 页根 padding
- Card 包 DataTable

## 安装

```bash
ocp add AdminCompactItem
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
