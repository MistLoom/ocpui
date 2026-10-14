---

type: Component

id: C:SELECT

name: Select

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: 
  - "list"
  - "form"

scenes: 
  - "workbench"
  - "settings"

requires: [UiRoot]

composes: [PopupPanel]

antiPatterns:[无界选项用手写 dropdown]

localeKeys: [dataEntry.select.*]
since: "0.1.0"

---
# Select

源码：`src/components/data-entry/Select.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form
- **Scene**：workbench、settings

## 组合

- PopupPanel

## 反模式

- 无界选项用手写 dropdown

## i18n

- `dataEntry.select.*`

## 安装

```bash
ocp add Select
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
