---

type: Component

id: C:CHAT-THINKING

name: ChatThinking

tier: T2

package: "@ocpui/vue-admin"

status: stable

surfaces: [detail]

scenes: [editor]

requires: [UiRoot]

composes: [Loading]

antiPatterns:[]

localeKeys: [business.chat.*]
duty: "呈现模型思考过程与进度摘要"
since: "0.1.0"

---
# ChatThinking

源码：`src/components/business/chat/ChatThinking.vue`

## 选用

- **Tier**：T2
- **Surface**：detail
- **Scene**：editor

## 组合

- Loading

## i18n

- `business.chat.*`

## 安装

```bash
ocp add ChatThinking
```

## Props

- 见组件源码 `defineProps` 与类型导出

## 反模式

- 绕过 ChatThinking 手写等价 UI

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
