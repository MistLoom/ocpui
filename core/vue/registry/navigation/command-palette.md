---

type: Component

id: C:COMMAND-PALETTE

name: CommandPalette

tier: T0

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
# CommandPalette

源码：`src/components/navigation/CommandPalette.vue`

## 选用

- **Tier**：T0
- **Surface**：list、overlay
- **Scene**：workbench、settings

## 反模式

- 绕开 PageHeader/Menu/Breadcrumb/Pagination 手写等价导航结构

## 安装

```bash
ocp add CommandPalette
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
