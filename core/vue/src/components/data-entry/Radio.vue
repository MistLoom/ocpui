<!--
Radio 单选按钮
尺寸走 useComponentSize；控件盒与主题色对齐 Checkbox。
-->

<template>
  <label :class="radioClass" :aria-disabled="disabled">
    <span class="radio-input-wrapper">
      <input
        type="radio"
        class="radio-input"
        :checked="isChecked"
        :disabled="disabled"
        :name="name"
        :value="value"
        :aria-checked="isChecked"
        @change="handleChange"
        @click.stop
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <span class="radio-inner" aria-hidden="true">
        <span class="radio-dot" />
      </span>
    </span>
    <span v-if="$slots.default || label" class="radio-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { useComponentSize } from '../composables/useComponentSize';

interface Props {
  modelValue?: string | number | boolean | null;
  value?: string | number | boolean;
  label?: string;
  disabled?: boolean;
  name?: string;
  size?: ComponentSize;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  value: undefined,
  label: '',
  disabled: false,
  name: '',
  size: undefined,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [string | number | boolean];
  'change': [string | number | boolean];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
}>();

const resolvedSize = useComponentSize(toRef(props, 'size'));

const isChecked = computed(() => props.modelValue === props.value);

const radioClass = computed(() => {
  const classes = ['radio', `radio--${resolvedSize.value}`];
  if (props.disabled) classes.push('radio--disabled');
  if (isChecked.value) classes.push('radio--checked');
  if (props.customClass) classes.push(props.customClass);
  return classes.join(' ');
});

const handleChange = () => {
  if (props.disabled) return;
  emit('update:modelValue', props.value as string | number | boolean);
  emit('change', props.value as string | number | boolean);
};

const handleFocus = (event: FocusEvent) => emit('focus', event);
const handleBlur = (event: FocusEvent) => emit('blur', event);

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  if (event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault();
    handleChange();
  }
};
</script>

<style scoped>
.radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  min-height: var(--radio-hit);
}

.radio-input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--radio-box);
  height: var(--radio-box);
  flex-shrink: 0;
}

.radio-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: inherit;
}

.radio-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 1.5px solid hsl(var(--border));
  border-radius: 50%;
  background: hsl(var(--surface));
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1),
              border-color 0.2s cubic-bezier(0.2, 0, 0, 1),
              box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.radio-dot {
  width: 50%;
  height: 50%;
  border-radius: 50%;
  background: hsl(var(--primary-foreground));
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.15s cubic-bezier(0.2, 0, 0, 1),
              transform 0.15s cubic-bezier(0.2, 0, 0, 1);
}

.radio-label {
  font-size: var(--radio-font);
  color: hsl(var(--text));
  line-height: 1.4;
}

.radio:hover:not(.radio--disabled) .radio-inner {
  border-color: hsl(var(--primary));
}

.radio--checked .radio-inner {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary));
}

.radio--checked .radio-dot {
  opacity: 1;
  transform: scale(1);
}

.radio-input:focus-visible + .radio-inner {
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
}

.radio--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.radio--sm {
  --radio-box: 14px;
  --radio-hit: 32px;
  --radio-font: 13px;
}

.radio--md {
  --radio-box: 16px;
  --radio-hit: 36px;
  --radio-font: 14px;
}

.radio--lg {
  --radio-box: 18px;
  --radio-hit: 40px;
  --radio-font: 15px;
}

@media (hover: none) and (pointer: coarse) {
  .radio {
    min-height: 40px;
  }
}
</style>
