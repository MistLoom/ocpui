---

type: Component

id: C:ADMIN-WORK-LIST

name: AdminWorkList

tier: T3

package: "@ocpui/vue-admin"

status: stable

surfaces: [list]

scenes: 
  - "workbench"
  - "audit"

requires: [UiRoot]

composes: 
  - "Empty"
  - "ErrorStateBlock"
  - "Loading"

slots: [default]
antiPatterns:
  - "列表体自建 loading/empty 分支"
  - "Card 包裹列表行"

localeKeys: 
  - "feedback.empty.*"
  - "feedback.errorState.*"
duty: "编排列表体的加载、失败、空、无权限与有数据分支"
dispatchRole: content-host
handlesStates:
  - initial
  - loading
  - ready
  - empty
  - partial_error
  - error
  - forbidden
feedbackChannel: both
decisions:
  - intent: "空与无结果分支可区分"
    sceneRef: "筛选后无匹配"
    manifestation: "hasFilter 驱动 Empty 文案分支"
  - intent: "10 态语义进接入"
    sceneRef: "Shell 统一编排"
    manifestation: "regionState prop 覆盖布尔分支"
  - intent: "无权限不伪装为空"
    sceneRef: "责任范围不足"
    manifestation: "forbidden 独立分支与 #forbidden-action"
motion:
  trigger: system_event
  purpose: explain_state
  tier: none
  interruptible: true
  stopWhen: result_readable
  mustNot: [steal_focus, imply_success]
since: "0.1.0"

---
# AdminWorkList

源码：`src/components/layout/AdminWorkList.vue`

## 选用

- **Tier**：T3
- **Surface**：list
- **Scene**：workbench、audit
- 状态入口：`regionState` 统一状态语义（F:STATE-SYSTEM）

## 组合

- Empty
- ErrorStateBlock
- Loading

## 插槽

- `#default`

## 反模式

- 列表体自建 loading/empty 分支
- Card 包裹列表行

## i18n

- `feedback.empty.*`
- `feedback.errorState.*`

## 安装

```bash
ocp add AdminWorkList
```

## 示例

```vue
<!-- 见 VitePress docs 或源码 __demos__ -->
```
