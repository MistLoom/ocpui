---
id: I:UIP-MAP
doc_type: integration
parent: O:ROOT
related:
  - O:ESSENCE
  - F:PHILOSOPHY
design_intent: "建立 ui-design-planning 与 OCP 概念的双向对照与消费方式"
scope: "概念映射、产出消费、ID 边界"
status: stable
---

# ui-design-planning ↔ OCP 对照

## 1. 哲学层

| ui-design-planning | OCP |
|--------------------|-----|
| 提供方向与底线 | F:PHILOSOPHY + registry duty/antiPatterns |
| 职责锚定先行 | 选型 Step 0 + registry duty |
| 方向与形式分离 | design_intent vs Props/示例 |
| 活系统 | spec + reality-feedback + registry v2 渐进 |
| 决策追溯 | registry decisions[] |

## 2. 结构层

| 设计产出 | OCP 规格 | 工程落地 |
|---------|---------|---------|
| `.design-*/essence.md` | O:ESSENCE | 产品边界，不重复 |
| `.design-*/foundation/scenario` | 吸收到 O:ESSENCE 场景节 | — |
| `.design-*/foundation/design-principles` | F:PHILOSOPHY + F:VISUAL-LANG | theme token |
| `.design-*/foundation/interaction-network` | F:INTERACTION-NET + F:PERCEPTION | feedback 双通道 + 信号分层收编 |
| `.design-*/foundation/motion` | F:MOTION | motion registry + CSS vars |
| `.design-*/foundation/visual-language` | F:VISUAL-LANG | themes/contract |
| `.design-*/shared/*` (S:) | T4 ui-business + OCP S: 模式 | apps |
| `.design-*/pages/*/states` | F:STATE-SYSTEM | UiDataState + Shell |
| `.design-*/pages/*/interaction` | F:INTERACTION-NET + container-chain | Shell props |
| `.design-*/pages/*/motion` | F:MOTION + page 级 motion 附录 | 可选 docs |

## 3. 载体分级

| L1–L5 | OCP |
|-------|-----|
| L1 元素 | T0 |
| L2 单元 | T1/T2 |
| L3 区域 | T3 Shell |
| L4 页面 | T4 + AdminPage |
| L5 流程 | apps 路由/store 协议 |

## 4. 调度模型

| state-dispatch 维度 | OCP |
|--------------------|-----|
| 焦点调度 | dispatchRole, focusPolicy |
| 呈现模式 | presentationMode |
| 样式调度 | visual-language 降焦 |
| 动效调度 | motion 四元组 + 优先级 |
| 元素调度 | composes/slot，禁止 key 整刷 |
| 氛围 | L2 themeStyle（最低） |

## 5. 交互网络

| 设计概念 | OCP |
|---------|-----|
| 感知信号→响应 | F:PERCEPTION §3 分层收编矩阵 |
| 焦点分级（主/次/低/降/高焦） | F:PERCEPTION §4 权重 W0–W4 + token |
| 用户动作 vs 系统事件 | actionChannel / systemChannel |
| 跨页上下文 | AppShell + T4 store；OCP 提供 preserve hooks |
| 关联优先级 | 数据 > 同页 > 时序 > 跨页 |

## 6. 动效

| motion fundamentals | OCP |
|--------------------|-----|
| 六项原则 | F:MOTION §8 |
| 时长分级 | motion.tier → CSS vars |
| 标准动效库 | registry animation/* + motion 字段 |
| 特殊场景 | 合并进 F:MOTION 典型映射；禁止 Confetti 常规化 |

## 7. ID 边界

| 体系 | 前缀 | 互引方式 |
|------|------|---------|
| 产品设计 | E:/F:/P:/S: | T4 文档引用 C: |
| OCP 工程 | O:/F:/G:/C:/K:/S: | registry 不引用 P: 页面 ID |

## 8. 消费工作流

1. 页面设计产出 `.design-*/pages/X/states.md`
2. 对照 F:STATE-SYSTEM：缺态则补 T4 或提 T3 Shell
3. 选用走 G:SELECTION + registry
4. 实现后 reality-feedback 回流

## 9. 缺口（ intentional ）

| 设计技能能力 | OCP 不实现 | 负责层 |
|-------------|-----------|--------|
| 概率性情绪推断（犹豫/急切/阅读意图） | 确定性信号收编于 F:PERCEPTION，概率推断不进库 | T4 经通道门面扩展 |
| 页面级场景叙事 | — | .design-* |
| 全链路 L5 流程 | 协议边界 | apps/admin |

## 10. 契合度评估（基线）

| 域 | 改造前 | 本规格后目标 |
|----|--------|-------------|
| 组合/Tier/Registry | ~70% | 90%（v2 字段） |
| 调度/焦点 | ~20% | 75%（dispatchRole） |
| 10 态 | ~30% | 85%（UiDataState） |
| 双通道 | ~40% | 80%（S4 实现） |
| 动效四元组 | ~10% | 70%（S5） |
| 语义 ID | ~0% | 90%（S1） |
| 决策追溯 | ~15% | 75%（S6） |
