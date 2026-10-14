<!--
复选框组件

用于选择或取消选择，支持布尔值与数组多选、半选状态。
尺寸走 useComponentSize（显式 size → FormItem → Form → SizeScope → md）。
-->

<template>
  <label :class="checkboxClass">
    <span :class="inputClass">
      <input
        ref="inputRef"
        type="checkbox"
        :checked="checked"
        :value="label"
        :disabled="disabled"
        :aria-checked="indeterminate ? 'mixed' : checked"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <span class="checkbox-inner" aria-hidden="true">
        <svg v-if="indeterminate" viewBox="0 0 12 12" class="checkbox-indeterminate-icon">
          <rect x="2" y="5" width="8" height="2" rx="1" fill="currentColor"/>
        </svg>
        <svg v-else-if="checked" viewBox="0 0 12 12" class="checkbox-check-icon">
          <path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </span>
    <span v-if="$slots.default || label" class="checkbox-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, toRef } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { useComponentSize } from '../composables/useComponentSize';

interface Props {
  modelValue?: boolean | (string | number)[];
  label?: string | number;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: ComponentSize;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  disabled: false,
  indeterminate: false,
  size: undefined,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [boolean | (string | number)[]];
  'change': [boolean | (string | number)[]];
  'focus': [];
  'blur': [];
}>();

const inputRef = ref<HTMLInputElement>();
const isFocused = ref(false);
const resolvedSize = useComponentSize(toRef(props, 'size'));

const isGroup = computed(() => Array.isArray(props.modelValue));

const checked = computed(() => {
  if (isGroup.value) {
    return (props.modelValue as (string | number)[]).includes(props.label as string | number);
  }
  return Boolean(props.modelValue);
});

const checkboxClass = computed(() => {
  const classes = ['checkbox', `checkbox--${resolvedSize.value}`];
  if (props.disabled) classes.push('checkbox--disabled');
  if (checked.value) classes.push('checkbox--checked');
  if (props.indeterminate) classes.push('checkbox--indeterminate');
  if (isFocused.value) classes.push('checkbox--focused');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const inputClass = computed(() => {
  const classes = ['checkbox-input'];
  if (checked.value) classes.push('checkbox-input--checked');
  if (props.indeterminate) classes.push('checkbox-input--indeterminate');
  return classes;
});

const emitValue = (nextChecked: boolean) => {
  if (isGroup.value) {
    const arr = [...(props.modelValue as (string | number)[])];
    const index = arr.indexOf(props.label as string | number);
    if (nextChecked && index === -1) arr.push(props.label as string | number);
    else if (!nextChecked && index > -1) arr.splice(index, 1);
    emit('update:modelValue', arr);
    emit('change', arr);
    return;
  }
  emit('update:modelValue', nextChecked);
  emit('change', nextChecked);
};

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emitValue(target.checked);
};

const handleFocus = () => {
  isFocused.value = true;
  emit('focus');
};

const handleBlur = () => {
  isFocused.value = false;
  emit('blur');
};

const updateIndeterminate = () => {
  if (inputRef.value) {
    inputRef.value.indeterminate = props.indeterminate;
  }
};

watch(() => props.indeterminate, updateIndeterminate);
onMounted(updateIndeterminate);
</script>

<style scoped>
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  min-height: var(--checkbox-hit);
}

.checkbox--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-input {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--checkbox-box);
  height: var(--checkbox-box);
}

.checkbox-input input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: inherit;
}

.checkbox-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: hsl(var(--surface));
  border: 1.5px solid hsl(var(--border));
  border-radius: 4px;
  color: hsl(var(--primary-foreground));
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1),
              border-color 0.2s cubic-bezier(0.2, 0, 0, 1),
              box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.checkbox:hover:not(.checkbox--disabled) .checkbox-inner {
  border-color: hsl(var(--border-hover));
}

.checkbox--focused .checkbox-inner {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
}

.checkbox-input--checked .checkbox-inner,
.checkbox-input--indeterminate .checkbox-inner {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.checkbox-check-icon,
.checkbox-indeterminate-icon {
  width: 75%;
  height: 75%;
  transform: scale(0);
  transition: transform 0.15s cubic-bezier(0.2, 0, 0, 1);
}

.checkbox-input--checked .checkbox-check-icon,
.checkbox-input--indeterminate .checkbox-indeterminate-icon {
  transform: scale(1);
}

.checkbox-label {
  font-size: var(--checkbox-font);
  color: hsl(var(--text));
  line-height: 1.4;
}

.checkbox--disabled .checkbox-label {
  color: hsl(var(--text-muted));
}

.checkbox--sm {
  --checkbox-box: 14px;
  --checkbox-hit: 32px;
  --checkbox-font: 13px;
}

.checkbox--md {
  --checkbox-box: 16px;
  --checkbox-hit: 36px;
  --checkbox-font: 14px;
}

.checkbox--lg {
  --checkbox-box: 18px;
  --checkbox-hit: 40px;
  --checkbox-font: 15px;
}

@media (hover: none) and (pointer: coarse) {
  .checkbox {
    min-height: 40px;
  }
}
</style>
