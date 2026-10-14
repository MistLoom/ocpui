---

type: Component

id: C:ADMIN-PAGE

name: AdminPage

tier: T3

package: "@ocpui/vue-admin"

status: stable

surfaces: 
  - "list"
  - "detail"
  - "form"
  - "chart"

scenes: 
  - "workbench"
  - "settings"
  - "audit"
  - "editor"

requires: [UiRoot]

composes: 
  - "PageHeader"
  - "SizeScope"
  - "UiScenarioScope"

slots: 
  - "header"
  - "tabs"
  - "toolbar"
  - "default"
  - "extra"
antiPatterns:
  - "页根 padding"
  - "自建 __header 样式块"
  - "绕过 SizeScope 的 toolbar 控件"

localeKeys: [navigation.pageHeader.*]
duty: "承载后台页面布局分区与主内容焦点"
dispatchRole: focus-host
decisions:
  - intent: "让工具栏与主内容焦点分离"
    sceneRef: "列表 CRUD 并行筛选与浏览"
    manifestation: "#toolbar 使用 SizeScope sm，Body 为 focus-host"
  - intent: "让 surface/scene 在 Shell 内可局部覆盖"
    sceneRef: "同页多区域 preset 不同"
    manifestation: "内嵌 UiScenarioScope 传播 data-ui-surface"
  - intent: "禁止页根多余 padding 破坏 Shell rhythm"
    sceneRef: "迁移旧页面样式"
    manifestation: "antiPattern 页根 padding"
since: "0.1.0"

---
# AdminPage

源码：`src/components/layout/AdminPage.vue`

## 选用

- **Tier**：T3
- **Surface**：list、detail、form、chart
- **Scene**：workbench、settings、audit、editor

## 组合

- PageHeader
- SizeScope
- UiScenarioScope

## 插槽

- `#header`
- `#tabs`
- `#toolbar`
- `#default`
- `#extra`

## 反模式

- 页根 padding
- 自建 __header 样式块
- 绕过 SizeScope 的 toolbar 控件

## i18n

- `navigation.pageHeader.*`

## 安装

```bash
ocp add AdminPage
```

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
