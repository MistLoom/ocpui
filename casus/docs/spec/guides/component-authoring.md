---
id: G:AUTHORING
doc_type: guide
parent: O:ROOT
related:
  - F:REGISTRY-SPEC
  - F:STATE-SYSTEM
  - F:MOTION
design_intent: "新增或改造 T0–T3 组件时的统一工程规范"
scope: "作者 checklist、文件布局、测试、registry 同步"
status: stable
---

# 组件作者指南

## 1. 开始前

- [ ] 职责锚定：`duty` + `design_intent` 草稿
- [ ] 确认 tier；T4 需求拒绝进 packages
- [ ] 查 registry 是否已有 `composes` 可复用
- [ ] 查 antiPatterns 是否禁止该形态

## 2. 文件布局

```
core/vue/
  src/components/{category}/{Name}.vue
  registry/{category}/{name-kebab}.md
```

admin 包同理 `vue-admin`。

## 3. 实现约束

| 项 | 要求 |
|----|------|
| 依赖 | 无 `@/`、apps、api-client |
| i18n | `useUiT`；keys 写入 registry |
| 尺寸 | sm/md/lg；SizeScope 链 |
| 浮层 | PopupPanel + useFloatingPosition |
| 反馈 | useUiFeedback；声明 feedbackChannel |
| 主题 | L1 token；surface/scene 差量 |
| 动效 | animation/overlay 填 motion 四元组 |
| 注释 | 中文；说明非显而易见的业务约束 |

## 4. Tier 专项

### T0

- `interactionStates` in registry
- 无 10 态
- 单文件职责；无页面 prop

### T1

- 结构组合；slots 文档化
- overlay 类：motion + focusPolicy

### T2

- `handlesStates` 或 `delegatesStatesTo`
- Empty/Error/Loading 复用，不复制 UI
- `decisions` ≥2

### T3

- `dispatchRole` + slots（toolbar/body）
- 提供状态编排或文档化委托关系
- 与 AdminPage 组合示例

## 5. registry 同步

组件变更 **MUST** 同步 registry：

- composes / slots / antiPatterns
- localeKeys
- status（draft→stable 须 review）

## 6. 测试

- 单元：logic composable、props 默认值
- 主题：关键组件 theme snapshot（已有 pattern）
- a11y：focus trap（Modal）、aria（Button）

## 7. CLI

新组件须可被 `ocp add {Name}` 解析（Phase 2+ 全量）。

## 8. 提交检查清单

- [ ] registry v2 字段完整（按 tier）
- [ ] `id` 唯一
- [ ] 无硬编码业务文案（除 demo）
- [ ] antiPatterns 至少 1 条（如有常见误用）
- [ ] 决策追溯可填

## 9. 禁止

- 组件内 messageService / createApp toast
- 新 spacing/radius scale
- 装饰性动效无 motion.purpose
- 复制粘贴 T0 样式到 T4
