# 规格修正日志

## 2026-09-07 — S5–S6 完成

- motion 四元组写入 animation/* 与 overlay 组件 registry
- `--duration-micro/light/heavy`、`--ease-enter/exit` CSS 别名
- `useReducedMotion` / `prefersReducedMotion`
- T2/T3 `duty`、T3 `dispatchRole`、示范 `decisions` CI 门禁
- `ocp list --id C:NAME`、`pnpm registry:enrich-v2`、`pnpm check:scenario`
- 单元测试：ui-data-state、useUiRegionState、双通道反馈、场景契约


- **信号**：用户确认 ui-design-planning 融合默认决策
- **修正**：
  - S1：204 条 registry 分配 `C:*` 语义 ID；`check-registry-contract` 强制 `id` 唯一
  - S2：`UiDataState`、`useUiRegionState`、`AdminWorkList.regionState`
  - S3：`UiScenarioScope.presentationMode`、`useUiScenario`、Shell `dispatchRole`（AdminPage/Modal/Drawer 示范）
  - S4：`useUiFeedback` 增加 `action` / `system` 双通道（扁平 API 保留）
  - S5 部分：`MOTION_TIER` 映射写入 animation-tokens
- **影响 ID**：F:REGISTRY-SPEC、F:STATE-SYSTEM、F:INTERACTION-NET、F:MOTION、C:ADMIN-WORK-LIST、C:BUTTON
