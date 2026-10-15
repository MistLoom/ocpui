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

## 2026-10-16 — 接入体验批次（improve/ux-adoption-batch）

- **信号**：以「想接入的消费方开发者」视角走查仓库，发现规格契约与可发布、可演示、可校验的实现之间存在落差
- **修正**：
  - 发布形态：`@ocpui/vue`、`@ocpui/vue-admin` 增加 vite lib 构建（`dist/` ESM + `.d.ts` + 组件 CSS），`publishConfig.exports` 指向 dist；`pack:dry` 改为对真实 tarball 校验导出目标；workspace 仍走源码
  - 发布形态：`@ocpui/vue-admin` 的 `./registry` 导出指向不存在的 `registry/index.md`，已补齐
  - F:MOTION：补齐 Popconfirm、Popselect、ContextMenu、Message、Notification、LoadingOverlay、ListTransition、AdminWorkList 的 `motion`；`check-registry-contract` 按 §4 强制范围校验，缺失即失败，并校验受控词表；T0 Button/Input 不纳入
  - F:MOTION：AdminWorkList 当前无过渡实现，声明为 `tier: none` + `purpose: explain_state`（§4 允许），避免声明与实现不符
  - 规格路径：`casus/docs/spec` 内 `packages/ocpui/...`、`packages/*/registry/` 等旧路径统一改为 `core/`、`tool/`、`casus/`
  - O:ESSENCE：新增「场景优先级」，明确 admin 为首要场景，C 端内容应用为扩展演示
  - Playground 首页：收敛为一个主入口（`/full/list`），其余入口降为次要或折叠，减少术语
- **已知遗留**：
  - 声明生成仍有 TS4082（部分 SFC `Props` 未导出）与 TS2742（`useSchemaForm` / `useSchemaField` 推断类型）诊断，声明照常产出；`OCPUI_STRICT_DTS=1` 可设为硬失败，待逐个导出 Props 后开启
  - 单 SFC 深路径导出（`./utility/*` 等）发布后仍为源码，需消费方 Vite 编译
- **影响 ID**：F:MOTION、F:REGISTRY-SPEC、O:ESSENCE、C:ADMIN-WORK-LIST、C:LIST-TRANSITION
