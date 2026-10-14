---
id: F:SEMANTIC-IDS
doc_type: foundation
parent: O:ROOT
related:
  - F:REGISTRY-SPEC
  - I:UIP-MAP
design_intent: "跨文件、跨包、跨版本稳定引用组件与组合模式"
scope: "OCP ID 前缀、编码规则、与 .design-* ID 边界"
status: stable
---

# 语义 ID

## 1. 与 ui-design-planning ID 的边界

| 体系 | 前缀 | 存放 | 用途 |
|------|------|------|------|
| 产品设计产出 | `E:` `F:` `P:` `S:` | `.design-YYYYMMDD/` | 页面/区域/共享载体设计 |
| **OCP 工程** | `O:` `F:` `G:` `C:` `K:` `S:` | `spec/` + registry | 组件、Shell 模式、规格 |

**不共用组件 ID**：设计产出 `S:TASK-ITEM` 可 **引用** OCP `C:ADMIN-WORK-LIST` + T4 扩展，但 ID 空间独立，避免路径重组断链。

## 2. OCP ID 前缀

| 前缀 | 含义 | 示例 |
|------|------|------|
| `O:` | OCP 体系入口 | `O:ROOT`, `O:ESSENCE` |
| `F:` | foundation 规格 | `F:STATE-SYSTEM` |
| `G:` | guide | `G:SELECTION` |
| `C:` | 组件（registry） | `C:BUTTON`, `C:DATA-TABLE` |
| `K:` | Shell 组合模式（recipe） | `K:ADMIN-LIST-PAGE` |
| `S:` | 跨页 UI 模式（无单一组件） | `S:LIST-WITH-FILTER` |

规格文档 ID 用 `O:` / `F:` / `G:`；registry 组件用 `C:`；文档化组合范式用 `K:` / `S:`。

## 3. 组件 ID 编码

```
C:{SEMANTIC-NAME}
```

- 大写英文 + 连字符
- 源于职责，非文件路径：`C:BUTTON` 非 `C:UTILITY-BUTTON`
- 与 `name` 字段并存：`name` 为导出符号，`id` 为稳定引用
- 一经分配不可变更；文件移动不影响 ID

## 4. 组合模式 ID

**K:ADMIN-LIST-PAGE** 示例：

```yaml
id: K:ADMIN-LIST-PAGE
composes:
  - C:ADMIN-PAGE
  - C:ADMIN-WORK-LIST
  - C:DATA-TABLE
surface: list
scene: workbench
```

供 AI 与文档引用完整范式，无需重复列举 composes。

## 5. 引用规则

- 规格互引：优先 ID，括号附路径
- registry：`id` 必填（v2）；`related: [C:EMPTY, C:LOADING]`
- T4 文档：引用 `C:` / `K:` / `S:`，禁止硬编码 `packages/ocpui/core/vue/src/...`
- CLI：`ocp list --id C:BUTTON`（S1 起实现）

## 6. CI

- 全局唯一：`id` 不可重复
- 每个 `C:` 必须存在对应 registry 文件
- 每个 registry 文件的 `id` 必须存在于 index 或 `ocp list` 输出

## 7. 迁移

204 条存量：S1 阶段批量分配 `C:{NAME-KEBAB}` stub，`name` 不变。新组件创建时同步分配 ID。
