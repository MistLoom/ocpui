---
type: "Component"
id: "C:DOC-VISUAL-EDITOR"
name: "DocVisualEditor"
tier: "T2"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: []
duty: "Milkdown Crepe 所见即所得编辑，解析失败回退源码"
since: "0.1.0"
handlesStates: [ready, error]
dispatchRole: "focus-host"
---
# DocVisualEditor

源码：`src/components/DocVisualEditor.vue`

## 职责

Milkdown Crepe 所见即所得编辑，解析失败回退源码
