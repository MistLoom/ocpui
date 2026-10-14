---
type: "Component"
id: "C:DOC-NAV-TREE"
name: "DocNavTree"
tier: "T2"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: [Tree]
duty: "Wiki 侧栏导航树"
since: "0.1.0"
handlesStates: [ready, empty]
dispatchRole: "chrome-host"
---
# DocNavTree

源码：`src/components/DocNavTree.vue`

## 职责

Wiki 侧栏导航树
