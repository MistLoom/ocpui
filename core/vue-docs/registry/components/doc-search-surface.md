---
type: "Component"
id: "C:DOC-SEARCH-SURFACE"
name: "DocSearchSurface"
tier: "T2"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: [GlobalSearch]
duty: "文档检索面（GlobalSearch 壳）"
since: "0.1.0"
handlesStates: [ready, empty]
dispatchRole: "overlay-host"
motion:
  - trigger: overlay_open
    purpose: explain_focus
    tier: light
---
# DocSearchSurface

源码：`src/components/DocSearchSurface.vue`

## 职责

文档检索面（GlobalSearch 壳）
