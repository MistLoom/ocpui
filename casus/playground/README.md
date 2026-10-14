# OCP Playground

临时演示项目：对比 **完整模式** 与 **独立模式** 两种组件库用法。

## 启动

```bash
pnpm install
pnpm playground:dev
```

浏览器默认打开 http://localhost:5175

## 场景

### 完整模式 — 运营指挥台（推荐）

`/full/command-center` — 对标 SRE/可观测性事件响应平台（Datadog Incident 简化形态）

| 能力 | 设计模式体现 |
|------|----------------|
| 三 Tab Shell | AdminPage `#tabs` + 概览 / 事件 / 容量 |
| 指标 + 趋势 + 流量 + 热力 | MetricCard、TrendChart、NetworkTrafficChart、HeatmapChart |
| 事件队列 | `useAdminListRegion` + DataTable 可选中 + SelectionToolbar 批量确认 |
| 筛选联动 | AdminFilterToolbar + ActiveFilterTags；热力图 cell → 服务筛选 |
| 处置 Drawer | progressive 分步 Steps + action 通道 confirm |
| Live 流 | 5s  tick + **system** notify / loading bar |
| 命令搜索 | GlobalSearch → Tab 跳转 / 动作触发 |
| 侧栏 | Gauge + Alert + Timeline + AbnormalList |

### 完整模式 — 原子场景（`/full/*`）

| 路由 | 说明 |
|------|------|
| `/full/list` | `useAdminListRegion` + `AdminWorkList.regionState` |
| `/full/dashboard` | 业务组件 `DashboardOverviewPanel` / `OpsHealthGaugeBoard` |
| `/full/table` | `DataTable` 可选中 + 分页 |
| `/full/progressive` | `presentationMode=progressive` + `Steps` |
| `/full/interaction` | `InteractiveBatchAuditPanel`（GlobalSearch + SelectionToolbar + 双通道） |

### 独立模式（`/standalone/*`）

| 路由 | 说明 |
|------|------|
| `/standalone/gallery` | 无 UiRoot，直接 import T0 组件 |
| `/standalone/embedded` | 局部嵌入 vs mini UiRoot 对比 |

## 业务组件

位于 `src/business/`，基于设计模式组合 T0/T3 组件：

- `DashboardOverviewPanel` — MetricCard + TrendIndicator + `useUiMotion`
- `OpsHealthGaugeBoard` — GaugeChart + ProgressRing + AlertItem
- `InteractiveBatchAuditPanel` — DataTable + GlobalSearch + SelectionToolbar + `useUiActionFeedback`

规范参考：[quick-integration.md](../docs/spec/guides/quick-integration.md)
