&lt;!--
NumberRangeInput 数字范围输入组件

## 组件说明
用于输入数字范围的组件，支持最小值和最大值的输入与验证。

## 公开属性
- modelValue: NumberRangeValue - 绑定值，格式为 { min: number | null, max: number | null }
- label: string - 标签
- minPlaceholder: string - 最小值占位符，默认 "最小值"
- maxPlaceholder: string - 最大值占位符，默认 "最大值"
- absoluteMin: number - 绝对最小值，默认 -Infinity
- absoluteMax: number - 绝对最大值，默认 Infinity
- disabled: boolean - 是否禁用
- size: 'sm' | 'md' | 'lg' - 尺寸，默认 'md'
- unit: string - 单位
- vertical: boolean - 是否垂直布局

## 事件
- update:modelValue - 值变更时触发
- change - 值变更时触发

## 接口
- NumberRangeValue: { min: number | null; max: number | null } - 数字范围值接口

## 使用方式
```vue
&lt;NumberRangeInput v-model="rangeValue" :absoluteMin="0" :absoluteMax="100" /&gt;
```
--&gt;
<template>
  <div class="number-range-input" :class="{ 'number-range-input--vertical': vertical }" role="group" :aria-label="label || t('components.dataEntry.numberRangeInput.fallbackAriaLabel')">
    <span v-if="label" class="number-range-label">{{ label }}</span>
    <div class="number-range-wrapper">
      <InputNumber
        :model-value="minValue"
        :placeholder="minPlaceholder"
        :min="absoluteMin"
        :max="maxValue ?? absoluteMax"
        :disabled="disabled"
        :size="size"
        :suffix="unit"
        :aria-label="t('components.dataEntry.numberRangeInput.min')"
        @update:model-value="handleMinChange"
      />
      <span class="number-range-separator" aria-hidden="true">~</span>
      <InputNumber
        :model-value="maxValue"
        :placeholder="maxPlaceholder"
        :min="minValue ?? absoluteMin"
        :max="absoluteMax"
        :disabled="disabled"
        :size="size"
        :suffix="unit"
        :aria-label="t('components.dataEntry.numberRangeInput.max')"
        @update:model-value="handleMaxChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import InputNumber from './InputNumber.vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

type NumberRangeSize = ComponentSize;

export interface NumberRangeValue {
  min: number | null;
  max: number | null;
}

interface Props {
  modelValue?: NumberRangeValue;
  label?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  absoluteMin?: number;
  absoluteMax?: number;
  disabled?: boolean;
  size?: NumberRangeSize;
  unit?: string;
  vertical?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ min: null, max: null }),
  minPlaceholder: '最小值',
  maxPlaceholder: '最大值',
  absoluteMin: -Infinity,
  absoluteMax: Infinity,
  disabled: false,
  size: 'md',
  unit: '',
  vertical: false,
});

const emit = defineEmits<{
  'update:modelValue': [NumberRangeValue];
  'change': [NumberRangeValue];
}>();

const minValue = computed(() => props.modelValue?.min ?? null);
const maxValue = computed(() => props.modelValue?.max ?? null);

const handleMinChange = (value: number | null) => {
  const newValue: NumberRangeValue = {
    min: value,
    max: props.modelValue?.max ?? null,
  };
  
  // 如果最小值大于最大值，清空最大值
  if (value !== null && newValue.max !== null && value > newValue.max) {
    newValue.max = null;
  }
  
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const handleMaxChange = (value: number | null) => {
  const newValue: NumberRangeValue = {
    min: props.modelValue?.min ?? null,
    max: value,
  };
  
  // 如果最大值小于最小值，清空最小值
  if (value !== null && newValue.min !== null && value < newValue.min) {
    newValue.min = null;
  }
  
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  // 确保值的有效性
  if (newValue) {
    const { min, max } = newValue;
    if (min !== null && max !== null && min > max) {
      // 如果外部传入的最小值大于最大值，自动调整
      emit('update:modelValue', { min, max: null });
      emit('change', { min, max: null });
    }
  }
}, { deep: true });
</script>

<style scoped>
.number-range-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.number-range-input--vertical {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.number-range-label {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
  white-space: nowrap;
  flex-shrink: 0;
}

.number-range-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.number-range-wrapper :deep(.input-number) {
  flex: 1;
  min-width: 80px;
}

.number-range-separator {
  font-size: 14px;
  color: hsl(var(--text-muted));
  font-weight: 500;
  padding: 0 4px;
  flex-shrink: 0;
}

/* 响应式样式 */
@media (max-width: 639.98px) {
  .number-range-input {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .number-range-wrapper {
    width: 100%;
  }
  
  .number-range-wrapper :deep(.input-number) {
    min-width: 0;
  }
}
</style>
