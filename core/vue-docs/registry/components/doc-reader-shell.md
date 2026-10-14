---
type: "Component"
id: "C:DOC-READER-SHELL"
name: "DocReaderShell"
tier: "T3"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: [C:MARKDOWN-BODY, C:DOC-TOC, C:DOC-READING-PREFS]
duty: "单页阅读：正文 + TOC + 偏好"
since: "0.1.0"
handlesStates: [loading, error, empty, ready]
dispatchRole: "focus-host"
presentationMode: "read"
---
# DocReaderShell

源码：`src/components/DocReaderShell.vue`

## 职责

单页阅读：正文 + TOC + 偏好
