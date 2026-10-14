---
id: F:INTERACTION-NET
doc_type: foundation
parent: O:ROOT
related:
  - F:PERCEPTION
  - F:CONTAINER-CHAIN
  - F:STATE-SYSTEM
  - F:MOTION
design_intent: "让用户动作与系统推送分责，跨容器关联可追踪"
scope: "双通道、载体关联、感知响应、跨页协议边界"
status: stable
---

# 交互网络

## 1. 双通道模型

OCP 反馈 **按责任分通道**，非仅按 UI 形态：

| 通道 | 来源 | API 面 | 典型 UI |
|------|------|--------|---------|
| **actionChannel** | 用户明确选择/确认 | dialog, confirm, inline validation, 按钮态 | ConfirmDialog, 表单内联错误 |
| **systemChannel** | 系统/异步/他人变更 | notify, loading, stream toast | Notify 中心, 全局 Loading, 任务行原位更新 |

`useUiFeedback()` **门面不变**（S4 内部分层）：

```typescript
interface UiFeedbackContext {
  // action
  dialog: UiDialogFeedback
  message: UiMessageFeedback  // 用户触发的 inline toast
  // system
  notify: UiNotifyFeedback
  loading: UiLoadingFeedback
  // 扩展
  register(channel, impl)
}
```

registry `feedbackChannel: action | system | both`。

### 映射规则

| 场景 | 通道 | 禁止 |
|------|------|------|
| 表单校验失败 | action | 仅 toast 无字段定位 |
| 用户点击提交 | action | system notify 代替按钮反馈 |
| 后台同步完成 | system | dialog 打断阅读 |
| 他人认领任务 | system | 自动跳转新任务抢焦点 |
| 权限不足 | action | 与 empty 合并 |

## 2. 载体关联（OCP  subset）

| 关联类型 | OCP 表达 | 示例 |
|---------|---------|------|
| 同页主从 | Shell slot + composes | 选中行 → 详情 panel |
| 同页条件 | Form 字段显隐 | 选项控制后续 FormItem |
| 跨页时序 | **应用层** store；OCP 提供恢复 slot/prop | 返回列表保留 scroll |
| 数据广播 | systemChannel 原位更新 | 行状态 patch，非整表刷新 |

L5 跨页协议 **不在 packages 实现**；OCP 定义边界：T3 不得假设路由实现，但 **MUST** 提供 `preserveSelection` / `restoreScroll` 等 Shell prop 钩子。

## 3. 感知信号 → 响应

信号识别策略（哪些信号 MUST/SHOULD 识别、哪些下放 T4、焦点权重如何变化）统一由 [perception](./perception.md) 定义：

- 信号分层收编矩阵：perception §3
- 焦点权重分级与转移：perception §4
- 信号 → motion trigger 词表：perception §5

本文件只管信号被识别后的 **通道归属**：用户明确动作走 actionChannel，系统/异步/他人变更走 systemChannel。

## 4. 调度与交互的衔接

系统事件默认 **不触发 focus-host 转移**：

- notify 在固定区域
- 任务行更新：`animation: none` 或局部形态变化
- 阻断性复核：overlay-host 临时取得焦点，关闭后 `restore-trigger`

与 [container-chain](./container-chain.md) 调度优先级一致。

## 5. 信号传播

| 方向 | 机制 |
|------|------|
| 向上 | DOM 事件 / v-model → Shell 汇总态 |
| 向下 | Shell provide `UiRegionState` → Block |

禁止 Block 直接调用应用 store。

## 6. 响应时效

| 类型 | 上限 | OCP 落点 |
|------|------|---------|
| 即时 | 100ms | hover/focus/active CSS |
| 反馈 | 500ms | actionChannel 确认 |
| 过渡 | 1s | overlay 进出场 |
| 渐进 | 1–3s | loading + 进度文案 |
| 后台 | 无即时 | systemChannel notify |

## 7. 禁止

- 混合态：`{ loading: true, success: true }` 单字段表达
- system 事件触发 action 级 dialog（除非用户点击 notify）
- Toast 遮挡当前操作区
- 错误不可恢复（无 retry / 调整入口）

## 8. admin 适配

`apps/admin` 的 `useFeedback()` **适配** systemChannel + 扩展 notify stream，不平行实现 message 单例。改造 Phase 4 统一。

## 9. 决策追溯

| 决策 | 依据 | 表现 |
|------|------|------|
| 门面不变 | 避免破坏已有 useUiFeedback 调用 | feedback-bridge 内部分层 |
| system 不抢焦点 | 审核/运维场景 | motion-system + 本文件 §4 |
| 跨页归应用 | L5 非 OCP 组件 | AppShell 契约 |
