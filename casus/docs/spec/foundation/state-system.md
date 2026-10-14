---
id: F:STATE-SYSTEM
doc_type: foundation
parent: O:ROOT
related:
  - F:PERCEPTION
  - F:INTERACTION-NET
  - F:MOTION
  - F:VISUAL-LANG
  - C:ADMIN-WORK-LIST
design_intent: 让异步、权限、部分失败、成功后续等中间态可辨认且可行动
scope: UiDataState 10 态、Shell 编排、反馈位置、T0 交互态边界
status: stable
tags: []
---
# 状态系统

## 1. 两层状态

| 层         | 名称                 | 适用                  | 枚举                                               |
| --------- | ------------------ | ------------------- | ------------------------------------------------ |
| **业务数据态** | UiDataState        | T2+ 数据型 Block/Shell | 10 态（下文）                                         |
| **交互态**   | InteractionState | T0 控件               | default, hover, focus, active, disabled, loading |

T0 **不强制** 10 态；T2+ 数据型 **MUST** 声明 `handlesStates` 或 `delegatesStatesTo`。

## 2. UiDataState 十态

| 状态                 | 语义      | 用户须能回答      | 禁止合并          |
| ------------------ | ------- | ----------- | ------------- |
| `initial`          | 尚未请求    | 当前责任/范围是什么  | → loading 无说明 |
| `loading`          | 取得中     | 正在取得什么范围    | → empty       |
| `ready`            | 有数据可继续  | 下一步动作是什么    | —             |
| `empty`            | 范围内无数据  | 为何为空、如何调整   | → error       |
| `partial_error`    | 部分范围失败  | 哪些成功、哪些失败   | → 全部失败        |
| `error`            | 全部失败    | 阻断原因、恢复路径   | → empty       |
| `forbidden`        | 无权限     | 缺什么权限、如何申请  | → empty       |
| `submitting`       | 用户命令已发出 | 等待什么、不可重复   | → ready       |
| `success`          | 命令已生效   | 生效范围、操作者、时间 | → ready       |
| `success_followup` | 后续责任未了  | 传播/复核/维护待办  | → success     |

**成功后续**须独立：`success` 表示命令生效；`success_followup` 表示仍有异步责任。

## 3. 视觉与反馈（多通道）

每态 MUST 同时满足：

1. **文字**：状态名或原因（非占位符）
2. **位置**：反馈贴近触发源或所属区域
3. **形态**：骨架/空图/错误块等可辨结构
4. **语义色**：辅助，不可单独承担语义

`prefers-reduced-motion` 下 1–4 仍完整。

数据态与焦点权重正交：loading/error/empty 等不改变焦点权重（W0–W4，见 [perception](./perception.md) §4）；错误可以 afforded 级警示提示，但不自动夺取主焦点。

## 4. 反馈通道映射

| 态                                       | 主通道             | 形式                                |
| --------------------------------------- | --------------- | --------------------------------- |
| initial, ready                          | —               | 静态呈现                              |
| loading                                 | system          | 区域占位 / Skeleton                   |
| empty, error, partial\_error, forbidden | system + action | Empty / ErrorStateBlock + 操作 slot |
| submitting                              | action          | 触发按钮 loading + 内联文案               |
| success                                 | action          | 触发源邻近短确认                          |
| success\_followup                       | system          | 原任务区域稳定展示待办                       |

详见 [interaction-network](./interaction-network.md) 双通道定义。

## 5. Shell 编排

### 5.1 composable：`useUiRegionState`

```typescript
// 概念 API（S2 落地于 @ocpui/vue-admin）
interface UiRegionStateOptions<T> {
  fetch: () => Promise<T>
  isEmpty?: (data: T) => boolean
  mapError?: (err: unknown) => UiDataState
}

// 返回：state: UiDataState, data, retry, submitPhase, ...
```

Shell 负责态转换；Block 负责单态 UI。

### 5.2 AdminWorkList 标准模式（升格目标）

| UiDataState | AdminWorkList 表现          |
| ----------- | ------------------------- |
| loading     | Skeleton 列表               |
| error       | error 区 + `#error-action` |
| empty       | Empty（区分 hasFilter）       |
| ready       | default slot              |

待扩展：`partial_error`、`forbidden`、`submitting`、`success_followup` 由 DataTable / 行级组件承接。

### 5.3 registry 声明

```yaml
handlesStates: [loading, error, empty, ready]
stateComponents:
  loading: Skeleton
  error: ErrorStateBlock
  empty: Empty
```

## 6. 反馈位置严重程度

| 严重程度 | 形式     | 位置                               |
| ---- | ------ | -------------------------------- |
| 操作确认 | 内联     | 触发源                              |
| 区域状态 | 区域顶/体  | 所属 Shell Body                    |
| 阻断错误 | Dialog | overlay-host，处理后 restore-trigger |
| 系统通知 | notify | 固定通道，不抢 Body 焦点                  |

## 7. 禁止

* 等待、离线、未知结果 display 为 empty 或 success
* submitting 表现成最终成功
* 无权限显示可误触主动作
* 仅 color/spinner 表达 error 或 partial\_error

## 8. 决策追溯

| 决策                      | 依据                | 表现                          |
| ----------------------- | ----------------- | --------------------------- |
| 10 态枚举包级导出              | 设计技能 completeness | `@ocpui/vue-admin` types    |
| AdminWorkList 为参考 Shell | 已部分实现             | guides/shell-composition.md |
| T0 仅交互态                 | Button 不承担数据空态    | registry interactionStates  |

