<!--
ThemeSelector 主题风格选择器

功能：以卡片网格形式展示所有可用主题风格，支持选择切换。

属性：
- modelValue: ThemeStyleId - 当前选中的主题 ID
- options: ThemeInfo[] - 可选主题列表
- disabled?: boolean - 是否禁用整个选择器
- columns?: number - 网格列数，默认 2

事件：
- update:modelValue: [value: ThemeStyleId] - 选中值更新事件
- change: [value: ThemeStyleId] - 选中变化事件

使用方式：
  <ThemeSelector
    v-model="currentThemeStyle"
    :options="availableThemes"
    :columns="2"
  />
-->

<template>
  <div
    class="theme-selector"
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    :style="gridStyle"
  >
    <ThemePreviewCard
      v-for="theme in options"
      :key="theme.id"
      :theme="theme"
      :selected="modelValue === theme.id"
      :disabled="disabled"
      @select="handleSelect(theme.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ThemePreviewCard from './ThemePreviewCard.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import type { ThemeInfo, ThemeStyleId } from '@ocpui/vue/themes';

interface Props {
  modelValue?: ThemeStyleId;
  options: ThemeInfo[];
  disabled?: boolean;
  columns?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  disabled: false,
  columns: 2,
});

const emit = defineEmits<{
  'update:modelValue': [value: ThemeStyleId];
  'change': [value: ThemeStyleId];
}>();

const { uiT: t } = useUiT();

const ariaLabel = computed(() => t('theme.styleSelectorLabel'));

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`,
}));

const handleSelect = (value: ThemeStyleId) => {
  if (props.disabled || props.modelValue === value) return;
  emit('update:modelValue', value);
  emit('change', value);
};
</script>

<style scoped>
.theme-selector {
  display: grid;
  gap: 16px;
}

@media (max-width: 575.98px) {
  .theme-selector {
    grid-template-columns: 1fr !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-selector {
    transition: none;
  }
}
</style>
