---
type: "Component"
id: "C:DOC-TOC"
name: "DocToc"
tier: "T2"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: []
duty: "页内目录与 scroll spy"
since: "0.1.0"
handlesStates: [ready, empty]
motion:
  - trigger: scroll
    purpose: explain_focus
    tier: micro
---
# DocToc

源码：`src/components/DocToc.vue`

## 职责

页内目录与 scroll spy
