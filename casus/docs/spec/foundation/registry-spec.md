---
id: F:REGISTRY-SPEC
doc_type: foundation
parent: O:ROOT
related:
  - F:SEMANTIC-IDS
  - F:STATE-SYSTEM
  - F:MOTION
  - registry/frontmatter-v2.schema.yaml
design_intent: "机读组件知识的完整契约，供 AI、CLI、CI 消费"
scope: "Registry v1→v2、frontmatter 字段、门禁"
status: stable
---

# Registry 规格

## 1. 定位

Registry = OKF 思想在 OCP 中的落地：**人机共读、最小强制字段、生产者/消费者解耦**。

- 物理位置：`core/vue/registry/`、`core/vue-admin/registry/`
- 随 npm 发布；消费方可脱离 monorepo 仅读 registry 选型
- 权威 schema：`registry/frontmatter-v2.schema.yaml`

## 2. v1 最小契约（已实施）

```yaml
type: Component
name: DataTable
tier: T3
package: "@ocpui/vue-admin"
status: stable | deprecated | draft
surfaces: [list]
scenes: [workbench]
requires: [UiRoot]
composes: [Table, Pagination, Empty]
slots: [toolbar, footer]
antiPatterns:
  - "Card wrapping DataTable"
localeKeys: [dataDisplay.dataTable.*]
since: "0.1.0"
```

## 3. v2 扩展字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | S1+ | `C:DATA-TABLE`，见 semantic-ids |
| `duty` | S2+ T2+ | 动词短语职责 |
| `design_intent` | S2+ T2+ | 认知需求，非形式描述 |
| `dispatchRole` | T3 | focus-host / chrome-host / content-host / overlay-host |
| `focusPolicy` | overlay 类 | restore-trigger / lock |
| `handlesStates` | T2+ 数据型 | UiDataState 子集 |
| `delegatesStatesTo` | T2 | 委托 Shell 名 |
| `feedbackChannel` | T2+ | action / system / both |
| `interactionStates` | T0 | hover, focus, disabled, loading |
| `motion` | animation+overlay | 四元组，见 motion-system |
| `decisions` | S6+ T2+ | 决策追溯数组 |
| `related` | 可选 | 关联 `C:` / `K:` ID |

## 4. v2 示例（AdminWorkList 目标态）

```yaml
---
type: Component
id: C:ADMIN-WORK-LIST
name: AdminWorkList
tier: T3
package: "@ocpui/vue-admin"
status: stable
duty: "编排列表体的加载、失败、空与有数据分支"
design_intent: "让用户在列表场景下始终知道能否继续浏览或操作"
surfaces: [list]
scenes: [workbench, audit]
requires: [UiRoot]
composes: [Empty, ErrorStateBlock, Loading, Skeleton]
slots: [default, error-action, empty-footer]
dispatchRole: content-host
handlesStates: [loading, error, empty, ready]
feedbackChannel: both
antiPatterns:
  - "列表体自建 loading/empty 分支"
  - "Card 包裹列表行"
decisions:
  - intent: "空与无结果分支可区分"
    sceneRef: "筛选后无匹配"
    manifestation: "hasFilter 驱动 Empty 文案分支"
localeKeys: [feedback.empty.*, feedback.errorState.*]
since: "0.1.0"
---
```

## 5. 正文结构（每个 .md）

1. 选用（Tier / surface / scene）
2. 组合（composes + slots）
3. 状态（handlesStates 映射）
4. 反馈（feedbackChannel 用法）
5. 动效（若有 motion）
6. 反模式
7. i18n
8. 安装（`ocp add`）
9. 示例

## 6. CI 门禁（渐进）

| 阶段 | 检查 |
|------|------|
| 现况 | T0–T3 文件存在；name 唯一 |
| S1 | `id` 唯一且格式合法 |
| S2 | T2+ 有 `duty`；数据型有 `handlesStates` 或 `delegatesStatesTo` |
| S3 | T3 有 `dispatchRole` |
| S5 | animation/overlay 有 `motion` |
| S6 | T3 示范条目含 `decisions` ≥3 |

脚本扩展：`check-registry-sync`（改造方案 Phase 5 前置）。

## 7. CLI 关系

- `ocp list` / `ocp list --tier T3` / `ocp list --id C:BUTTON`
- `ocp add` 复制源码 + 保留 registry 引用 ID
- 本地 override 不改变 `id`

## 8. 与 guide/components 关系

`casus/docs/components/*.md` 为 **示例与 Demo**；字段权威以 registry + 本规格为准。同步策略见 integration/ocpui-docs-sync.md。
