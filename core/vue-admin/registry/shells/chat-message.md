---

type: Component

id: C:CHAT-MESSAGE

name: ChatMessage

tier: T2

package: "@ocpui/vue-admin"

status: stable

surfaces: [detail]

scenes: [editor]

requires: [UiRoot]

composes: 
  - "Avatar"
  - "Markdown"

antiPatterns:[自建聊天气泡样式]

localeKeys: [business.chat.*]
duty: "呈现单条对话消息内容与发送元数据"
since: "0.1.0"

---
# ChatMessage

源码：`src/components/business/chat/ChatMessage.vue`

## 选用

- **Tier**：T2
- **Surface**：detail
- **Scene**：editor

## 组合

- Avatar
- Markdown

## 反模式

- 自建聊天气泡样式

## i18n

- `business.chat.*`

## 安装

```bash
ocp add ChatMessage
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
