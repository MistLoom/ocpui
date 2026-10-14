---

type: Component

id: C:SEGMENTED-CONTROL

name: SegmentedControl

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: [list]

scenes: 
  - "workbench"
  - "settings"

requires: [UiRoot]

composes: []

antiPatterns:[RadioGroup 冒充页内 Tab]

localeKeys: [dataEntry.segmentedControl.*]
since: "0.1.0"

---
# SegmentedControl

源码：`src/components/data-entry/SegmentedControl.vue`

## 选用

- **Tier**：T0
- **Surface**：list
- **Scene**：workbench、settings

## 反模式

- RadioGroup 冒充页内 Tab

## i18n

- `dataEntry.segmentedControl.*`

## 安装

```bash
ocp add SegmentedControl
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
