<template>
  <slot />
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { SIZE_CONTEXT_KEY } from '@ocpui/vue/types';

/**
 * 向子树注入尺寸上下文（如 AdminPage toolbar 默认 sm）。
 */
interface Props {
  size?: ComponentSize;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
});

provide(
  SIZE_CONTEXT_KEY,
  computed(() => ({ size: props.size })),
);
</script>
