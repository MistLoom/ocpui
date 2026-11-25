---

type: Component

id: C:ADMIN-NOTIFICATION-ITEM

name: AdminNotificationItem

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
# AdminNotificationItem

源码：`src/components/shell/AdminNotificationItem.vue`

## 选用

- **Tier**：T0
- **Surface**：list
- **Scene**：workbench

## 反模式

- 页根 padding
- Card 包 DataTable

## 安装

```bash
ocp add AdminNotificationItem
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
