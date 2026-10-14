<!--
筛选工具组：离散选项芯片，放在 AdminPage #toolbar。
单选默认可清空；多选走 checkbox 语义。尺寸继承 SizeScope。
-->
<template>
  <div
    :class="rootClass"
    role="group"
    :aria-label="label || t('components.dataEntry.filterTagGroup.fallbackAriaLabel')"
  >
    <span v-if="label" class="ocp-filter-row__label">{{ label }}</span>
    <div v-if="options.length === 0" class="filter-tag-empty">
      <slot name="empty">
        <Icon name="circle-alert" :size="20" color="muted" />
        <p>{{ t('components.dataEntry.filterTagGroup.empty') }}</p>
      </slot>
    </div>
    <div
      v-else
      class="ocp-filter-row__controls filter-tag-options"
      :role="multiple ? 'group' : 'radiogroup'"
    >
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        class="filter-tag-option"
        :class="{
          'filter-tag-option--active': isSelected(option.value),
          'filter-tag-option--disabled': option.disabled || disabled
        }"
        :disabled="option.disabled || disabled"
        :role="multiple ? 'checkbox' : 'radio'"
        :aria-checked="isSelected(option.value)"
        :aria-label="option.label"
        @click="handleSelect(option)"
      >
        <Icon v-if="option.icon" :name="option.icon" :size="14" class="filter-tag-option-icon" />
        <span class="filter-tag-option-label">{{ option.label }}</span>
        <span v-if="option.count != null" class="filter-tag-option-count">{{ option.count }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import Icon from '../utility/Icon.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useComponentSize } from '../composables/useComponentSize';
import type { ComponentSize } from '@ocpui/vue/types';

export interface FilterOption {
  label: string;
  value: string | number;
  icon?: string;
  disabled?: boolean;
  count?: number;
}

export type FilterTagGroupValue = string | number | (string | number)[] | undefined;

interface Props {
  modelValue?: FilterTagGroupValue;
  options: FilterOption[];
  label?: string;
  multiple?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  allowEmpty?: boolean;
  size?: ComponentSize;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  multiple: false,
  disabled: false,
  vertical: false,
  allowEmpty: true,
  size: undefined,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [FilterTagGroupValue];
  'change': [FilterTagGroupValue];
}>();

const { uiT: t } = useUiT();
const resolvedSize = useComponentSize(toRef(props, 'size'));

const rootClass = computed(() => {
  const classes = [
    'ocp-filter-row',
    'filter-tag-group',
    `ocp-filter-row--${resolvedSize.value}`,
    `filter-tag-group--${resolvedSize.value}`,
  ];
  if (props.label) classes.push('ocp-filter-row--labeled');
  if (props.vertical) classes.push('ocp-filter-row--vertical');
  if (props.disabled) classes.push('filter-tag-group--disabled');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const isSelected = (value: string | number): boolean => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(value);
  }
  return props.modelValue === value;
};

const handleSelect = (option: FilterOption) => {
  if (option.disabled || props.disabled) return;

  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = currentValue.indexOf(option.value);

    if (index > -1) {
      if (props.allowEmpty || currentValue.length > 1) {
        currentValue.splice(index, 1);
      }
    } else {
      currentValue.push(option.value);
    }

    emit('update:modelValue', currentValue);
    emit('change', currentValue);
    return;
  }

  const newValue = props.modelValue === option.value && props.allowEmpty
    ? undefined
    : option.value;
  emit('update:modelValue', newValue);
  emit('change', newValue);
};
</script>

<style scoped>
.filter-tag-group {
  /* 布局见 themes/filter-row.css；组件不含对外 margin / padding */
}

.filter-tag-group--vertical {
  /* 继承 ocp-filter-row--vertical */
}

.filter-tag-group--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.filter-tag-options {
  /* 控件区：继承 ocp-filter-row__controls */
}

.filter-tag-option {
  display: inline-flex;
  align-items: center;
  gap: var(--pill-gap);
  height: var(--pill-height-md);
  padding: 0 var(--pill-pad-x-md);
  font-size: var(--pill-font-md);
  font-weight: 500;
  color: hsl(var(--text-secondary));
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--pill-radius);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1),
              background-color 0.2s cubic-bezier(0.2, 0, 0, 1),
              border-color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.filter-tag-option:hover:not(:disabled) {
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.filter-tag-option--active {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.4);
  color: hsl(var(--primary));
}

.filter-tag-option--active:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.15);
}

.filter-tag-option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-tag-option:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
}

.filter-tag-option-icon {
  flex-shrink: 0;
}

.filter-tag-option-count {
  min-width: 16px;
  padding: 0 4px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  line-height: 16px;
  border-radius: 8px;
  background: hsl(var(--surface-container-high));
  color: inherit;
}

.filter-tag-option--active .filter-tag-option-count {
  background: hsl(var(--primary) / 0.15);
}

.filter-tag-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: hsl(var(--text-muted));
  font-size: 13px;
}

.filter-tag-empty p {
  margin: 0;
}

.filter-tag-group--sm .filter-tag-option {
  height: var(--pill-height-sm);
  padding: 0 var(--pill-pad-x-sm);
  font-size: var(--pill-font-sm);
}

.filter-tag-group--md .filter-tag-option {
  height: var(--pill-height-md);
  padding: 0 var(--pill-pad-x-md);
  font-size: var(--pill-font-md);
}

.filter-tag-group--lg .filter-tag-option {
  height: var(--pill-height-lg);
  padding: 0 var(--pill-pad-x-lg);
  font-size: var(--pill-font-lg);
}
</style>
