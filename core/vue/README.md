# @ocpui/vue

Vue 3 设计系统与组件库（T0–T2）：原语、区块、主题、反馈、动效与浮层运行时。

规格权威文档：[@ocpui/docs/spec](../../casus/docs/spec/index.md)  
后台 Shell（T2–T3）：[@ocpui/vue-admin](../vue-admin/README.md)  
在线演示：`pnpm playground:dev` → [playground](../../casus/playground/README.md)

---

## 目录

- [包定位](#包定位)
- [安装](#安装)
- [两种用法](#两种用法)
- [快速接入](#快速接入)
- [使用说明](#使用说明)
- [包导出](#包导出)
- [选型与 Registry](#选型与-registry)
- [开发命令](#开发命令)
- [文档索引](#文档索引)

---

## 包定位

| 层级 | 内容 |
|------|------|
| **组件** | Button、Form、Modal、MetricCard、MiniLineChart 等 200+ 条目（T0–T2） |
| **运行时** | `UiRoot` 注入主题、locale、反馈双通道、场景上下文 |
| **系统能力** | 10 态语义、双通道反馈、动效四元组、浮层 Teleport（`@ocpui/vue/system`） |
| **机读契约** | Registry frontmatter（`id`、`duty`、`motion`、`dispatchRole` 等） |

后台列表/工作台 Shell（`AdminPage`、`DataTable` 等）在 **`@ocpui/vue-admin`**，与本包共用容器链与运行时。

---

## 安装

```bash
pnpm add @ocpui/vue @floating-ui/dom vue
# 后台场景一并安装
pnpm add @ocpui/vue-admin
```

peer：`vue ^3.5.0`

Monorepo 内可直接 `workspace:*` 引用。

- **Vite SPA**：`ocpuiVitePlugins`（`@ocpui/vue/vite`）
- **Nuxt SSR**：`modules: ['@ocpui/vue/nuxt']`（推荐；见 [QUICKSTART · Nuxt](./docs/QUICKSTART.md#nuxtssr)）

---

## 两种用法

| 模式 | 适用 | 要点 |
|------|------|------|
| **完整模式** | Admin、工作台、列表页 | `UiRoot` → Shell → `useAdminListRegion` / 双通道反馈 |
| **独立模式** | 嵌入页、文档 demo、局部 UI | 直接 `import { Button } from '@ocpui/vue'`；可选局部包 `UiRoot` |

完整模式使容器链、10 态、动效降级在同一运行时生效；独立模式组件 API 与 Registry 契约不变。

---

## 快速接入

### 1. 样式与入口

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import '@ocpui/vue/styles';       // 基础 token
import '@ocpui/vue/styles/full';  // 完整主题层
import '@ocpui/vue/themes/editorial';

createApp(App).mount('#app');
```

### 2. 根容器（完整模式）

```vue
<!-- App.vue -->
<script setup lang="ts">
import { UiRoot } from '@ocpui/vue';
</script>

<template>
  <UiRoot locale-code="zh" theme-style="editorial" presentation-mode="summary">
    <RouterView />
  </UiRoot>
</template>
```

`UiRoot` 提供：`UI_FEEDBACK_KEY`（action/system 双通道）、`UI_SCENARIO_KEY`（surface/scene/presentationMode）、`data-ui-reduced-motion`。

### 3. Vite 自动导入（推荐）

```ts
// vite.config.ts
import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ocpuiComponents } from '@ocpui/vue/vite';

export default defineConfig({
  plugins: [
    vue(),
    ocpuiComponents({
      root: __dirname,
      overridesDir: path.resolve('src/ui-overrides'), // 可选：ocp add 输出目录
      adminPkgRoot: path.resolve(__dirname, '../vue-admin'), // monorepo
    }),
  ],
  resolve: {
    alias: {
      '@ocpui/vue$': path.resolve(__dirname, '../vue/src/index.ts'),
      '@ocpui/vue/styles': path.resolve(__dirname, '../vue/src/themes/globals.css'),
      '@ocpui/vue/styles/full': path.resolve(__dirname, '../vue/src/themes/styles.css'),
      '@ocpui/vue-admin$': path.resolve(__dirname, '../vue-admin/src/index.ts'),
    },
  },
});
```

扫描优先级：`overridesDir` > `@ocpui/vue-admin` > `@ocpui/vue`。

### 4. 列表页示例（配合 vue-admin）

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { AdminPage, AdminWorkList, useAdminListRegion } from '@ocpui/vue-admin';
import { Button } from '@ocpui/vue';

const { workListProps, data, refresh } = useAdminListRegion({
  fetch: () => api.listItems(),
});

onMounted(refresh);
</script>

<template>
  <AdminPage title="任务列表" presentation-mode="scan">
    <template #toolbar>
      <Button variant="secondary" @click="refresh">刷新</Button>
    </template>
    <AdminWorkList v-bind="workListProps" error-text="加载失败">
      <div v-for="row in data ?? []" :key="row.id" class="awl-row">
        {{ row.name }}
      </div>
    </AdminWorkList>
  </AdminPage>
</template>
```

### 5. 独立模式示例

```vue
<script setup lang="ts">
import { Button, MetricCard, toast } from '@ocpui/vue';
</script>

<template>
  <MetricCard title="吞吐" :value="128" unit="条/日" trend="up" trend-value="+12%" />
  <Button @click="toast.success('已保存')">保存</Button>
</template>
```

无需 `UiRoot` 即可渲染；全局 dialog/notify 需包一层 `UiRoot` 或使用 `toast` fallback。

### 6. 反馈双通道

```ts
import { useUiActionFeedback, useUiSystemFeedback } from '@ocpui/vue/system';

const action = useUiActionFeedback();
const system = useUiSystemFeedback();

await action.dialog.confirm({ title: '删除', content: '确认删除？' });
action.message.success('已删除');

system.loading.overlay.show({ text: '同步中…' });
// ...
system.loading.overlay.hide();
system.notify.success('完成', '数据已同步');
```

用户动作走 **action**（dialog、message）；系统事件走 **system**（notify、loading）。

### 7. 动效

```ts
import { useUiMotion } from '@ocpui/vue/system';

const { resolve, reduced } = useUiMotion();
const preset = resolve('explain_spatial_origin', 'heavy');
// preset.transition → 绑定到 style 或 transition 组件
```

`prefers-reduced-motion` 时自动降级；`UiRoot` 同步添加 `ocpui-root--reduced-motion`。

---

## 使用说明

### 手动导入

```ts
import { Button, Modal, UiRoot } from '@ocpui/vue';
import { DataTable, AdminPage } from '@ocpui/vue-admin';
import DataTableRaw from '@ocpui/vue-admin/data-display/DataTable.vue';
```

### 容器链

```
UiRoot → UiScenarioScope（可选）→ AppShell（应用内 T4）
  → AdminPage（T3）→ AdminWorkList / DataTable → T0–T2 区块
```

| 属性 | 取值 | 层级 |
|------|------|------|
| `themeStyle` | `editorial` / `tech` | L2 主题 |
| `surface` | `list` / `detail` / `form` / `overlay` / `chart` | L3 |
| `scene` | `workbench` / `settings` / `editor` / `audit` | L4 |
| `presentationMode` | `scan` / `summary` / `detail` / `progressive` | 信息密度 |

### 区域状态（10 态）

数据型页面用 `regionState` 替代散落 boolean：

```ts
import { useUiRegionState } from '@ocpui/vue-admin';
// 或列表一键绑定：useAdminListRegion
```

态：`initial` | `loading` | `ready` | `empty` | `error` | `forbidden` | `submitting` | `success` | `partial_error` | …

### 浮层与 Tooltip

- 有 DOM 锚点：`Tooltip` / `Popover`（已 `Teleport` + `--z-tooltip`）
- 图表 crosshair：`FloatingHint` + `useFloatingPosition`（虚拟锚点形态）
- 规范：[layer-stack.md](../../casus/docs/spec/foundation/layer-stack.md) — 禁止在 `overflow: hidden` 容器内 absolute 定位 hover 提示

### 国际化

T0–T3 组件使用 `useUiT()`；keys 见各 locale 与 registry。

### Nuxt 3

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@ocpui/vue/nuxt'],
  ocpui: {
    overridesDir: 'src/ui-overrides',
  },
});
```

---

## 包导出

| 路径 | 内容 |
|------|------|
| `@ocpui/vue` | 组件、主题、反馈、validation |
| `@ocpui/vue/system` | `useUiMotion`、`useUiActionFeedback`、`useUiSystemFeedback`、`shellDispatchAttrs` |
| `@ocpui/vue/styles` / `./styles/full` | CSS 入口 |
| `@ocpui/vue/themes` | 主题 API |
| `@ocpui/vue/vite` | `ocpuiComponents` 插件 |
| `@ocpui/vue/feedback-context` | `useUiFeedback`、`createUiFeedbackBridge` |
| `@ocpui/vue/composables/*` | 独立 composable |
| `@ocpui/vue/data-display/*` | 单组件路径 |
| `@ocpui/vue/registry` | Registry 索引 |
| `@ocpui/vue/docs/SELECTION` | 选型指南 |

---

## 选型与 Registry

```bash
ocp list                    # 列出组件
ocp list --id C:BUTTON      # 按语义 ID 查询
ocp list --tier T3          # 按 Tier 过滤
ocp add Button              # 复制到 overrides 目录
```

选型协议（7 步）：Tier → 容器链 → surface/scene → antiPatterns → status → i18n → 校验。  
详见 [docs/SELECTION.md](./docs/SELECTION.md) 与 [selection-protocol.md](../../casus/docs/spec/guides/selection-protocol.md)。

Registry 字段：`id`（`C:*`）、`duty`、`tier`、`handlesStates`、`motion`、`dispatchRole`、`decisions[]`。

---

## 深度定制（parts + token）

1. **L2 主题**：`registerThemeStyle` + `.theme-{id}` 覆盖 contract 变量（色、半径、`--duration-*`、`--transition-*`）。
2. **Parts**：Menu / ListItem / Tabs 暴露 `data-part`（如 `menu-item`、`list-item`、`tabs-ink`），主题或 T4 用属性选择器换肤，无需改 DOM。
3. **动效**：组件过渡优先 `var(--transition-wash|ink|drawer|…)`；JS 侧 `ANIMATION.TRANSITION` 同步为 CSS 变量字符串。`useSlidingIndicator` 提供同类控件指示条跟随。
4. **结构级覆盖**：`ocp add` → `overridesDir` 整文件优先。
5. **T4**：应用内 `ui-business` 组合 T0–T3；禁止复制 Button 等 T0 样式进业务。

不提供全库 headless；需要无样式逻辑壳时对单组件 `ocp add` 或扩 parts slot。

---

## 开发命令

| 命令 | 说明 |
|------|------|
| `pnpm test:run` | 单元测试 |
| `pnpm check` | 边界 + import + theme + registry + scenario + floating-layer |
| `pnpm acceptance` | 发布前验收 |
| `pnpm registry:build` | 重建 manifest |
| `pnpm registry:assign-ids` | 分配语义 ID |
| `pnpm registry:enrich-v2` | 补全 motion 等 v2 字段 |

---

## 文档索引

| 文档 | 说明 |
|------|------|
| [spec/index.md](../../casus/docs/spec/index.md) | 设计体系入口 |
| [spec/guides/quick-integration.md](../../casus/docs/spec/guides/quick-integration.md) | 快速接入（完整/独立） |
| [spec/guides/shell-composition.md](../../casus/docs/spec/guides/shell-composition.md) | Shell 组合 |
| [spec/guides/component-authoring.md](../../casus/docs/spec/guides/component-authoring.md) | 组件作者规范 |
| [spec/foundation/layer-stack.md](../../casus/docs/spec/foundation/layer-stack.md) | 浮层层级 |
| [playground](../../casus/playground/README.md) | 可运行演示 |
| [docs](../../casus/docs/index.md) | VitePress 组件文档（`pnpm docs:dev`） |

---

## 发布

```bash
pnpm --filter @ocpui/vue build      # vite lib → dist/（ESM + .d.ts + ocpui-vue.css）
pnpm --filter @ocpui/vue pack:dry   # build + 真实 tarball 校验（exports 目标齐全、无 workspace: 残留）
pnpm --filter @ocpui/vue publish --access public
```

发布形态：

| 入口 | workspace 开发（`exports`） | 发布产物（`publishConfig.exports`） |
|------|------------------------------|--------------------------------------|
| `.`、`./types`、`./utility`、`./feedback`、`./themes`、`./validation`、`./system`、`./vite`、`./nuxt` 等 barrel | `src/*.ts` | `dist/*.js` + `dist/*.d.ts` |
| `./styles`、`./styles/full`、`./themes/editorial`、`./themes/tech` | `src/themes/*.css` | 不变（主题 CSS 原样发布） |
| `./styles/components` | — | `dist/ocpui-vue.css`（SFC 样式，使用 dist 入口时需引入一次） |
| `./utility/*`、`./feedback/*`、`./data-display/*` 等通配深路径 | `src/**` | 不变（单 SFC 源码，需消费方 Vite + `@vitejs/plugin-vue` 编译） |

- workspace（playground / docs / vitest）继续经 `ocpuiResolvePlugin` 与 `exports` 走源码，无需先 build。
- `publishConfig.exports` 由 **pnpm** 在 `pack` / `publish` 时替换 `exports`；请用 pnpm 发布，`npm publish` 不认该字段。
- `prepublishOnly` 依次跑 registry 同步、`check`、`acceptance`、`build`。
- 声明生成目前有已知 TS4082 / TS2742 诊断（部分 SFC 的 `Props` 未导出），声明仍会产出；`OCPUI_STRICT_DTS=1 pnpm build` 可将其视为失败。

`@ocpui/vue-admin` 依赖本包 peer，发布形态相同（`dist/ocpui-vue-admin.css`）。
