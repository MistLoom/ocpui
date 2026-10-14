---

type: Component

id: C:LAYOUT-SIDER

name: LayoutSider

tier: T3

package: "@ocpui/vue-admin"

status: stable

surfaces: [list]

scenes: [workbench]

requires: [UiRoot]

composes: 
  - "Menu"
  - "Collapse"

slots: 
  - "default"
  - "footer"
antiPatterns:
  - "页面级直接使用 LayoutSider"
  - "与 AppShell 平行双导航"

localeKeys: [navigation.menu.*]
duty: "承载侧栏导航结构与折叠布局"
dispatchRole: chrome-host
since: "0.1.0"

---
# LayoutSider

源码：`src/components/layout/LayoutSider.vue`

## 选用

- **Tier**：T3
- **Surface**：list
- **Scene**：workbench

## 组合

- Menu
- Collapse

## 插槽

- `#default`
- `#footer`

## 反模式

- 页面级直接使用 LayoutSider
- 与 AppShell 平行双导航

## i18n

- `navigation.menu.*`

## 安装

```bash
ocp add LayoutSider
```

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
