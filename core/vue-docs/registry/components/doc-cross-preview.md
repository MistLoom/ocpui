---
type: "Component"
id: "C:DOC-CROSS-PREVIEW"
name: "DocCrossPreview"
tier: "T2"
package: "@ocpui/vue-docs"
status: "stable"
surfaces: [editorial]
scenes: [editor]
requires: [UiRoot]
composes: []
duty: "跨文档链接悬停摘要卡"
since: "0.1.0"
handlesStates: [loading, ready, error]
dispatchRole: "overlay-host"
motion:
  - trigger: overlay_open
    purpose: explain_spatial_origin
    tier: light
    mustNot: [steal_focus]
---
# DocCrossPreview

源码：`src/components/DocCrossPreview.vue`

## 职责

跨文档链接悬停摘要卡
