---

type: Component

id: C:EMPTY

name: Empty

tier: T2

package: "@ocpui/vue"

status: stable

surfaces: 
  - "list"
  - "detail"

scenes: 
  - "workbench"
  - "audit"

requires: [UiRoot]

composes: []

antiPatterns:[列表空态自建 div]

localeKeys: [feedback.empty.*]
duty: "说明空数据原因并引导调整或创建"
since: "0.1.0"

---
# Empty

源码：`src/components/utility/Empty.vue`

## 选用

- **Tier**：T2
- **Surface**：list、detail
- **Scene**：workbench、audit

## 反模式

- 列表空态自建 div

## i18n

- `feedback.empty.*`

## 安装

```bash
ocp add Empty
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
