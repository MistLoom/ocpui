---
id: I:DOCS-SYNC
doc_type: integration
parent: O:ROOT
related:
  - F:REGISTRY-SPEC
  - G:SELECTION
design_intent: "避免 guide/components 与 spec 重复或冲突"
scope: "VitePress 文档分工与同步规则"
status: stable
---

# 文档同步策略

## 1. 分工

| 位置 | 受众 | 内容 |
|------|------|------|
| `spec/` | 维护者、AI、架构审查 | 哲学、契约、状态/交互/动效系统 |
| `guide/`、`components/` | 组件消费者 | 快速上手、Demo、API 示例 |
| `core/vue/registry/` 等 | CLI、AI 选型 | 机读 frontmatter + 简版说明 |

## 2. 权威顺序

冲突时：**spec > registry > guide/components**

## 3. guide/components 应做

- 链接到 [spec/index.md](../index.md)
- guide/selection 保持精简，指向 G:SELECTION 完整版
- guide/container-chain 与 F:CONTAINER-CHAIN 一致；扩展字段在 spec 先行
- components/*.md：Demo + Props 摘要；duty/states 引用 registry

## 4. guide/components 不应做

- 重复 F:PHILOSOPHY 全文
- 定义与 specs 矛盾的 antiPatterns
- 单独维护 Tier 定义（引用即可）

## 5. 同步触发

| 事件 | 动作 |
|------|------|
| registry v2 新字段 | 更新 F:REGISTRY-SPEC + 视需要更新 guide |
| 新 T3 Shell | 增加 components demo + G:SHELL recipe |
| motion/states 枚举变更 | 更新 F:STATE-SYSTEM / F:MOTION + 相关 demo |

## 6. VitePress 配置

- nav 增加「设计体系」→ `/spec/`
- README 链到 spec 入口

## 7. 决策追溯

| 决策 | 表现 |
|------|------|
| spec 与 guide 同站发布 | 相对路径引用，无包外文档依赖 |
| registry 随 npm | 消费方可不 clone spec |
