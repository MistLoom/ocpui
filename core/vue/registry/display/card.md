---

type: Component

id: C:CARD

name: Card

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: 
  - "detail"
  - "form"
  - "chart"

scenes: 
  - "workbench"
  - "settings"

requires: [UiRoot]

composes: []

slots: 
  - "default"
  - "header"
  - "footer"
antiPatterns:
  - "Card 包 DataTable"
  - "图表外层装饰 Card"

localeKeys: [dataDisplay.card.*]
since: "0.1.0"

---
# Card

源码：`src/components/data-display/Card.vue`

## 选用

- **Tier**：T0
- **Surface**：detail、form、chart
- **Scene**：workbench、settings

## 插槽

- `#default`
- `#header`
- `#footer`

## 反模式

- Card 包 DataTable
- 图表外层装饰 Card

## i18n

- `dataDisplay.card.*`

## 安装

```bash
ocp add Card
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
