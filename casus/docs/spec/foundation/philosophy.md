---
id: F:PHILOSOPHY
doc_type: foundation
parent: O:ROOT
related:
  - O:ESSENCE
  - F:REGISTRY-SPEC
  - I:UIP-MAP
design_intent: "为 OCP 全部工程决策提供方向与底线，避免模板化组件堆砌"
scope: "设计哲学、活系统、决策追溯、AI 失误规避"
status: stable
---

# 设计哲学

## 1. 核心命题

**提供方向与底线，不堵上限。**

- **方向**：持久认知需求——用户要判断什么、操作边界在哪、状态是否可继续。
- **底线**：禁止模式、调度优先级、双通道边界、10 态不可合并。
- **形式**：Vue 组件、props、CSS token——可替换，语义契约不可替换。

## 2. 职责锚定先行

任何 Registry 条目、Shell 组合、T4 选用前 MUST 完成：

| 要素 | Registry 承载 | 检验 |
|------|--------------|------|
| 本质职责 | `duty`（动词短语） | 删除该组件后界面缺什么能力 |
| 发展方向 | `design_intent` | 是否服务于持久认知目标 |
| 系统位置 | `tier` + `requires` + `composes` | 上下游边界是否声明 |
| 不承担 | `antiPatterns` + 文档 | 是否蔓延到领域判断 |

`name: Button` 是符号；`duty: "承载单一可点击确认动作"` 是职责。

## 3. 场景驱动选用

选型 MUST 在职责边界内回答：**谁、在哪、做什么、怕什么**。

信息不足时停止新增组件，先补 registry `decisions[]` 或向产品确认。禁止「其他项目也有所以加一份」。

## 4. 活系统：三层合成

```
spec/（规格）
    ↕ ID 引用
packages/*/registry/（机读知识，v2 扩展）
    ↕ 实现
packages/ocpui-vue|vue-admin/（Provider、通道、状态、token）
    ↕ 消费
apps/admin（AppShell、T4）
```

| 层 | 就绪时机 | 来源 |
|----|---------|------|
| 核心规格 | 立即 | essence + philosophy + tier + container + registry-spec |
| 扩展规格 | 首个 Shell 模式稳定后 | state/interaction/motion 从 AdminWorkList 等归纳 |
| 现实反馈 | 交付后 | `reality-feedback/` 修正规格或 registry |

扩展规格 **MUST NOT** 从 ui-design-planning 参考库直接复制；须从本项目 Shell/Block 实现归纳。

## 5. 方向与形式分离

| 层面 | 规格写法 | 禁止 |
|------|---------|------|
| design_intent | 认知需求 | 「此组件是一个 Card」 |
| duty | 动词短语 | 「列表组件」 |
| motion.purpose | explain_focus / explain_state / … | 「fade 300ms」单独出现 |
| states | 业务语义枚举 | 仅 loading boolean |

形式实现附于 registry 正文「示例」「Props」，不写入 intent 字段。

## 6. 决策追溯

每个 T2+ registry 条目 SHOULD 含 3–5 条：

```yaml
decisions:
  - intent: "让用户把提交结果对应到原动作"
    sceneRef: "高频表单提交"
    manifestation: "actionChannel inline + 按钮 loading 态"
```

合成检查：删除项目名后，决策是否仍成立？不成立则视为模板化，须重写。

## 7. AI / 人工失误规避（OCP 版）

| 失误 | OCP 纠正 |
|------|---------|
| 职责漂移 | 查 `duty` + tier；T4 逻辑不得下沉 T2 |
| 只 happy path | T2+ 强制 `handlesStates` |
| 反馈远离触发源 | actionChannel 内联优先 |
| 双轨反馈 | 禁止 messageService；走 UiRoot |
| 动效滥用 | registry `motion` 必填 purpose；禁止 Confetti 作常规反馈 |
| 组件分裂 | visual-language 派生，禁止组件内新 scale |
| 万物 Card | container-chain 决策表 |
| 状态合并 | UiDataState 枚举不可自由组合 |
| Registry 空壳 | v2 字段 CI 渐进门禁 |

## 8. 与改造方案的关系

本文件定义 **为什么**；`docs/组件库改造方案.md` 定义 **何时、如何迁移**。冲突时：底线以本规格为准，排期以改造方案为准。
