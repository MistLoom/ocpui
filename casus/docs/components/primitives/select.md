---
title: Select
description: 下拉选择
order: 3
tags: [T0, primitives]
---

# Select

Registry：`C:SELECT` · `@ocpui/vue`

## 基础用法

::: demo
```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Select } from '@ocpui/vue';

const value = ref('editorial');
const options = [
  { label: 'Editorial', value: 'editorial' },
  { label: 'Compact', value: 'compact' },
  { label: 'Chart', value: 'chart' },
];
</script>

<template>
  <div class="preview-col" style="max-width: 16rem">
    <Select v-model="value" :options="options" placeholder="选择主题" />
  </div>
</template>
```
:::

## 参考

- Registry：`packages/ocpui/core/vue/registry/primitives/select.md`
