# @ocpui/vue-admin

Vue 3 后台 Shell 与区块（T2–T3）：`AdminPage`、`AdminWorkList`、`DataTable` 及列表/工作台组合模式。

依赖 [@ocpui/vue](../vue/README.md) 的主题、反馈与容器链运行时。

---

## 目录

- [安装](#安装)
- [快速接入](#快速接入)
- [核心组件](#核心组件)
- [区域状态](#区域状态)
- [组合模式](#组合模式)
- [Vite 集成](#vite-集成)
- [包导出](#包导出)
- [文档](#文档)

---

## 安装

```bash
pnpm add @ocpui/vue-admin @ocpui/vue @floating-ui/dom vue
```

peer：`@ocpui/vue ^0.1.0`、`vue ^3.5.0`

---

## 快速接入

### 前置：UiRoot + 样式

见 [@ocpui/vue README — 快速接入](../vue/README.md#快速接入)。

### 标准列表页

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { Button } from '@ocpui/vue';
import { AdminPage, AdminWorkList, useAdminListRegion } from '@ocpui/vue-admin';

interface Row { id: string; name: string }

const { workListProps, data, refresh } = useAdminListRegion<Row[]>({
  fetch: async () => (await fetch('/api/items')).json(),
});

onMounted(refresh);
</script>

<template>
  <AdminPage title="条目" subtitle="scan 密度列表" presentation-mode="scan">
    <template #toolbar>
      <Button size="sm" @click="refresh">刷新</Button>
    </template>
    <AdminWorkList
      v-bind="workListProps"
      error-text="加载失败"
      empty-title="暂无数据"
    >
      <div v-for="row in data ?? []" :key="row.id" class="awl-row">
        <span>{{ row.name }}</span>
      </div>
    </AdminWorkList>
  </AdminPage>
</template>
```

### DataTable 页

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { AdminPage, DataTable } from '@ocpui/vue-admin';

const columns = [
  { key: 'name', title: '名称' },
  { key: 'status', title: '状态' },
];
const rows = ref([{ id: '1', name: 'Alpha', status: 'ready' }]);
</script>

<template>
  <AdminPage title="账户">
    <DataTable
      :columns="columns"
      :data="rows"
      row-key="id"
      :selectable="true"
      :pagination="true"
      pagination-mode="client"
    />
  </AdminPage>
</template>
```

### 仪表板 + 业务组合

业务侧可组合 T0 图表组件（参考 playground）：

```vue
<AdminPage title="运营概览" presentation-mode="summary" scene="workbench">
  <DashboardOverviewPanel :metrics="metrics" />
  <OpsHealthGaugeBoard :gauges="gauges" :alerts="alerts" />
</AdminPage>
```

示例实现：`casus/playground/src/business/`。

---

## 核心组件

| 组件 | Tier | 职责 |
|------|------|------|
| `AdminPage` | T3 | 页壳：header / tabs / toolbar / body；`dispatchRole: focus-host` |
| `AdminWorkList` | T3 | 列表体：loading / error / empty / 行 slot；支持 `regionState` |
| `AdminFilterToolbar` | T2 | 筛选工具条 |
| `DataTable` | T3 | 表格：排序、分页、选择 |
| `LayoutSider` | T2 | 侧栏布局 |
| `SizeScope` | T1 | 子树尺寸继承（toolbar 默认 sm） |

`AdminPage` 内置 `UiScenarioScope`，通过 `surface` / `scene` / `presentationMode` 驱动 L3/L4 token。

---

## 区域状态

### useUiRegionState

10 态编排 + `refresh` / `runSubmit`：

```ts
import { useUiRegionState } from '@ocpui/vue-admin';

const { state, data, refresh, runSubmit } = useUiRegionState({
  fetch: () => api.load(),
  mapError: (err) => (err.status === 403 ? 'forbidden' : 'error'),
});
```

### useAdminListRegion（推荐列表页）

在 `useUiRegionState` 之上提供 `workListProps`，一键绑定 `AdminWorkList`：

```ts
import { useAdminListRegion } from '@ocpui/vue-admin/patterns';

const { workListProps, data, refresh } = useAdminListRegion({
  fetch: () => api.list(),
});
```

`AdminWorkList` 仍支持 legacy boolean（`loading` / `isError` / `isEmpty`），新页建议 `regionState`。

---

## 组合模式

| 场景 | presentationMode | 组件组合 |
|------|------------------|----------|
| 扫描列表 | `scan` | AdminPage + AdminWorkList / DataTable |
| 摘要工作台 | `summary` | AdminPage + MetricCard 业务面板 |
| 分步向导 | `progressive` | AdminPage + Steps + Form |
| 抽屉编辑 | overlay（surface） | Drawer + AdminPage 内容 |

Shell 组合规范：[shell-composition.md](../../casus/docs/spec/guides/shell-composition.md)

---

## Vite 集成

与 `@ocpui/vue` 共用 `ocpuiComponents()`，默认扫描本包 `src/components`：

```ts
import { ocpuiComponents } from '@ocpui/vue/vite';

ocpuiComponents({
  root: __dirname,
  adminPkgRoot: path.resolve(__dirname, '../vue-admin'),
  overridesDir: path.resolve('src/ui-overrides'),
});
```

---

## 包导出

| 路径 | 内容 |
|------|------|
| `@ocpui/vue-admin` | Shell / Block 主入口 |
| `@ocpui/vue-admin/patterns` | `useAdminListRegion` |
| `@ocpui/vue-admin/composables/*` | `useUiRegionState` 等 |
| `@ocpui/vue-admin/types/*` | `UiDataState` 等 |
| `@ocpui/vue-admin/layout/*` | 单文件 Shell |
| `@ocpui/vue-admin/data-display/*` | DataTable 等 |
| `@ocpui/vue-admin/registry` | Registry 索引 |

---

## 文档

| 链接 | 说明 |
|------|------|
| [@ocpui/vue README](../vue/README.md) | 设计系统、运行时、浮层 |
| [quick-integration.md](../../casus/docs/spec/guides/quick-integration.md) | 完整/独立模式 |
| [playground](../../casus/playground/README.md) | `pnpm playground:dev`（含列表/Shell 场景） |

---

## 开发

```bash
pnpm --filter @ocpui/vue-admin test:run
pnpm --filter @ocpui/vue-admin check
pnpm --filter @ocpui/vue-admin acceptance
```

Registry 条目位于 `registry/shells/`，由 `@ocpui/vue` 的 `registry:build` 一并生成 manifest。

## 发布

```bash
pnpm --filter @ocpui/vue-admin pack:dry   # build（dist + .d.ts + ocpui-vue-admin.css）+ tarball 校验
pnpm --filter @ocpui/vue-admin publish --access public
```

`.`、`./validation`、`./patterns`、`./vite` 发布后指向 `dist/`；`./layout/*` 等单 SFC 深路径仍为源码（消费方 Vite 编译）。使用 dist 入口时引入一次 `@ocpui/vue-admin/styles/components`。说明详见 [@ocpui/vue「发布」](../vue/README.md#发布)。
