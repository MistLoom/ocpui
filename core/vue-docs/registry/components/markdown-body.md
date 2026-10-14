---
type: "Component"
id: "C:MARKDOWN-BODY"
name: "MarkdownBody"
tier: "T2"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: []
duty: "将 compile 结果渲染为可访问 DOM"
since: "0.1.0"
handlesStates: [loading, error, ready]
presentationMode: "read"
---
# MarkdownBody

源码：`src/components/MarkdownBody.vue`

## 职责

将 compile 结果渲染为可访问 DOM
