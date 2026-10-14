---

type: Component

id: C:RATE

name: Rate

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

antiPatterns:[页内自建校验展示绕开 FormItem]

since: "0.1.0"

---
# Rate

源码：`src/components/data-entry/Rate.vue`

## 选用

- **Tier**：T0
- **Surface**：list、form、overlay
- **Scene**：workbench、settings、editor

## 反模式

- 页内自建校验展示绕开 FormItem

## 安装

```bash
ocp add Rate
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
