---
type: "Component"
id: "C:DOC-EDITOR-SHELL"
name: "DocEditorShell"
tier: "T3"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: [C:MARKDOWN-BODY, C:DOC-MARKDOWN-EDITOR, C:DOC-VISUAL-EDITOR, C:DOC-FRONTMATTER-PANEL]
duty: "所见即所得/源码/分屏三模式编辑，元数据经 Drawer 收束"
since: "0.1.0"
handlesStates: [ready, error]
dispatchRole: "focus-host"
---
# DocEditorShell

源码：`src/components/DocEditorShell.vue`

## 职责

所见即所得/源码/分屏三模式编辑，元数据经 Drawer 收束
