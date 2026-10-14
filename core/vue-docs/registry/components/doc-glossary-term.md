---
type: "Component"
id: "C:DOC-GLOSSARY-TERM"
name: "DocGlossaryTerm"
tier: "T2"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: []
duty: "术语标记 + 浮层释义"
since: "0.1.0"
handlesStates: [ready]
dispatchRole: "overlay-host"
motion:
  - trigger: overlay_open
    purpose: explain_spatial_origin
    tier: light
    mustNot: [steal_focus]
---
# DocGlossaryTerm

源码：`src/components/DocGlossaryTerm.vue`

## 职责

术语标记 + 浮层释义
