# 快速接入

逐步示例：[QUICKSTART.md](../../../core/vue/docs/QUICKSTART.md)

完整 README：[vue/README.md](../../../core/vue/README.md)

可运行演示：仓库根目录 `pnpm playground:dev`

---

## 两种模式

| 模式   | 入口                                            |
| ---- | --------------------------------------------- |
| 完整模式 | `UiRoot` → `AdminPage` → `useAdminListRegion` |
| 独立模式 | 直接 `import { Button } from '@ocpui/vue'`      |

---

## 最小示例

```vue
<!-- App.vue -->
<script setup lang="ts">
import { UiRoot } from '@ocpui/vue';
</script>

<template>
  <UiRoot locale-code="zh" theme-style="editorial">
    <RouterView />
  </UiRoot>
</template>
```

```ts
// main.ts
import '@ocpui/vue/styles';
import '@ocpui/vue/styles/full';
import '@ocpui/vue/themes/editorial';
```

规格：[quick-integration.md](../spec/guides/quick-integration.md)
