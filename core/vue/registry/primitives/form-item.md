---

type: Component

id: C:FORM-ITEM

name: FormItem

tier: T1

package: "@ocpui/vue"

status: stable

surfaces: [form]

scenes: 
  - "editor"
  - "settings"

requires: [UiRoot]

composes: []

slots: 
  - "default"
  - "label"
  - "extra"
antiPatterns:[控件未包在 FormItem 内]

localeKeys: [dataEntry.formItem.*]
since: "0.1.0"

---
# FormItem

源码：`src/components/data-entry/FormItem.vue`

## 选用

- **Tier**：T1
- **Surface**：form
- **Scene**：editor、settings

## 插槽

- `#default`
- `#label`
- `#extra`

## 反模式

- 控件未包在 FormItem 内

## i18n

- `dataEntry.formItem.*`

## 安装

```bash
ocp add FormItem
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
