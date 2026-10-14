---
id: G:QUICK-INTEG
doc_type: guide
parent: O:ROOT
related:
  - G:SHELL
  - F:CONTAINER-CHAIN
  - F:STATE-SYSTEM
  - F:INTERACTION-NET
  - F:MOTION
design_intent: "业务项目快速接入 OCP 设计系统运行时"
scope: "完整模式 vs 独立模式、最小接入步骤"
status: stable
---

# 快速接入

## 两种用法

| 模式 | 适用 | 入口 |
|------|------|------|
| **完整模式** | admin 等业务壳、列表/工作台页 | `UiRoot` → `AdminPage` → 系统 composable |
| **独立模式** | 嵌入页、Story、局部 UI | 单组件 + 可选 `@ocpui/vue/system` |

完整模式让容器链、10 态、双通道、动效降级在同一套运行时生效；独立模式不强制 Shell，但组件 API 与 registry 契约不变。

## 完整模式（推荐）

### 1. 根容器

```vue
<!-- App.vue -->
<UiRoot locale-code="zh" presentation-mode="summary">
  <RouterView />
</UiRoot>
```

`UiRoot` 注入：主题、locale、反馈双通道、`UI_SCENARIO_KEY`（surface/scene/presentationMode）、`data-ui-reduced-motion`。

### 2. 列表页 Shell

```vue
<AdminPage title="..." presentation-mode="scan">
  <template #toolbar>...</template>
  <AdminWorkList v-bind="workListProps" :error-text="t('...')">
    <!-- 行内容 -->
  </AdminWorkList>
</AdminPage>
```

`AdminPage` / `AdminWorkList` 携带 `data-ui-dispatch-role`（focus-host / content-host），与 [容器链](../foundation/container-chain.md) 对齐。

### 3. 区域状态（替代 loading/isError/isEmpty 分支）

```ts
import { useAdminListRegion } from '@ocpui/vue-admin';

const { workListProps, data, refresh, runSubmit } = useAdminListRegion({
  fetch: () => api.listItems(),
});
onMounted(refresh);
```

底层为 `useUiRegionState`（10 态）；`workListProps` 一键绑定 `AdminWorkList.regionState`。

### 4. 反馈双通道

```ts
import { useFeedback } from '@/logic/foundation-registry/framework/feedback';

const { action, system } = useFeedback();

// 用户动作
await action.dialog.confirm({ title: '...' });
action.message.success('已保存');

// 系统事件
system.loading.show();
system.notify.push({ title: '同步完成', type: 'success' });
```

或直接：

```ts
import { useUiActionFeedback, useUiSystemFeedback } from '@ocpui/vue/system';
```

### 5. 动效

```ts
import { useUiMotion } from '@ocpui/vue/system';

const { resolve, reduced } = useUiMotion();
const modalMotion = resolve('explain_spatial_origin', 'heavy');
// modalMotion.transition → 绑定 style 或 transition 组件
```

`prefers-reduced-motion` 与 `UiRoot` 的 `ocpui-root--reduced-motion` 同步降级。

## 独立模式

```vue
<script setup>
import { Button, Modal } from '@ocpui/vue';
import { useUiMotion } from '@ocpui/vue/system';
</script>

<template>
  <Button>保存</Button>
</template>
```

- 无需 `UiRoot` 即可渲染 T0 组件；toast/dialog 走组件内 fallback。
- 需要全局反馈时再包一层 `UiRoot`。

## 包导出

| 路径 | 内容 |
|------|------|
| `@ocpui/vue` | 组件 + `useUiFeedback` + `useUiScenario` |
| `@ocpui/vue/system` | `useUiMotion`、`useUiActionFeedback`、`useUiSystemFeedback`、`shellDispatchAttrs` |
| `@ocpui/vue-admin` | Shell/Block + `useUiRegionState` |
| `@ocpui/vue-admin/patterns` | `useAdminListRegion` 等组合模式 |

## 接入检查

1. 业务页是否仍散落 `loading`/`isError`/`isEmpty` boolean？→ 改用 `useAdminListRegion` 或 `regionState`
2. 反馈是否混用 action/system？→ `useFeedback().action` / `.system`
3. overlay 动效是否硬编码 duration？→ `useUiMotion().resolve(purpose, tier)`
4. Shell 是否声明 `dispatchRole`？→ `AdminPage` / `AdminWorkList` 已内置；自定义容器用 `shellDispatchAttrs`

## 参考实现

- 列表页示范：`casus/playground` 中 Admin 场景路由
- Shell 组合：[shell-composition.md](./shell-composition.md)
- 规格入口：[index.md](../index.md)
