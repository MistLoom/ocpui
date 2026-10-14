---

type: Component

id: C:SIZE-SCOPE

name: SizeScope

tier: T1

package: "@ocpui/vue-admin"

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

antiPatterns:[toolbar 内控件绕过 SizeScope]

duty: "向子树传播统一尺寸上下文"
since: "0.1.0"

---
# SizeScope

源码：`src/components/layout/SizeScope.vue`

## 选用

- **Tier**：T1
- **Surface**：list、form、overlay
- **Scene**：workbench、settings、editor

## 反模式

- toolbar 内控件绕过 SizeScope

## 安装

```bash
ocp add SizeScope
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
