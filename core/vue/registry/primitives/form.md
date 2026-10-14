---

type: Component

id: C:FORM

name: Form

tier: T1

package: "@ocpui/vue"

status: stable

surfaces: [form]

scenes: 
  - "editor"
  - "settings"

requires: [UiRoot]

composes: [FormItem]

slots: [default]
antiPatterns:[页内自建校验展示逻辑]

localeKeys: [dataEntry.form.*]
since: "0.1.0"

---
# Form

源码：`src/components/data-entry/Form.vue`

## 选用

- **Tier**：T1
- **Surface**：form
- **Scene**：editor、settings

## 组合

- FormItem

## 插槽

- `#default`

## 反模式

- 页内自建校验展示逻辑

## i18n

- `dataEntry.form.*`

## 安装

```bash
ocp add Form
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
