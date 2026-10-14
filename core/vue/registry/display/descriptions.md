---

type: Component

id: C:DESCRIPTIONS

name: Descriptions

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: [detail]

scenes: 
  - "workbench"
  - "settings"
  - "audit"

requires: [UiRoot]

composes: [DescriptionsItem]

antiPatterns:[自建详情字段栅格]

localeKeys: [dataDisplay.descriptions.*]
since: "0.1.0"

---
# Descriptions

源码：`src/components/data-display/Descriptions.vue`

## 选用

- **Tier**：T0
- **Surface**：detail
- **Scene**：workbench、settings、audit

## 组合

- DescriptionsItem

## 反模式

- 自建详情字段栅格

## i18n

- `dataDisplay.descriptions.*`

## 安装

```bash
ocp add Descriptions
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
