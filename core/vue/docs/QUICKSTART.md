# OCP UI 快速接入

面向消费方的逐步示例。完整说明见 [@ocpui/vue README](../README.md)。

规格：[quick-integration.md](../../../casus/docs/spec/guides/quick-integration.md)

---

## 最小项目结构

```
my-app/
  index.html
  vite.config.ts
  src/
    main.ts
    App.vue
    pages/ListPage.vue
```

---

## main.ts

```ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@ocpui/vue/styles';
import '@ocpui/vue/styles/full';
import '@ocpui/vue/themes/editorial';

createApp(App).use(router).mount('#app');
```

---

## vite.config.ts

```ts
import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ocpuiComponents } from '@ocpui/vue/vite';

const ocpuiVue = path.resolve(__dirname, '../vue');
const ocpuiAdmin = path.resolve(__dirname, '../vue-admin');

export default defineConfig({
  plugins: [
    vue(),
    ocpuiComponents({ root: __dirname, adminPkgRoot: ocpuiAdmin }),
  ],
  resolve: {
    alias: {
      '@ocpui/vue$': path.join(ocpuiVue, 'src/index.ts'),
      '@ocpui/vue/styles': path.join(ocpuiVue, 'src/themes/globals.css'),
      '@ocpui/vue/styles/full': path.join(ocpuiVue, 'src/themes/styles.css'),
      '@ocpui/vue-admin$': path.join(ocpuiAdmin, 'src/index.ts'),
    },
  },
});
```

npm 安装时省略 alias，直接使用包 exports。

---

## App.vue（完整模式）

```vue
<script setup lang="ts">
import { UiRoot } from '@ocpui/vue';
</script>

<template>
  <UiRoot locale-code="zh" theme-style="editorial">
    <RouterView />
  </UiRoot>
</template>
```

---

## 列表页（完整模式）

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { Button } from '@ocpui/vue';
import { AdminPage, AdminWorkList, useAdminListRegion } from '@ocpui/vue-admin';
import { useUiSystemFeedback } from '@ocpui/vue/system';

const system = useUiSystemFeedback();

const region = useAdminListRegion({
  fetch: async () => {
    const res = await fetch('/api/tasks');
    return res.json();
  },
});

async function sync() {
  system.loading.overlay.show({ text: '同步中' });
  try {
    await fetch('/api/sync', { method: 'POST' });
    system.notify.success('完成', '已同步');
    await region.refresh();
  } finally {
    system.loading.overlay.hide();
  }
}

onMounted(region.refresh);
</script>

<template>
  <AdminPage title="任务" presentation-mode="scan">
    <template #toolbar>
      <Button size="sm" @click="region.refresh">刷新</Button>
      <Button size="sm" @click="sync">同步</Button>
    </template>
    <AdminWorkList
      v-bind="region.workListProps"
      error-text="加载失败"
      empty-title="暂无任务"
    >
      <div
        v-for="item in region.data ?? []"
        :key="item.id"
        class="awl-row"
      >
        {{ item.title }}
      </div>
    </AdminWorkList>
  </AdminPage>
</template>
```

---

## 独立模式（无 UiRoot）

```vue
<script setup lang="ts">
import { Button, GaugeChart, toast } from '@ocpui/vue';
</script>

<template>
  <div style="padding: 1rem">
    <GaugeChart :value="72" :min="0" :max="100" unit="%" label="CPU" />
    <Button @click="toast.info('操作成功')">提交</Button>
  </div>
</template>
```

需要 dialog / 全局 notify 时，仅包裹使用区域：

```vue
<UiRoot locale-code="zh">
  <YourPanel />
</UiRoot>
```

---

## Nuxt（SSR）

完整模式推荐只挂模块，勿在 `nuxt.config` 手写 `@ocpui/vue` 绝对路径 / 字符串 alias。

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@ocpui/vue/nuxt'],
  ocpui: {
    css: 'full',              // 'full' | 'base' | false
    overridesDir: 'ui-overrides',
    includeAdmin: false,      // 后台再开 true
    extraDirs: ['ui-business'],
  },
})
```

模块自动：

1. 以**绝对路径**注入 `styles` / `styles/full`（规避 vite-node 解析 package CSS exports 失败）
2. 挂载 `ocpuiResolve` + 组件自动导入
3. Vite alias 仅精确匹配包根与样式（禁止字符串 `@ocpui/vue` 劫持子路径）
4. `build.transpile` 加入 `@ocpui/vue`

消费方主题 CSS（如内置 `editorial` / `tech` 或自定义主题）在应用目录自行 `css` 引入，并 `registerThemeStyle`。

根组件：

```vue
<!-- app.vue -->
<script setup lang="ts">
import { UiRoot } from '@ocpui/vue'
</script>
<template>
  <UiRoot locale-code="zh-CN" theme-style="editorial">
    <NuxtLayout><NuxtPage /></NuxtLayout>
  </UiRoot>
</template>
```

Vite SPA 仍用 `@ocpui/vue/vite` 的 `ocpuiVitePlugins`（与 Nuxt 模块同源）。

---

## 接入检查清单

- [ ] 样式：Nuxt 用模块 `css: 'full'`；Vite 用 `styles` + `styles/full` + 主题 CSS
- [ ] Nuxt：`modules: ['@ocpui/vue/nuxt']`（勿手写包绝对路径 / 字符串 `@ocpui/vue` alias）
- [ ] 完整模式：`UiRoot` 包裹应用根
- [ ] 列表页：`useAdminListRegion` 或 `regionState`，避免 boolean 三分支
- [ ] 反馈：用户动作 `useUiActionFeedback`，系统事件 `useUiSystemFeedback`
- [ ] 图表 hover：使用 `FloatingHint` / `Tooltip`（Teleport），勿 absolute 内嵌
- [ ] 选型：新组件先 `ocp list --id C:XXX` 查 registry

---

## 可运行演示

```bash
# 仓库根目录
pnpm playground:dev
```

路由：`/full/*` 完整模式五场景，`/standalone/*` 独立模式。
