# 现实反馈

OCP 规格是活体系。交付后通过本目录采集信号并修正规格或 registry。

## 信号类型

| 信号 | 迹象 | 修正目标 |
|------|------|---------|
| 职责漂移 | 组件被误用于职责外场景 | registry duty / antiPatterns |
| 选型失败 | AI 反复选错 Tier | G:SELECTION / registry |
| 状态合并 | 实现中 loading/error 混用 | F:STATE-SYSTEM |
| 焦点失效 | 系统 notify 抢焦点 | F:INTERACTION-NET / F:MOTION |
| 动效滥用 | 无 purpose 的 transition | F:MOTION / registry motion |
| 双通道旁路 | 页面直接 toast 绕过 UiRoot | F:INTERACTION-NET |
| 形式衰退 | 新交互方式出现 | 版本演进 spec |

## 修正传导

| 来源 | 路径 |
|------|------|
| F:* 规格 | → registry v2 → 组件实现 |
| registry | → guide/components demo |
| T4 反复模式 | → 评估升 T2/T3 |

## 记录

修正写入 `corrections-log.md`（创建后维护）。格式：

```markdown
## {date} — {feedback_id}
- 信号：…
- 修正：…
- 影响 ID：C:…, F:…
```

## 与 .design-* 关系

产品级职责漂移在 `.design-*/reality-feedback/` 处理；OCP 层只修组合/组件契约。
