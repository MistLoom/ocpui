---

type: Component

id: C:DROPDOWN

name: Dropdown

tier: T1

package: "@ocpui/vue"

status: stable

surfaces: 
  - "list"
  - "overlay"

scenes: 
  - "workbench"
  - "settings"

requires: [UiRoot]

composes: []

antiPatterns:[绕开 PageHeader/Menu/Breadcrumb/Pagination 手写等价导航结构]

since: "0.1.0"

---
# Dropdown

源码：`src/components/navigation/Dropdown.vue`

## 选用

- **Tier**：T1
- **Surface**：list、overlay
- **Scene**：workbench、settings

## 反模式

- 绕开 PageHeader/Menu/Breadcrumb/Pagination 手写等价导航结构

## 安装

```bash
ocp add Dropdown
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
