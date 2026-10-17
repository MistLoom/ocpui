---
id: G:T4-BOUNDARY
doc_type: guide
parent: O:ROOT
related:
  - O:ESSENCE
  - F:TIER-CARRIER
design_intent: "明确 ui-business 与 OCP 包的职责边界与合法组合方式"
scope: "T4 规则、引用 ID、禁止下沉"
status: stable
---

# T4 边界

## 1. 位置

```
apps/admin/src/ui-business/     # T4 Product
apps/admin/src/pages/         # 页面组装（T3 + T4）
```

**禁止** T4 进入 `core/vue*`。

## 2. T4 职责

- 绑定领域模型、API、store
- 组合 T0–T3；引用 OCP `C:` / `K:` / `S:`
- 形态可变；**语义**须与设计产出 `.design-*/shared/*` 对齐

## 3. 合法依赖

| 允许 | 禁止 |
|------|------|
| `@ocpui/vue`, `@ocpui/vue-admin` | 复制 Button 样式 |
| `@/logic/*`, api-client | 把 domain 类型塞进 T2 props |
| OCP registry ID 文档引用 | 绕过 UiRoot 反馈 |

## 4. 升降级

- 第二产品复用 → 提 T2/T3 + registry
- T4 中出现第三次相同布局 → 提 `K:` recipe

## 5. 状态与通道

T4 **MUST** 使用 OCP 10 态语义表达领域态，不可 invent `pending` 混用 loading/success_followup。

- 用户确认发布 → actionChannel
- 传播进度 → systemChannel，不抢焦点

## 6. 与设计产出协作

| 设计 ID | T4 实现 |
|---------|---------|
| S:TASK-ITEM | ui-business TaskItem + C:ADMIN-WORK-LIST 行 slot |
| P:WORKBOARD | pages/workbench + K:ADMIN-LIST-PAGE |

设计文档引用 OCP ID，不重复定义 T0 规范。

## 7. 审查清单

- [ ] 无 packages 反向 import T4
- [ ] 无平行 Shell（自建 page padding/header）
- [ ] 反馈走 useUiFeedback / useFeedback 适配
- [ ] 领域文案 useI18n，非 useUiT 硬编码
