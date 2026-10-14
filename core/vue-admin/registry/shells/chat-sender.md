---

type: Component

id: C:CHAT-SENDER

name: ChatSender

tier: T2

package: "@ocpui/vue-admin"

status: stable

surfaces: [form]

scenes: [editor]

requires: [UiRoot]

composes: 
  - "Textarea"
  - "Button"

antiPatterns:[]

localeKeys: [business.chat.*]
duty: "承载对话输入、发送与附件操作"
since: "0.1.0"

---
# ChatSender

源码：`src/components/business/chat/ChatSender.vue`

## 选用

- **Tier**：T2
- **Surface**：form
- **Scene**：editor

## 组合

- Textarea
- Button

## i18n

- `business.chat.*`

## 安装

```bash
ocp add ChatSender
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 ChatSender 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
