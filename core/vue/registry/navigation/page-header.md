---

type: Component

id: C:PAGE-HEADER

name: PageHeader

tier: T2

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

duty: "承载页面标题、面包屑与头部操作区"
since: "0.1.0"

---
# PageHeader

源码：`src/components/navigation/PageHeader.vue`

## 选用

- **Tier**：T2
- **Surface**：list、overlay
- **Scene**：workbench、settings

## 反模式

- 绕开 PageHeader/Menu/Breadcrumb/Pagination 手写等价导航结构

## 安装

```bash
ocp add PageHeader
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
