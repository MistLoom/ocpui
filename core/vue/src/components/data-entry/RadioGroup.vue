&lt;!--
RadioGroup 组件

功能：单选按钮组组件，支持默认模式和卡片模式

属性：
- modelValue: string | number | boolean | null - 当前选中的值
- options: RadioOption[] - 选项列表
  - label: string - 选项标签
  - value: string | number | boolean - 选项值
  - disabled?: boolean - 是否禁用该选项
  - description?: string - 选项描述（仅卡片模式使用）
- disabled?: boolean - 是否禁用整个单选组
- name?: string - 表单名称
- size?: 'sm' | 'md' | 'lg' - 组件尺寸
- direction?: 'horizontal' | 'vertical' - 排列方向
- variant?: 'default' | 'card' - 显示模式
- customClass?: string - 自定义类名

事件：
- update:modelValue - 值变化时触发
- change - 值变化时触发

使用方式：
```vue
&lt;RadioGroup
  v-model="selectedValue"
  :options="[
    { label: '选项1', value: '1' },
    { label: '选项2', value: '2' },
    { label: '选项3', value: '3', disabled: true }
  ]"
  direction="vertical"
  size="md"
  @change="handleChange"
/&gt;

&lt;!-- 卡片模式 --&gt;
&lt;RadioGroup
  v-model="selectedValue"
  :options="[
    { label: '选项1', value: '1', description: '选项1的详细描述' },
    { label: '选项2', value: '2', description: '选项2的详细描述' }
  ]"
  variant="card"
  @change="handleChange"
/&gt;
```
--&gt;
<template>
  <div 
    :class="radioGroupClass" 
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <template v-if="variant === 'card'">
      <div
        v-for="option in normalizedOptions"
        :key="String(option.value)"
        :class="getCardClass(option)"
        @click="!disabled && !option.disabled && handleChange(option.value)"
        :aria-disabled="disabled || option.disabled"
      >
        <div class="radio-card-header">
          <Radio
            :model-value="modelValue"
            :value="option.value"
            :label="option.label"
            :disabled="disabled || option.disabled"
            :name="name"
            :size="resolvedSize"
            @change="handleChange(option.value)"
          />
        </div>
        <div v-if="option.description" class="radio-card-description">
          {{ option.description }}
        </div>
      </div>
    </template>
    <template v-else>
      <Radio
        v-for="option in normalizedOptions"
        :key="String(option.value)"
        :model-value="modelValue"
        :value="option.value"
        :label="option.label"
        :disabled="disabled || option.disabled"
        :name="name"
        :size="resolvedSize"
        @change="handleChange"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import Radio from './Radio.vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { useComponentSize } from '../composables/useComponentSize';

export type RadioGroupSize = ComponentSize;
export type RadioGroupVariant = 'default' | 'card';

export interface RadioOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  description?: string;
}

interface Props {
  modelValue?: string | number | boolean | null;
  options: RadioOption[];
  disabled?: boolean;
  name?: string;
  size?: RadioGroupSize;
  direction?: 'horizontal' | 'vertical';
  variant?: RadioGroupVariant;
  customClass?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  options: () => [],
  disabled: false,
  name: '',
  size: undefined,
  direction: 'horizontal',
  variant: 'default',
  customClass: '',
  ariaLabel: 'Radio group',
});

const emit = defineEmits<{
  'update:modelValue': [string | number | boolean | null];
  'change': [string | number | boolean | null];
}>();

const resolvedSize = useComponentSize(toRef(props, 'size'));

const normalizedOptions = computed(() => {
  return props.options.map(option => ({
    ...option,
    disabled: option.disabled || false,
  }));
});

const radioGroupClass = computed(() => {
  const classes = ['radio-group', `radio-group--${props.direction}`, `radio-group--${resolvedSize.value}`];
  if (props.variant === 'card') {
    classes.push('radio-group--card');
  }
  if (props.disabled) {
    classes.push('radio-group--disabled');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const getCardClass = (option: RadioOption) => {
  const classes = ['radio-card'];
  if (props.modelValue === option.value) {
    classes.push('radio-card--checked');
  }
  if (props.disabled || option.disabled) {
    classes.push('radio-card--disabled');
  }
  return classes;
};

const handleChange = (value: string | number | boolean | null) => {
  emit('update:modelValue', value);
  emit('change', value);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  
  const enabledOptions = normalizedOptions.value.filter(option => !option.disabled);
  if (enabledOptions.length === 0) return;
  
  const currentIndex = enabledOptions.findIndex(option => option.value === props.modelValue);
  let newIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      newIndex = (currentIndex + 1) % enabledOptions.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      newIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = enabledOptions.length - 1;
      break;
    default:
      return;
  }
  
  event.preventDefault();
  handleChange(enabledOptions[newIndex].value);
};
</script>

<style scoped>
.radio-group {
  display: flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 水平布局 */
.radio-group--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
}

/* 垂直布局 */
.radio-group--vertical {
  flex-direction: column;
  gap: 16px;
}

/* 小尺寸 */
.radio-group--sm {
  gap: 16px;
}

.radio-group--sm.radio-group--vertical {
  gap: 12px;
}

/* 中尺寸 - 默认 */
.radio-group--md {
  gap: 24px;
}

.radio-group--md.radio-group--vertical {
  gap: 16px;
}

/* 大尺寸 */
.radio-group--lg {
  gap: 32px;
}

.radio-group--lg.radio-group--vertical {
  gap: 20px;
}

/* 禁用状态 */
.radio-group--disabled {
  cursor: not-allowed;
}

/* 卡片式单选组 */
.radio-group--card {
  display: grid;
  gap: 12px;
}

.radio-group--card.radio-group--vertical {
  grid-template-columns: 1fr;
}

.radio-group--card.radio-group--horizontal {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* 卡片样式 */
.radio-card {
  padding: 16px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.radio-card:hover:not(.radio-card--disabled) {
  border-color: hsl(var(--border-hover));
}

.radio-card--checked {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.05);
}

.radio-card--checked:hover:not(.radio-card--disabled) {
  border-color: hsl(var(--primary));
}

.radio-card--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.radio-card-header {
  display: flex;
  align-items: center;
}

.radio-card-description {
  margin-top: 8px;
  margin-left: 26px;
  font-size: 13px;
  color: hsl(var(--text-secondary));
  line-height: 1.5;
}
</style>
