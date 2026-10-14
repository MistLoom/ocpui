---

type: Component

id: C:ERROR-STATE-BLOCK

name: ErrorStateBlock

tier: T2

package: "@ocpui/vue"

status: stable

surfaces: [overlay]

scenes: 
  - "workbench"
  - "editor"
  - "settings"

requires: [UiRoot]

composes: []

antiPatterns:
  - "createApp 挂 Message"
  - "messageService 旁路"

duty: "呈现可恢复失败态与后续路径"
since: "0.1.0"

---
# ErrorStateBlock

源码：`src/components/feedback/ErrorStateBlock.vue`

## 选用

- **Tier**：T2
- **Surface**：overlay
- **Scene**：workbench、editor、settings

## 反模式

- createApp 挂 Message
- messageService 旁路

## 安装

```bash
ocp add ErrorStateBlock
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
