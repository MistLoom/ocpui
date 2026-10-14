<!--
DescriptionsItem 描述项子组件

功能：作为 Descriptions 的子组件使用，定义单个描述项的标签和内容

公开属性：
- label: string - 描述项标签
- span: number - 跨列数，默认值：1
-->
<template>
  <div class="descriptions-item-slot" :style="itemStyle">
    <div class="descriptions-label">
      <span>{{ label }}</span>
      <span v-if="colon" class="descriptions-colon">:</span>
    </div>
    <div class="descriptions-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label?: string;
  span?: number;
  colon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  span: 1,
  colon: true,
});

const itemStyle = computed(() => {
  if (props.span && props.span > 1) {
    return { gridColumn: `span ${props.span}` };
  }
  return {};
});
</script>

<style scoped>
.descriptions-item-slot {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.descriptions-label {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

.descriptions-colon {
  margin-left: 2px;
}

.descriptions-content {
  font-size: 14px;
  color: hsl(var(--text));
}
</style>
