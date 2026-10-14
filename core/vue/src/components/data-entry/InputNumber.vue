&lt;!--
InputNumber 数字输入组件

## 组件说明
数字输入组件，支持通过按钮或键盘控制数值增减，支持自定义范围、步长和精度。

## 公开属性
- modelValue: number | null - 绑定值
- min: number - 最小值，默认 -Infinity
- max: number - 最大值，默认 Infinity
- step: number - 步长，默认 1
- precision: number - 精度，默认根据 step 自动计算
- placeholder: string - 占位符
- disabled: boolean - 是否禁用
- readonly: boolean - 是否只读
- size: 'sm' | 'md' | 'lg' - 尺寸，默认 'md'
- suffix: string - 后缀
- formatter: (value: number) =&gt; string - 格式化函数
- parser: (value: string) =&gt; number - 解析函数
- keyboard: boolean - 是否支持键盘操作，默认 true
- customClass: string - 自定义类名

## 事件
- update:modelValue - 值变更时触发
- change - 值变更时触发
- focus - 获得焦点时触发
- blur - 失去焦点时触发

## 使用方式
```vue
&lt;InputNumber v-model="value" :min="0" :max="100" :step="1" /&gt;
```
--&gt;
<template>
  <div
    :class="inputNumberClass"
    @keydown="handleKeydown"
  >
    <button
      type="button"
      :class="handlerClass('down')"
      :disabled="disabled || isMin"
      @mousedown="handleDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleDown"
      @touchend="handleMouseUp"
    >
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 6h8" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="input-number-input-wrap">
      <input
        ref="inputRef"
        type="text"
        :class="inputClass"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
      />
      <span v-if="suffix" class="input-number-suffix">{{ suffix }}</span>
    </div>
    <button
      type="button"
      :class="handlerClass('up')"
      :disabled="disabled || isMax"
      @mousedown="handleUp"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleUp"
      @touchend="handleMouseUp"
    >
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 6h8M6 2v8" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, toRef } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { useComponentSize } from '../composables/useComponentSize';

interface Props {
  modelValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  size?: ComponentSize;
  suffix?: string;
  formatter?: (value: number) => string;
  parser?: (value: string) => number;
  keyboard?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  min: -Infinity,
  max: Infinity,
  step: 1,
  precision: undefined,
  placeholder: '',
  disabled: false,
  readonly: false,
  size: undefined,
  suffix: '',
  formatter: undefined,
  parser: undefined,
  keyboard: true,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [number | null];
  'change': [number | null];
  'focus': [];
  'blur': [];
}>();

const inputRef = ref<HTMLInputElement>();
const isFocused = ref(false);
const longPressTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const isLongPress = ref(false);

const normalizedStep = computed(() => {
  const step = Number(props.step);
  return Number.isFinite(step) && step > 0 ? step : 1;
});

// Get precision from step if not specified
const computedPrecision = computed(() => {
  if (props.precision !== undefined) return Math.max(0, Math.floor(props.precision));
  const stepStr = normalizedStep.value.toString();
  const decimalIndex = stepStr.indexOf('.');
  return decimalIndex === -1 ? 0 : stepStr.length - decimalIndex - 1;
});

const isMin = computed(() => props.modelValue !== null && props.modelValue <= props.min);
const isMax = computed(() => props.modelValue !== null && props.modelValue >= props.max);

const displayValue = computed(() => {
  if (props.modelValue === null) return '';
  if (props.formatter) {
    return props.formatter(props.modelValue);
  }
  return computedPrecision.value > 0
    ? props.modelValue.toFixed(computedPrecision.value)
    : String(props.modelValue);
});

const resolvedSize = useComponentSize(toRef(props, 'size'));

const inputNumberClass = computed(() => {
  const classes = ['input-number', `input-number--${resolvedSize.value}`];
  if (props.disabled) {
    classes.push('input-number--disabled');
  }
  if (isFocused.value) {
    classes.push('input-number--focused');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const inputClass = computed(() => {
  const classes = ['input-number-input'];
  if (props.suffix) {
    classes.push('input-number-input--with-suffix');
  }
  return classes;
});

const handlerClass = (direction: 'up' | 'down') => {
  const classes = ['input-number-handler', `input-number-handler--${direction}`];
  if (direction === 'up' && isMax.value) {
    classes.push('input-number-handler--disabled');
  }
  if (direction === 'down' && isMin.value) {
    classes.push('input-number-handler--disabled');
  }
  return classes;
};

const parseValue = (value: string): number | null => {
  if (props.parser) {
    const parsedByCustomParser = props.parser(value);
    return Number.isFinite(parsedByCustomParser) ? parsedByCustomParser : null;
  }
  if (value.trim() === '') return null;
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const clampValue = (value: number | null): number | null => {
  if (value === null || !Number.isFinite(value)) return null;
  let clamped = Math.max(props.min, Math.min(props.max, value));
  if (computedPrecision.value > 0) {
    const multiplier = Math.pow(10, computedPrecision.value);
    clamped = Math.round(clamped * multiplier) / multiplier;
  }
  return clamped;
};

const updateValue = (newValue: number | null, emitChange = true) => {
  const clamped = clampValue(newValue);
  emit('update:modelValue', clamped);
  if (emitChange) {
    emit('change', clamped);
  }
};

const handleInput = (_e: Event) => {
  // 允许用户自由输入，只在 blur 或 change 时验证
};

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const parsed = parseValue(target.value);
  updateValue(parsed);
};

const handleFocus = () => {
  isFocused.value = true;
  // 聚焦时选择全部内容
  setTimeout(() => {
    inputRef.value?.select();
  }, 10);
  emit('focus');
};

const handleBlur = (e: Event) => {
  isFocused.value = false;
  const target = e.target as HTMLInputElement;
  const parsed = parseValue(target.value);
  updateValue(parsed);
  emit('blur');
};

const stepValue = (direction: 1 | -1) => {
  if (props.disabled || props.readonly) return;
  const current = props.modelValue ?? 0;
  const step = normalizedStep.value;
  const newValue = current + step * direction;
  updateValue(newValue);
};

const handleUp = () => {
  if (isMax.value) return;
  stepValue(1);
  startLongPress(1);
};

const handleDown = () => {
  if (isMin.value) return;
  stepValue(-1);
  startLongPress(-1);
};

const startLongPress = (direction: 1 | -1) => {
  isLongPress.value = false;
  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true;
    longPressTimer.value = setInterval(() => {
      if ((direction === 1 && isMax.value) || (direction === -1 && isMin.value)) {
        handleMouseUp();
        return;
      }
      stepValue(direction);
    }, 100);
  }, 500);
};

const handleMouseUp = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    clearInterval(longPressTimer.value);
    longPressTimer.value = null;
  }
  isLongPress.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.keyboard || props.disabled || props.readonly) return;
  
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      stepValue(1);
      break;
    case 'ArrowDown':
      e.preventDefault();
      stepValue(-1);
      break;
    case 'PageUp':
      e.preventDefault();
      stepValue(1);
      break;
    case 'PageDown':
      e.preventDefault();
      stepValue(-1);
      break;
    case 'Home':
      e.preventDefault();
      updateValue(props.min);
      break;
    case 'End':
      e.preventDefault();
      updateValue(props.max);
      break;
  }
};

// Watch for external value changes
watch(() => props.modelValue, () => {
  // Ensure display is updated
});
</script>

<style scoped>
.input-number {
  display: inline-flex;
  align-items: stretch;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
}

.input-number:hover:not(.input-number--disabled) {
  border-color: hsl(var(--border-hover));
}

.input-number--focused {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.input-number--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-number-handler {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  background: hsl(var(--surface-container-high));
  border: none;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.input-number-handler:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
}

.input-number-handler:active:not(:disabled) {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.input-number-handler:disabled,
.input-number-handler--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.input-number-handler svg {
  width: 12px;
  height: 12px;
}

.input-number-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.input-number-input {
  width: 100%;
  padding: 0 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: hsl(var(--text));
  text-align: center;
  outline: none;
  font-family: inherit;
}

.input-number-input::placeholder {
  color: hsl(var(--text-muted));
}

.input-number-input:disabled {
  cursor: not-allowed;
}

.input-number-suffix {
  padding-right: 12px;
  font-size: 14px;
  color: hsl(var(--text-muted));
  pointer-events: none;
}

/* Size variants */
.input-number--sm .input-number-handler {
  width: 28px;
}

.input-number--sm .input-number-input {
  padding: 0 8px;
  font-size: 13px;
  height: 32px;
}

.input-number--md .input-number-input {
  height: 36px;
}

.input-number--lg .input-number-handler {
  width: 40px;
}

.input-number--lg .input-number-input {
  padding: 0 16px;
  font-size: 16px;
  height: 40px;
}

.input-number--lg .input-number-handler svg {
  width: 14px;
  height: 14px;
}

/* Responsive styles */
@media (max-width: 575.98px) {
  .input-number {
    min-height: 44px;
  }
  
  .input-number-input {
    font-size: var(--font-size-sm);
    min-height: 44px;
  }
  
  .input-number-handler {
    width: 40px;
    min-height: 44px;
  }
  
  .input-number-handler svg {
    width: 16px;
    height: 16px;
  }
}
</style>
