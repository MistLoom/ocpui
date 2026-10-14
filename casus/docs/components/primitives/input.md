---
title: Input
description: 单行文本输入
order: 2
tags: [T0, primitives]
---

# Input

Registry：`C:INPUT` · `@ocpui/vue`

## 基础用法

::: demo
```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@ocpui/vue';

const value = ref('OCP UI');
</script>

<template>
  <div class="preview-col" style="max-width: 20rem">
    <Input v-model="value" placeholder="请输入" />
    <Input disabled placeholder="禁用" />
  </div>
</template>
```
:::

## 参考

- Registry：`packages/ocpui/core/vue/registry/primitives/input.md`
