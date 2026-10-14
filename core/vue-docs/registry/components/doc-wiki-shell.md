---
type: "Component"
id: "C:DOC-WIKI-SHELL"
name: "DocWikiShell"
tier: "T3"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: [C:DOC-READER-SHELL, C:DOC-TOC, C:DOC-READING-PREFS, Tree, GlobalSearch]
duty: "多文档 Wiki：nav + 检索 + 面包屑"
since: "0.1.0"
handlesStates: [loading, error, empty, ready]
dispatchRole: "focus-host"
presentationMode: "read"
---
# DocWikiShell

源码：`src/components/DocWikiShell.vue`

## 职责

多文档 Wiki：nav + 检索 + 面包屑
