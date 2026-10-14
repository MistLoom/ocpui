---

type: Component

id: C:PAGINATION

name: Pagination

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: [list]

scenes: 
  - "workbench"
  - "audit"

requires: [UiRoot]

composes: []

antiPatterns:[手写分页按钮]

localeKeys: [navigation.pagination.*]
since: "0.1.0"

---
# Pagination

源码：`src/components/navigation/Pagination.vue`

## 选用

- **Tier**：T0
- **Surface**：list
- **Scene**：workbench、audit

## 反模式

- 手写分页按钮

## i18n

- `navigation.pagination.*`

## 安装

```bash
ocp add Pagination
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
