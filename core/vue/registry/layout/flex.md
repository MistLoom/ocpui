---

type: Component

id: C:FLEX

name: Flex

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: 
  - "list"
  - "detail"
  - "form"

scenes: 
  - "workbench"
  - "settings"
  - "editor"

requires: [UiRoot]

composes: []

antiPatterns:[页根 padding 与 AppShell 重复]

since: "0.1.0"

---
# Flex

源码：`src/components/layout/Flex.vue`

## 选用

- **Tier**：T0
- **Surface**：list、detail、form
- **Scene**：workbench、settings、editor

## 反模式

- 页根 padding 与 AppShell 重复

## 安装

```bash
ocp add Flex
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
