---
type: "Component"
id: "C:DOC-MARKDOWN-EDITOR"
name: "DocMarkdownEditor"
tier: "T2"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: []
duty: "CodeMirror 6 GFM 源码编辑"
since: "0.1.0"
handlesStates: [ready]
dispatchRole: "focus-host"
---
# DocMarkdownEditor

源码：`src/components/DocMarkdownEditor.vue`

## 职责

CodeMirror 6 GFM 源码编辑
