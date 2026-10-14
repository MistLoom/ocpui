---
title: Button
description: 可点击动作载体
order: 1
tags: [T0, primitives]
---

# Button

Registry：`C:BUTTON` · `@ocpui/vue`

## 基础用法

::: demo
```vue
<script setup lang="ts">
import { Button } from '@ocpui/vue';
</script>

<template>
  <div class="preview-row">
    <Button type="primary">主要按钮</Button>
    <Button>默认按钮</Button>
    <Button type="text">文字按钮</Button>
    <Button disabled>禁用</Button>
  </div>
</template>
```
:::

## 状态

| 状态 | 说明 |
| --- | --- |
| default / hover / focus / active | 常规交互 |
| disabled | 不可操作 |
| loading | 等待中，阻止重复提交 |

## 反模式

- 原生 `<button>` 替代 T0 Button

## 参考

- Registry：`packages/ocpui/core/vue/registry/primitives/button.md`
- 规格：[component-authoring](../../spec/guides/component-authoring.md)
