---
id: G:SELECTION
doc_type: guide
parent: O:ROOT
related:
  - F:REGISTRY-SPEC
  - F:CONTAINER-CHAIN
  - F:PHILOSOPHY
design_intent: "让 AI 与开发者在选用组件前完成职责判断，避免模板堆叠"
scope: "扩展版 8 步选型协议"
status: stable
---

# 选型协议

## 0. 职责锚定（新增，MUST 最先）

1. 用动词短语写清：**此区域要帮用户完成什么判断/动作**
2. 写清 **不承担** 什么（防止用 DataTable 做看板、用 Modal 做页面）
3. 若职责超出 T0–T3，停止下钻，改 T4 ui-business

## 1. 定 Tier

T0 原语 → T1 结构 → T2 区块 → T3 Shell。查 [tier-and-carrier](../foundation/tier-and-carrier.md)。

## 2. 容器链

`UiRoot` → `UiScenarioScope?` → `AppShell` → `Shell T3` → Block/Part/Primitive。

查 [container-chain](../foundation/container-chain.md) 决策表。

## 3. surface / scene / presentationMode

- surface：list | detail | form | overlay | chart
- scene：workbench | settings | editor | audit
- presentationMode：scan | summary | detail | progressive

## 4. 读 registry

```bash
ocp list --tier T3
ocp list --id C:ADMIN-WORK-LIST
```

必读：`duty`, `antiPatterns`, `handlesStates`, `feedbackChannel`, `motion`（如适用）。

## 5. 状态覆盖检查

数据型区域 MUST 覆盖 [state-system](../foundation/state-system.md) 10 态子集或委托 Shell。缺态则不得合并为「loading/error 二分支」。

## 6. 读 status

`stable` 优先；`deprecated` 查 `replaces`；`draft` 仅实验。

## 7. i18n

T0–T3：`useUiT` + registry `localeKeys`  
T4：`useI18n` 业务域

## 8. 校验

`@ocpui/vue/validation` 或 `@ocpui/vue-admin` schema；T4 业务 schema。

---

## 快速决策表（继承 guide/selection）

| 场景 | 容器 | 主内容 | ID 参考 |
|------|------|--------|---------|
| 列表 CRUD | AdminPage + list | DataTable / AdminWorkList | K:ADMIN-LIST-PAGE |
| 详情只读 | detail surface | Descriptions | — |
| 表单 | editor + form | Form + FormItem | — |
| 弹窗确认 | overlay | Modal / Dialog | — |
| 审计 | audit scene | Timeline / plain DataTable | — |

## 本地覆盖

```bash
ocp add Button
ocp diff Button
```

override 不改变 `C:BUTTON` ID；选型仍以 registry 为准。

## 反馈选用

| 需求 | 通道 | API |
|------|------|-----|
| 用户确认删除 | action | `dialog.confirm` |
| 字段校验 | action | 内联 + FormItem |
| 后台同步 | system | `notify` |
| 全页加载 | system | `loading` + Shell skeleton |

## 选型反查（决策追溯）

选用完成后，须能填写：

```
选用 C:DATA-TABLE 因为：用户须在 workbench 扫描大量行并批量操作
不选用 C:TABLE 因为：antiPattern 列表页裸 Table
状态由 C:ADMIN-WORK-LIST 编排因为：handlesStates 覆盖 loading/empty/error
```
