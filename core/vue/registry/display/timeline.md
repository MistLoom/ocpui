---

type: Component

id: C:TIMELINE

name: Timeline

tier: T0

package: "@ocpui/vue"

status: stable

surfaces: [detail]

scenes: [audit]

requires: [UiRoot]

composes: [TimelineItem]

antiPatterns:[审计页高饱和装饰 token]

localeKeys: [dataDisplay.timeline.*]
since: "0.1.0"

---
# Timeline

源码：`src/components/data-display/Timeline.vue`

## 选用

- **Tier**：T0
- **Surface**：detail
- **Scene**：audit

## 组合

- TimelineItem

## 反模式

- 审计页高饱和装饰 token

## i18n

- `dataDisplay.timeline.*`

## 安装

```bash
ocp add Timeline
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
