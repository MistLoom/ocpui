&lt;!--
Slider 组件

功能：滑块组件，支持单值和范围选择

属性：
- modelValue: number | [number, number] - 当前值或范围值
- min: number - 最小值
- max: number - 最大值
- step: number - 步长
- range: boolean - 是否为范围选择
- disabled: boolean - 是否禁用
- marks: Marks - 刻度标记
  - [key: number]: string - 刻度值和标签
- showInput: boolean - 是否显示输入框
- inputPosition: 'left' | 'right' - 输入框位置
- showTooltip: boolean - 是否显示工具提示
- size: ComponentSize - 组件尺寸，继承 SizeScope
- customClass: string - 自定义类名
- ariaLabel: string - 无障碍标签

事件：
- update:modelValue - 值变化时触发
- change - 值变化时触发

使用方式：
```vue
&lt;Slider v-model="value" :min="0" :max="100" :step="1" /&gt;

&lt;!-- 范围选择 --&gt;
&lt;Slider v-model="rangeValue" range :min="0" :max="100" /&gt;

&lt;!-- 带输入框 --&gt;
&lt;Slider v-model="value" showInput :min="0" :max="100" /&gt;
```
--&gt;
<template>
  <div
    :class="sliderClass"
    :role="range ? 'group' : 'slider'"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    :aria-valuemin="!range ? min : undefined"
    :aria-valuemax="!range ? max : undefined"
    :aria-valuenow="!range ? currentValue : undefined"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <div v-if="showInput && inputPosition === 'left'" class="slider-input-wrapper">
      <InputNumber
        :model-value="currentValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :size="resolvedSize"
        @update:model-value="handleInput"
        :aria-label="ariaLabel + t('components.dataEntry.slider.inputValueSuffix')"
      />
    </div>
    <div class="slider-track-wrapper">
      <div
        ref="trackRef"
        class="slider-track"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
      >
        <div class="slider-rail" />
        <div class="slider-fill" :style="fillStyle" />
        <div
          v-if="range"
          class="slider-handle slider-handle-start"
          :class="{ 'slider-handle-active': activeHandle === 'start' }"
          :style="startHandleStyle"
          @mousedown.stop="handleStartMouseDown"
          @touchstart.stop="handleStartTouchStart"
          @mouseenter="showStartTooltip"
          @mouseleave="hideStartTooltip"
          role="slider"
          tabindex="0"
          :aria-label="ariaLabel + t('components.dataEntry.slider.startValueSuffix')"
          :aria-disabled="disabled"
          :aria-valuemin="min"
          :aria-valuemax="max"
          :aria-valuenow="startValue"
          @keydown.stop="handleStartKeyDown"
        />
        <div
          class="slider-handle slider-handle-end"
          :class="{ 'slider-handle-active': activeHandle === 'end' }"
          :style="handleStyle"
          @mousedown.stop="handleEndMouseDown"
          @touchstart.stop="handleEndTouchStart"
          @mouseenter="showEndTooltip"
          @mouseleave="hideEndTooltip"
          role="slider"
          tabindex="0"
          :aria-label="ariaLabel + t('components.dataEntry.slider.endValueSuffix')"
          :aria-disabled="disabled"
          :aria-valuemin="min"
          :aria-valuemax="max"
          :aria-valuenow="currentValue"
          @keydown.stop="handleEndKeyDown"
        />
        <div v-if="marks" class="slider-marks">
          <span
            v-for="(mark, key) in marks"
            :key="key"
            class="slider-mark"
            :class="{ 'slider-mark-active': isMarkActive(Number(key)) }"
            :style="{ left: `${getPercent(Number(key))}%` }"
            role="presentation"
          >
            {{ mark }}
          </span>
        </div>
      </div>
      <Transition name="tooltip">
        <div v-if="showTooltip && tooltipVisible" class="slider-tooltip" :style="tooltipStyle" role="tooltip" :aria-live="'polite'">
          {{ tooltipValue }}
        </div>
      </Transition>
    </div>
    <div v-if="showInput && inputPosition === 'right'" class="slider-input-wrapper">
      <InputNumber
        :model-value="currentValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :size="resolvedSize"
        @update:model-value="handleInput"
        :aria-label="ariaLabel + t('components.dataEntry.slider.inputValueSuffix')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, toRef, watch } from 'vue';
import InputNumber from './InputNumber.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useComponentSize } from '../composables/useComponentSize';
import type { ComponentSize } from '@ocpui/vue/types';

const { uiT: t } = useUiT();

export interface Marks {
  [key: number]: string;
}

export interface Props {
  modelValue?: number | [number, number];
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  disabled?: boolean;
  marks?: Marks;
  showInput?: boolean;
  inputPosition?: 'left' | 'right';
  showTooltip?: boolean;
  size?: ComponentSize;
  customClass?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  range: false,
  disabled: false,
  marks: undefined,
  showInput: false,
  inputPosition: 'right',
  showTooltip: true,
  size: undefined,
  customClass: '',
  ariaLabel: 'Slider',
});

const resolvedSize = useComponentSize(toRef(props, 'size'));

const emit = defineEmits<{
  'update:modelValue': [number | [number, number]];
  'change': [number | [number, number]];
}>();

const trackRef = ref<HTMLElement>();
const isDragging = ref(false);
const activeHandle = ref<'start' | 'end' | null>(null);
const tooltipVisible = ref(false);
const currentTooltipValue = ref(0);

const sliderClass = computed(() => {
  const classes = ['slider', `slider-${resolvedSize.value}`];
  if (props.disabled) {
    classes.push('slider-disabled');
  }
  if (isDragging.value) {
    classes.push('slider-dragging');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const currentValue = computed(() => {
  if (props.range && Array.isArray(props.modelValue)) {
    return props.modelValue[1];
  }
  return props.modelValue as number;
});

const startValue = computed(() => {
  if (props.range && Array.isArray(props.modelValue)) {
    return props.modelValue[0];
  }
  return props.min;
});

const normalizedStep = computed(() => {
  const step = Number(props.step);
  return Number.isFinite(step) && step > 0 ? step : 1;
});

const valueRange = computed(() => props.max - props.min);

const getPercent = (value: number) => {
  if (valueRange.value <= 0) return 0;
  return ((value - props.min) / valueRange.value) * 100;
};

const fillStyle = computed(() => {
  if (props.range && Array.isArray(props.modelValue)) {
    const start = getPercent(props.modelValue[0]);
    const end = getPercent(props.modelValue[1]);
    return {
      left: `${start}%`,
      width: `${end - start}%`,
    };
  }
  return {
    width: `${getPercent(currentValue.value)}%`,
  };
});

const handleStyle = computed(() => ({
  left: `${getPercent(currentValue.value)}%`,
}));

const startHandleStyle = computed(() => ({
  left: `${getPercent(startValue.value)}%`,
}));

const tooltipStyle = computed(() => ({
  left: `${getPercent(currentTooltipValue.value)}%`,
}));

const tooltipValue = computed(() => {
  if (props.step >= 1) {
    return Math.round(currentTooltipValue.value);
  }
  return currentTooltipValue.value.toFixed(2);
});

const isMarkActive = (value: number) => {
  if (props.range && Array.isArray(props.modelValue)) {
    return value >= props.modelValue[0] && value <= props.modelValue[1];
  }
  return value <= currentValue.value;
};

const getValueFromPosition = (clientX: number) => {
  if (!trackRef.value) return 0;
  const rect = trackRef.value.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  if (valueRange.value <= 0) return props.min;
  const rawValue = props.min + percent * valueRange.value;
  const steppedValue = Math.round(rawValue / normalizedStep.value) * normalizedStep.value;
  return Math.max(props.min, Math.min(props.max, steppedValue));
};

const updateValue = (clientX: number) => {
  const value = getValueFromPosition(clientX);
  currentTooltipValue.value = value;
  
  if (props.range && Array.isArray(props.modelValue)) {
    const newValue: [number, number] = [...props.modelValue] as [number, number];
    if (activeHandle.value === 'start') {
      newValue[0] = Math.min(value, newValue[1]);
    } else {
      newValue[1] = Math.max(value, newValue[0]);
    }
    emit('update:modelValue', newValue);
    emit('change', newValue);
  } else {
    emit('update:modelValue', value);
    emit('change', value);
  }
};

const handleMouseDown = (event: MouseEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  
  const value = getValueFromPosition(event.clientX);
  
  if (props.range && Array.isArray(props.modelValue)) {
    const distToStart = Math.abs(value - props.modelValue[0]);
    const distToEnd = Math.abs(value - props.modelValue[1]);
    activeHandle.value = distToStart <= distToEnd ? 'start' : 'end';
  } else {
    activeHandle.value = 'end';
  }
  
  isDragging.value = true;
  tooltipVisible.value = true;
  currentTooltipValue.value = value;
  updateValue(event.clientX);
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleStartMouseDown = (event: MouseEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragging.value = true;
  activeHandle.value = 'start';
  tooltipVisible.value = true;
  currentTooltipValue.value = startValue.value;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleEndMouseDown = (event: MouseEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragging.value = true;
  activeHandle.value = 'end';
  tooltipVisible.value = true;
  currentTooltipValue.value = currentValue.value;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return;
  updateValue(event.clientX);
};

const handleMouseUp = () => {
  isDragging.value = false;
  activeHandle.value = null;
  tooltipVisible.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

const handleTouchStart = (event: TouchEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  
  const touch = event.touches[0];
  const value = getValueFromPosition(touch.clientX);
  
  if (props.range && Array.isArray(props.modelValue)) {
    const distToStart = Math.abs(value - props.modelValue[0]);
    const distToEnd = Math.abs(value - props.modelValue[1]);
    activeHandle.value = distToStart <= distToEnd ? 'start' : 'end';
  } else {
    activeHandle.value = 'end';
  }
  
  isDragging.value = true;
  tooltipVisible.value = true;
  currentTooltipValue.value = value;
  updateValue(touch.clientX);
  
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
};

const handleStartTouchStart = (event: TouchEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragging.value = true;
  activeHandle.value = 'start';
  tooltipVisible.value = true;
  currentTooltipValue.value = startValue.value;
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
};

const handleEndTouchStart = (event: TouchEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragging.value = true;
  activeHandle.value = 'end';
  tooltipVisible.value = true;
  currentTooltipValue.value = currentValue.value;
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
};

const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  updateValue(touch.clientX);
};

const handleTouchEnd = () => {
  isDragging.value = false;
  activeHandle.value = null;
  tooltipVisible.value = false;
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
};

const showStartTooltip = () => {
  if (!isDragging.value && !props.disabled) {
    tooltipVisible.value = true;
    currentTooltipValue.value = startValue.value;
  }
};

const showEndTooltip = () => {
  if (!isDragging.value && !props.disabled) {
    tooltipVisible.value = true;
    currentTooltipValue.value = currentValue.value;
  }
};

const hideStartTooltip = () => {
  if (!isDragging.value) {
    tooltipVisible.value = false;
  }
};

const hideEndTooltip = () => {
  if (!isDragging.value) {
    tooltipVisible.value = false;
  }
};

const handleInput = (value: number | null) => {
  if (value === null) return;
  const clamped = Math.max(props.min, Math.min(props.max, value));
  if (props.range && Array.isArray(props.modelValue)) {
    const newValue: [number, number] = [props.modelValue[0], Math.max(clamped, props.modelValue[0])];
    emit('update:modelValue', newValue);
    emit('change', newValue);
  } else {
    emit('update:modelValue', clamped);
    emit('change', clamped);
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  const step = normalizedStep.value;
  
  let newValue: number | [number, number];
  
  if (props.range && Array.isArray(props.modelValue)) {
    newValue = [...props.modelValue] as [number, number];
  } else {
    newValue = props.modelValue as number;
  }
  
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      event.preventDefault();
      if (props.range && Array.isArray(newValue)) {
        if (activeHandle.value === 'start') {
          newValue[0] = Math.max(props.min, newValue[0] - step);
        } else {
          newValue[1] = Math.max(props.min, newValue[1] - step);
        }
      } else if (typeof newValue === 'number') {
        newValue = Math.max(props.min, newValue - step);
      }
      break;
    case 'ArrowRight':
    case 'ArrowUp':
      event.preventDefault();
      if (props.range && Array.isArray(newValue)) {
        if (activeHandle.value === 'start') {
          newValue[0] = Math.min(props.max, newValue[0] + step);
        } else {
          newValue[1] = Math.min(props.max, newValue[1] + step);
        }
      } else if (typeof newValue === 'number') {
        newValue = Math.min(props.max, newValue + step);
      }
      break;
    case 'Home':
      event.preventDefault();
      if (props.range && Array.isArray(newValue)) {
        if (activeHandle.value === 'start') {
          newValue[0] = props.min;
        } else {
          newValue[1] = props.min;
        }
      } else if (typeof newValue === 'number') {
        newValue = props.min;
      }
      break;
    case 'End':
      event.preventDefault();
      if (props.range && Array.isArray(newValue)) {
        if (activeHandle.value === 'start') {
          newValue[0] = props.max;
        } else {
          newValue[1] = props.max;
        }
      } else if (typeof newValue === 'number') {
        newValue = props.max;
      }
      break;
    default:
      return;
  }
  
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const handleStartKeyDown = (event: KeyboardEvent) => {
  activeHandle.value = 'start';
  handleKeyDown(event);
};

const handleEndKeyDown = (event: KeyboardEvent) => {
  activeHandle.value = 'end';
  handleKeyDown(event);
};

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  // 确保值的有效性
  if (props.range && Array.isArray(newValue)) {
    if (newValue[0] < props.min || newValue[1] > props.max || newValue[0] > newValue[1]) {
      // 修正范围值
      const correctedValue: [number, number] = [
        Math.max(props.min, Math.min(newValue[0], props.max)),
        Math.max(props.min, Math.min(newValue[1], props.max))
      ];
      if (correctedValue[0] > correctedValue[1]) {
        [correctedValue[0], correctedValue[1]] = [correctedValue[1], correctedValue[0]];
      }
      emit('update:modelValue', correctedValue);
      emit('change', correctedValue);
    }
  } else if (typeof newValue === 'number') {
    if (newValue < props.min || newValue > props.max) {
      // 修正单值
      const correctedValue = Math.max(props.min, Math.min(newValue, props.max));
      emit('update:modelValue', correctedValue);
      emit('change', correctedValue);
    }
  }
}, { deep: true });

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
});
</script>

<style scoped>
.slider {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.slider-track-wrapper {
  position: relative;
  flex: 1;
  padding: 8px 0;
}

.slider-track {
  position: relative;
  height: 8px;
  cursor: pointer;
}

.slider-rail {
  position: absolute;
  width: 100%;
  height: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: hsl(var(--surface-container-high));
  border-radius: 100px;
  transition: height 0.2s;
}

.slider:hover .slider-rail,
.slider-dragging .slider-rail {
  height: 6px;
}

.slider-fill {
  position: absolute;
  height: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: hsl(var(--primary));
  border-radius: 100px;
  transition: height 0.2s;
}

.slider:hover .slider-fill,
.slider-dragging .slider-fill {
  height: 6px;
}

.slider-handle {
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  transform: translate(-50%, -50%);
  background: hsl(var(--surface));
  border: 2px solid hsl(var(--primary));
  border-radius: 50%;
  cursor: grab;
  transition: transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), 
              box-shadow 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
              border-color 0.2s;
  z-index: 1;
}

.slider-handle:hover {
  transform: translate(-50%, -50%) scale(1.15);
  box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
}

.slider-handle-active,
.slider-handle:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.15);
  box-shadow: 0 0 0 6px hsl(var(--primary) / 0.25);
}

.slider-marks {
  position: absolute;
  width: 100%;
  top: 20px;
}

.slider-mark {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  color: hsl(var(--text-muted));
  transition: color 0.2s;
}

.slider-mark-active {
  color: hsl(var(--primary));
}

.slider-tooltip {
  position: absolute;
  top: -36px;
  transform: translateX(-50%);
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background: hsl(var(--text));
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
}

.slider-tooltip::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid hsl(var(--text));
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.slider-input-wrapper {
  width: 80px;
}

.slider-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.slider-disabled .slider-track,
.slider-disabled .slider-handle {
  cursor: not-allowed;
}

.slider-disabled .slider-handle:hover {
  transform: translate(-50%, -50%);
  box-shadow: none;
}

.slider-sm .slider-track {
  height: 6px;
}

.slider-sm .slider-handle {
  width: 12px;
  height: 12px;
}

.slider-sm .slider-rail,
.slider-sm .slider-fill {
  height: 3px;
}

.slider-sm:hover .slider-rail,
.slider-sm:hover .slider-fill,
.slider-sm.slider-dragging .slider-rail,
.slider-sm.slider-dragging .slider-fill {
  height: 4px;
}

.slider-lg .slider-track {
  height: 10px;
}

.slider-lg .slider-handle {
  width: 20px;
  height: 20px;
}

.slider-lg .slider-rail,
.slider-lg .slider-fill {
  height: 5px;
}

.slider-lg:hover .slider-rail,
.slider-lg:hover .slider-fill,
.slider-lg.slider-dragging .slider-rail,
.slider-lg.slider-dragging .slider-fill {
  height: 7px;
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .slider {
    gap: 12px;
  }
  
  .slider-track-wrapper {
    padding: 12px 0;
  }
  
  .slider-track {
    height: 10px;
  }
  
  .slider-rail,
  .slider-fill {
    height: 5px;
  }
  
  .slider:hover .slider-rail,
  .slider-dragging .slider-rail,
  .slider:hover .slider-fill,
  .slider-dragging .slider-fill {
    height: 7px;
  }
  
  .slider-handle {
    width: 20px;
    height: 20px;
  }
  
  .slider-handle:hover,
  .slider-handle-active,
  .slider-handle:active {
    transform: translate(-50%, -50%) scale(1.2);
  }
  
  .slider-tooltip {
    top: -40px;
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .slider-marks {
    top: 24px;
  }
  
  .slider-mark {
    font-size: 13px;
  }
  
  .slider-input-wrapper {
    width: 90px;
  }
  
  .slider-sm .slider-handle {
    width: 16px;
    height: 16px;
  }
  
  .slider-lg .slider-handle {
    width: 24px;
    height: 24px;
  }
}
</style>
