&lt;!--
SegmentedControl 组件

功能：分段控制组件，用于在多个选项之间进行选择

属性：
- modelValue: string | number - 当前选中的值
- options: SegmentedOption[] - 选项列表
  - label: string - 选项标签
  - value: string | number - 选项值
  - disabled?: boolean - 是否禁用该选项
  - icon?: string - 选项图标
- disabled?: boolean - 是否禁用整个组件
- size?: 'sm' | 'md' | 'lg' - 组件尺寸
- block?: boolean - 是否占满整行
- expanded?: boolean - 是否展开额外内容
- customClass?: string - 自定义类名
- ariaLabel?: string - 无障碍标签

事件：
- update:modelValue - 值变化时触发
- change - 值变化时触发

使用方式：
```vue
&lt;SegmentedControl
  v-model="selectedValue"
  :options="[
    { label: '选项1', value: '1' },
    { label: '选项2', value: '2' },
    { label: '选项3', value: '3', disabled: true }
  ]"
  size="md"
  @change="handleChange"
/&gt;

&lt;!-- 带图标和展开区域 --&gt;
&lt;SegmentedControl
  v-model="selectedValue"
  :options="[
    { label: '选项1', value: '1', icon: 'settings' },
    { label: '选项2', value: '2', icon: 'user' }
  ]"
  :expanded="true"
&gt;
  &lt;template #expand="{ value }"&gt;
    &lt;div&gt;选中的值: {{ value }}&lt;/div&gt;
  &lt;/template&gt;
&lt;/SegmentedControl&gt;
```
--&gt;
<template>
  <div 
    :class="segmentedClass" 
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    @keydown="handleKeyDown"
  >
    <button
      v-for="(option, index) in options"
      :key="String(option.value)"
      type="button"
      role="radio"
      :class="getOptionClass(option)"
      :disabled="disabled || option.disabled"
      :aria-checked="modelValue === option.value"
      :aria-disabled="disabled || option.disabled"
      :aria-label="option.label"
      :id="`segmented-option-${index}`"
      :title="option.label"
      :tabindex="modelValue === option.value ? 0 : -1"
      @click="handleSelect(option.value)"
    >
      <span v-if="option.icon" class="segmented-icon">
        <Icon v-if="isSvgIcon(option.icon)" :svg="option.icon" :size="iconSize" />
        <Icon v-else :name="option.icon" :size="iconSize" />
      </span>
      <span v-if="showLabel" class="segmented-label">{{ option.label }}</span>
    </button>
    
    <!-- 展开区域 -->
    <CollapseTransition v-if="$slots.expand && expanded">
      <div class="segmented-expand">
        <slot name="expand" :value="modelValue" />
      </div>
    </CollapseTransition>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, watch } from 'vue';
import Icon from '../utility/Icon.vue';
import { CollapseTransition } from '../animation';
import type { ComponentSize } from '@ocpui/vue/types';
import { useComponentSize } from '../composables/useComponentSize';

export type SegmentedSize = ComponentSize;

export interface SegmentedOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: string;
}

interface Props {
  modelValue?: string | number;
  options: SegmentedOption[];
  disabled?: boolean;
  size?: SegmentedSize;
  showLabel?: boolean;
  block?: boolean;
  expanded?: boolean;
  customClass?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  disabled: false,
  size: undefined,
  showLabel: true,
  block: false,
  expanded: false,
  customClass: '',
  ariaLabel: 'Segmented control',
});

const resolvedSize = useComponentSize(toRef(props, 'size'));

const emit = defineEmits<{
  'update:modelValue': [string | number];
  'change': [string | number];
}>();

const segmentedClass = computed(() => {
  const classes = [
    'segmented-control',
    `segmented-control--${resolvedSize.value}`,
  ];
  if (props.block) {
    classes.push('segmented-control--block');
  }
  if (props.disabled) {
    classes.push('segmented-control--disabled');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const iconSize = computed(() => {
  const sizeMap: Record<SegmentedSize, number> = {
    sm: 14,
    md: 16,
    lg: 18,
  };
  return sizeMap[resolvedSize.value];
});

const isSvgIcon = (icon: string): boolean => icon.trim().startsWith('<svg');

const getOptionClass = (option: SegmentedOption) => {
  const classes = [
    'segmented-option',
    `segmented-option--${resolvedSize.value}`,
  ];
  if (props.modelValue === option.value) {
    classes.push('segmented-option--active');
  }
  if (option.disabled || props.disabled) {
    classes.push('segmented-option--disabled');
  }
  if (option.icon) {
    classes.push('segmented-option--with-icon');
  }
  return classes;
};

const handleSelect = (value: string | number) => {
  if (props.disabled) return;
  emit('update:modelValue', value);
  emit('change', value);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  
  const enabledOptions = props.options.filter(option => !option.disabled);
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
    case 'Enter':
    case ' ': 
      if (currentIndex >= 0) {
        handleSelect(enabledOptions[currentIndex].value);
      }
      return;
    default:
      return;
  }
  
  event.preventDefault();
  handleSelect(enabledOptions[newIndex].value);
  
  // 滚动到选中项
  const selectedElement = document.getElementById(`segmented-option-${newIndex}`);
  if (selectedElement) {
    selectedElement.focus();
  }
};

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    // 确保值在选项范围内
    const optionValues = props.options.map(option => option.value);
    if (newValue !== undefined && !optionValues.includes(newValue)) {
      // 如果值不在选项范围内，选择第一个可用选项
      const firstEnabledOption = props.options.find(option => !option.disabled);
      if (firstEnabledOption) {
        emit('update:modelValue', firstEnabledOption.value);
        emit('change', firstEnabledOption.value);
      }
    }
  }
);
</script>

<style scoped>
.segmented-control {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.segmented-control--block {
  display: flex;
  width: 100%;
}

.segmented-control--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.segmented-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition-property: color, background-color, box-shadow;
  transition-duration: 0.25s;
  transition-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
  white-space: nowrap;
  flex: 1;
}

.segmented-option:hover:not(.segmented-option--disabled):not(.segmented-option--active) {
  color: hsl(var(--text));
  background: hsl(var(--surface-hover));
}

.segmented-option--active {
  color: hsl(var(--text));
  background: hsl(var(--surface));
  box-shadow: var(--shadow-sm);
}

.segmented-option--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.segmented-option--with-icon {
  padding-left: 12px;
}

/* Size variants */
.segmented-option--sm {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
}

.segmented-option--sm.segmented-option--with-icon {
  padding-left: 10px;
}

.segmented-option--lg {
  padding: 10px 20px;
  font-size: 15px;
  border-radius: 10px;
}

.segmented-option--lg.segmented-option--with-icon {
  padding-left: 16px;
}

.segmented-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.segmented-label {
  line-height: 1.4;
}

.segmented-expand {
  width: 100%;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid hsl(var(--border));
}

/* Responsive styles */
@media (max-width: 575.98px) {
  .segmented-control {
    flex-wrap: wrap;
    padding: 3px;
    border-radius: 10px;
  }
  
  .segmented-option {
    min-height: 40px;
    padding: 8px 12px;
    font-size: var(--font-size-sm);
    flex: 1 1 auto;
  }
  
  .segmented-option--sm {
    min-height: 36px;
  }
  
  .segmented-option--lg {
    min-height: 48px;
  }
}
</style>
