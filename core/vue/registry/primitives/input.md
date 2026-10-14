---

type: Component

id: C:INPUT

name: Input

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: 
  - "list"
  - "form"
  - "overlay"

scenes: 
  - "workbench"
  - "settings"
  - "editor"

requires: [UiRoot]

composes: []

antiPatterns:[未走 FormItem 的表单校验]

localeKeys: [dataEntry.input.*]
since: "0.1.0"

---
# Input

源码：`src/components/data-entry/Input.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form、overlay
- **Scene**：workbench、settings、editor

## 反模式

- 未走 FormItem 的表单校验

## i18n

- `dataEntry.input.*`

## 安装

```bash
ocp add Input
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
