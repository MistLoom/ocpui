<!--
复选框组：组合 Checkbox，不复制勾选框样式。
-->

<template>
  <div :class="groupClass" role="group" :aria-label="ariaLabel">
    <Checkbox
      v-for="option in normalizedOptions"
      :key="option.value"
      :model-value="modelValue"
      :label="option.value"
      :disabled="option.disabled || disabled"
      :size="resolvedSize"
      @update:model-value="handleUpdate"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      {{ option.label }}
    </Checkbox>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { useComponentSize } from '../composables/useComponentSize';
import Checkbox from './Checkbox.vue';

export interface CheckboxOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface Props {
  modelValue: (string | number)[];
  options: CheckboxOption[];
  size?: ComponentSize;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  ariaLabel?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: undefined,
  direction: 'horizontal',
  disabled: false,
  ariaLabel: '复选框组',
  customClass: '',
  options: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [(string | number)[]];
  change: [(string | number)[]];
  focus: [];
  blur: [];
}>();

const resolvedSize = useComponentSize(toRef(props, 'size'));

const normalizedOptions = computed(() =>
  props.options.map((opt) => ({
    ...opt,
    disabled: opt.disabled || false,
  })),
);

const groupClass = computed(() => {
  const classes = ['checkbox-group', `checkbox-group--${props.direction}`];
  if (props.disabled) classes.push('checkbox-group--disabled');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const handleUpdate = (value: boolean | (string | number)[]) => {
  if (!Array.isArray(value)) return;
  emit('update:modelValue', value);
};

const handleChange = (value: boolean | (string | number)[]) => {
  if (!Array.isArray(value)) return;
  emit('change', value);
};

const handleFocus = () => emit('focus');
const handleBlur = () => emit('blur');
</script>

<style scoped>
.checkbox-group {
  display: flex;
  gap: 12px 16px;
}

.checkbox-group--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

.checkbox-group--vertical {
  flex-direction: column;
  align-items: flex-start;
}

.checkbox-group--disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
