# OCP 选型指南

完整接入与使用说明：[README.md](../README.md) · [QUICKSTART.md](./QUICKSTART.md)

设计体系规格：[spec/index.md](../../../casus/docs/spec/index.md)

---

## 协议（7 步）

1. **定 Tier** — T0 原语 → T3 Shell（T4 在应用内组合）
2. **容器链** — `UiRoot` → `UiScenarioScope` → `AppShell` → `AdminPage`
3. **surface / scene / presentationMode** — L3/L4 与信息密度
4. **读 antiPatterns** — registry 条目
5. **读 status** — stable / deprecated
6. **i18n** — T0–T3 用 `useUiT`；T4 用应用层 i18n
7. **校验** — `@ocpui/vue/validation` 或业务 schema

---

## 容器决策表

| 场景 | 容器 | 主内容 | 禁止 |
|------|------|--------|------|
| 列表 CRUD | `AdminPage` + `surface=list` | `DataTable` / `AdminWorkList` | Card 包表格；页根 padding |
| 详情只读 | `surface=detail` | `Descriptions` / `Card` | 自建 header 块 |
| 表单录入 | `scene=editor` + `surface=form` | `Form` + `FormItem` | 页内自建校验 |
| 弹窗确认 | `surface=overlay` | `Modal` / `Dialog` | 绕过 UiRoot 挂 Message |
| 审计日志 | `scene=audit` | `Timeline` / `DataTable` | 高饱和装饰 token |
| 仪表/图表 | `surface=chart` | `MetricCard` + `MiniLineChart` | 容器内 absolute tooltip |

---

## Registry 查阅

```bash
ocp list
ocp list --id C:ADMIN-PAGE
ocp list --tier T3
```

索引：`registry/index.md`（`pnpm registry:build` 生成 manifest）

---

## 本地覆盖与 parts

```bash
ocp add Button      # 复制到 overrides 目录
ocp diff Button     # 对比 npm 版本
```

Vite 插件扫描优先级：`overridesDir` > `@ocpui/vue-admin` > `@ocpui/vue`。

主题换肤优先用 `data-part`（Menu / ListItem / Tabs）+ CSS 变量；结构变更再用 `ocp add`。
滑动指示跟随：`useSlidingIndicator`（导航 / Tabs ink）。

---

## 反馈与运行时

```ts
import { useUiFeedback } from '@ocpui/vue';
import { useUiActionFeedback, useUiSystemFeedback } from '@ocpui/vue/system';
```

- **action**：dialog、message（用户动作）
- **system**：notify、loading（系统事件）

须在有 `UiRoot` 的子树内使用；独立模式可用 `toast` fallback。

---

## 相关文档

| 文档 | 说明 |
|------|------|
| [selection-protocol.md](../../../casus/docs/spec/guides/selection-protocol.md) | 完整选型协议 |
| [shell-composition.md](../../../casus/docs/spec/guides/shell-composition.md) | Shell 组合 |
| [layer-stack.md](../../../casus/docs/spec/foundation/layer-stack.md) | 浮层层级 |
