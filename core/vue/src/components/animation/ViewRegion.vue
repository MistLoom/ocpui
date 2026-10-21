<template>
  <div :class="regionClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /** view：整页；region：局部区域 */
  level?: 'view' | 'region';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  level: 'view',
  customClass: '',
});

const regionClass = computed(() => {
  const base = props.level === 'region' ? 'ocp-admin-region-enter' : 'ocp-admin-view-enter';
  return props.customClass ? [base, props.customClass] : base;
});
</script>

<script lang="ts">
export default { name: 'ViewRegion' };
</script>
