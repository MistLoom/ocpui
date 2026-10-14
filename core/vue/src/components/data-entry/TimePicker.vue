&lt;!--
TimePicker 组件

功能：提供一个时间选择器，支持小时、分钟、秒的选择，可自定义步长和格式

Props:
- modelValue: string | Date | null - 绑定的值，默认 null
- placeholder: string - 占位符文本，默认 '请选择时间'
- disabled: boolean - 是否禁用，默认 false
- clearable: boolean - 是否可清除，默认 false
- size: 'sm' | 'md' | 'lg' - 尺寸，默认 'md'
- format: string - 时间格式，默认 'HH:mm:ss'
- showSeconds: boolean - 是否显示秒，默认 false
- showFooter: boolean - 是否显示底部按钮，默认 false
- hourStep: number - 小时步长，默认 1
- minuteStep: number - 分钟步长，默认 1
- secondStep: number - 秒步长，默认 1
- minTime: string - 最小时间
- maxTime: string - 最大时间
- ariaLabel: string - ARIA 标签，默认 '时间选择器'
- customClass: string - 自定义类名

Events:
- update:modelValue: (string | null) - 值变化时触发
- change: (string | null) - 值变化时触发
- clear: () - 清除时触发
- focus: () - 聚焦时触发
- blur: () - 失焦时触发

Methods:
- focus() - 聚焦到时间选择器
- blur() - 失焦时间选择器

使用示例：
&lt;TimePicker v-model="time" /&gt;
&lt;TimePicker v-model="time" showSeconds showFooter /&gt;
&lt;TimePicker v-model="time" size="sm" disabled /&gt;
&lt;TimePicker v-model="time" :hourStep="2" :minuteStep="5" /&gt;
--&gt;
<template>
  <div
    ref="timePickerRef"
    :class="timePickerClass"
    @click="handleToggle"
    @keydown="handleKeydown"
    tabindex="0"
    role="combobox"
    :aria-expanded="visible"
    :aria-disabled="disabled"
    :aria-label="ariaLabel"
    :aria-haspopup="'dialog'"
    :aria-controls="visible ? dropdownId : undefined"
  >
    <div class="timepicker-selector">
      <span class="timepicker-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </span>
      <span v-if="displayValue" class="timepicker-value">{{ displayValue }}</span>
      <span v-else class="timepicker-placeholder">{{ placeholder }}</span>
      <button
        v-if="clearable && hasValue && !disabled"
        type="button"
        class="timepicker-clear"
        @click.stop="handleClear"
        :aria-label="t('components.dataEntry.timePicker.clear')"
      >
        <svg viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <span class="timepicker-arrow" :class="{ 'timepicker-arrow--open': visible }" aria-hidden="true">
        <svg viewBox="0 0 12 12" fill="currentColor">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <Teleport to="body">
      <Transition name="timepicker-dropdown">
        <div
          v-if="visible"
          ref="dropdownRef"
          :id="dropdownId"
          class="timepicker-dropdown"
          :style="floatingBaseStyle"
          role="dialog"
          aria-modal="true"
          :aria-label="t('components.dataEntry.timePicker.selectTime')"
          @keydown="handleDropdownKeydown"
        >
          <div class="timepicker-panel">
            <div class="timepicker-column" ref="hourColumnRef">
              <div class="timepicker-column-header">{{ t('components.dataEntry.timePicker.hourLabel') }}</div>
              <div class="timepicker-column-body">
                <button
                  v-for="hour in hourOptions"
                  :key="hour"
                  type="button"
                  class="timepicker-option"
                  :class="{ 'timepicker-option--selected': hour === selectedHour }"
                  @click.stop="selectHour(hour)"
                  :aria-selected="hour === selectedHour"
                  :tabindex="-1"
                >
                  {{ hour.toString().padStart(2, '0') }}
                </button>
              </div>
            </div>
            <div class="timepicker-separator" aria-hidden="true">:</div>
            <div class="timepicker-column" ref="minuteColumnRef">
              <div class="timepicker-column-header">{{ t('components.dataEntry.timePicker.minuteLabel') }}</div>
              <div class="timepicker-column-body">
                <button
                  v-for="minute in minuteOptions"
                  :key="minute"
                  type="button"
                  class="timepicker-option"
                  :class="{ 'timepicker-option--selected': minute === selectedMinute }"
                  @click.stop="selectMinute(minute)"
                  :aria-selected="minute === selectedMinute"
                  :tabindex="-1"
                >
                  {{ minute.toString().padStart(2, '0') }}
                </button>
              </div>
            </div>
            <div v-if="showSeconds" class="timepicker-separator" aria-hidden="true">:</div>
            <div v-if="showSeconds" class="timepicker-column" ref="secondColumnRef">
              <div class="timepicker-column-header">{{ t('components.dataEntry.timePicker.secondLabel') }}</div>
              <div class="timepicker-column-body">
                <button
                  v-for="second in secondOptions"
                  :key="second"
                  type="button"
                  class="timepicker-option"
                  :class="{ 'timepicker-option--selected': second === selectedSecond }"
                  @click.stop="selectSecond(second)"
                  :aria-selected="second === selectedSecond"
                  :tabindex="-1"
                >
                  {{ second.toString().padStart(2, '0') }}
                </button>
              </div>
            </div>
          </div>
          <div v-if="showFooter" class="timepicker-footer">
            <button type="button" class="timepicker-footer-btn" @click.stop="selectNow" :aria-label="t('components.dataEntry.timePicker.selectNow')">{{ t('components.dataEntry.timePicker.now') }}</button>
            <button type="button" class="timepicker-footer-btn timepicker-footer-btn--primary" @click.stop="confirmTime" :aria-label="t('components.dataEntry.timePicker.confirmSelection')">{{ t('components.dataEntry.timePicker.confirm') }}</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch, toRef } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import type { ComponentSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition } from '../composables/useFloatingPosition';
import { useComponentSize } from '../composables/useComponentSize';

const { uiT: t } = useUiT();

type TimePickerSize = ComponentSize;

interface Props {
  modelValue?: string | Date | null;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: TimePickerSize;
  format?: string;
  showSeconds?: boolean;
  showFooter?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  minTime?: string;
  maxTime?: string;
  ariaLabel?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: '请选择时间',
  disabled: false,
  clearable: false,
  size: undefined,
  format: 'HH:mm:ss',
  showSeconds: false,
  showFooter: false,
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  minTime: undefined,
  maxTime: undefined,
  ariaLabel: '时间选择器',
  customClass: '',
});

const resolvedSize = useComponentSize(toRef(props, 'size'));

const emit = defineEmits<{
  'update:modelValue': [string | null];
  'change': [string | null];
  'clear': [];
  'focus': [];
  'blur': [];
}>();

const timePickerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const dropdownId = useComponentId('timepicker-dropdown');
const hourColumnRef = ref<HTMLElement>();
const minuteColumnRef = ref<HTMLElement>();
const secondColumnRef = ref<HTMLElement>();
const visible = ref(false);
const floatingBaseStyle = { position: 'fixed' as const };

const floating = useFloatingPosition({
  reference: timePickerRef,
  floating: dropdownRef,
  placement: 'bottom-start',
  matchWidth: false,
  offsetPx: 4,
});
const selectedHour = ref(0);
const selectedMinute = ref(0);
const selectedSecond = ref(0);

const normalizedHourStep = computed(() => {
  const step = Number(props.hourStep);
  return Number.isFinite(step) && step > 0 ? step : 1;
});
const normalizedMinuteStep = computed(() => {
  const step = Number(props.minuteStep);
  return Number.isFinite(step) && step > 0 ? step : 1;
});
const normalizedSecondStep = computed(() => {
  const step = Number(props.secondStep);
  return Number.isFinite(step) && step > 0 ? step : 1;
});

const timePickerClass = computed(() => {
  const classes = ['timepicker', `timepicker--${resolvedSize.value}`];
  if (props.disabled) classes.push('timepicker--disabled');
  if (visible.value) classes.push('timepicker--focused');
  if (hasValue.value) classes.push('timepicker--has-value');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const hasValue = computed(() => props.modelValue !== null && props.modelValue !== undefined);

const displayValue = computed(() => {
  if (!props.modelValue) return '';
  
  if (props.modelValue instanceof Date) {
    const hour = props.modelValue.getHours().toString().padStart(2, '0');
    const minute = props.modelValue.getMinutes().toString().padStart(2, '0');
    const second = props.modelValue.getSeconds().toString().padStart(2, '0');
    
    if (props.showSeconds) {
      return `${hour}:${minute}:${second}`;
    }
    return `${hour}:${minute}`;
  }
  
  const parts = props.modelValue.split(':');
  if (parts.length >= 2) {
    const hour = parts[0];
    const minute = parts[1];
    const second = parts[2] || '00';
    
    if (props.showSeconds) {
      return `${hour}:${minute}:${second}`;
    }
    return `${hour}:${minute}`;
  }
  
  return props.modelValue;
});

const hourOptions = computed(() => {
  const hours: number[] = [];
  for (let i = 0; i < 24; i += normalizedHourStep.value) {
    hours.push(i);
  }
  return hours;
});

const minuteOptions = computed(() => {
  const minutes: number[] = [];
  for (let i = 0; i < 60; i += normalizedMinuteStep.value) {
    minutes.push(i);
  }
  return minutes;
});

const secondOptions = computed(() => {
  const seconds: number[] = [];
  for (let i = 0; i < 60; i += normalizedSecondStep.value) {
    seconds.push(i);
  }
  return seconds;
});

const parseTime = (time: string | Date | null | undefined) => {
  if (!time) {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() };
  }
  
  if (time instanceof Date) {
    return {
      hour: time.getHours(),
      minute: time.getMinutes(),
      second: time.getSeconds(),
    };
  }
  
  const parts = time.split(':');
  return {
    hour: parseInt(parts[0]) || 0,
    minute: parseInt(parts[1]) || 0,
    second: parseInt(parts[2]) || 0,
  };
};

const formatTime = (hour: number, minute: number, second: number): string => {
  if (props.showSeconds) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  }
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const handleToggle = () => {
  if (props.disabled) return;
  visible.value = !visible.value;
  
  if (visible.value) {
    initTime();
    emit('focus');
    nextTick(() => {
      scrollToSelected();
    });
  } else {
    emit('blur');
  }
};

const initTime = () => {
  const { hour, minute, second } = parseTime(props.modelValue);
  selectedHour.value = hour;
  selectedMinute.value = minute;
  selectedSecond.value = second;
};

const scrollToSelected = () => {
  const scrollToOption = (column: HTMLElement | undefined, index: number, step: number) => {
    if (!column) return;
    const optionHeight = 32;
    const scrollTop = (index / step) * optionHeight - 64;
    column.querySelector('.timepicker-column-body')?.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  };
  
  scrollToOption(hourColumnRef.value, selectedHour.value, normalizedHourStep.value);
  scrollToOption(minuteColumnRef.value, selectedMinute.value, normalizedMinuteStep.value);
  scrollToOption(secondColumnRef.value, selectedSecond.value, normalizedSecondStep.value);
};

const selectHour = (hour: number) => {
  selectedHour.value = hour;
  if (!props.showFooter) {
    emitChange();
  }
};

const selectMinute = (minute: number) => {
  selectedMinute.value = minute;
  if (!props.showFooter) {
    emitChange();
  }
};

const selectSecond = (second: number) => {
  selectedSecond.value = second;
  if (!props.showFooter) {
    emitChange();
  }
};

const selectNow = () => {
  const now = new Date();
  selectedHour.value = now.getHours();
  selectedMinute.value = now.getMinutes();
  selectedSecond.value = now.getSeconds();
  emitChange();
  visible.value = false;
};

const confirmTime = () => {
  emitChange();
  visible.value = false;
};

const emitChange = () => {
  const time = formatTime(selectedHour.value, selectedMinute.value, selectedSecond.value);
  emit('update:modelValue', time);
  emit('change', time);
};

const handleClear = () => {
  emit('update:modelValue', null);
  emit('change', null);
  emit('clear');
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleToggle();
      break;
    case 'Escape':
      if (visible.value) {
        visible.value = false;
        emit('blur');
        nextTick(() => {
          timePickerRef.value?.focus();
        });
      }
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (!visible.value) handleToggle();
      break;
  }
};

const handleDropdownKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      visible.value = false;
      emit('blur');
      nextTick(() => {
        timePickerRef.value?.focus();
      });
      break;
    case 'Enter':
      event.preventDefault();
      confirmTime();
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      event.preventDefault();
      // 可以添加键盘导航逻辑，在时间选项之间移动
      break;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (
    timePickerRef.value &&
    !timePickerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    visible.value = false;
    emit('blur');
    nextTick(() => {
      timePickerRef.value?.focus();
    });
  }
};

// 监听外部值变化
watch(() => props.modelValue, () => {
  if (!visible.value) {
    initTime();
  }
});

watch(visible, (val) => {
  if (val) {
    document.addEventListener('click', handleClickOutside);
    nextTick(() => {
      floating.start();
    });
  } else {
    document.removeEventListener('click', handleClickOutside);
    floating.stop();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

defineExpose({
  focus: () => timePickerRef.value?.focus(),
  blur: () => { visible.value = false; },
});
</script>

<style scoped>
.timepicker {
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  outline: none;
}

.timepicker-selector {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 12px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.timepicker:hover:not(.timepicker--disabled) .timepicker-selector {
  border-color: hsl(var(--border-hover));
}

.timepicker--focused .timepicker-selector {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.timepicker--disabled {
  cursor: not-allowed;
}

.timepicker--disabled .timepicker-selector {
  opacity: 0.5;
  cursor: not-allowed;
  background: hsl(var(--surface-container-high));
}

.timepicker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
}

.timepicker-icon svg {
  width: 16px;
  height: 16px;
}

.timepicker-value {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text));
  font-variant-numeric: tabular-nums;
}

.timepicker-placeholder {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.timepicker-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  margin-right: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.timepicker-clear:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-container-high));
}

.timepicker-clear svg {
  width: 10px;
  height: 10px;
}

.timepicker-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.timepicker-arrow--open {
  transform: rotate(180deg);
}

.timepicker-arrow svg {
  width: 12px;
  height: 12px;
  color: hsl(var(--text-muted));
}

.timepicker-dropdown {
  z-index: var(--z-dropdown);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  padding: 16px;
  min-width: 200px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.timepicker-panel {
  display: flex;
  align-items: stretch;
  gap: 4px;
}

.timepicker-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.timepicker-column-header {
  padding: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--text-muted));
  border-bottom: 1px solid hsl(var(--border));
}

.timepicker-column-body {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px 0;
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}

.timepicker-column-body::-webkit-scrollbar {
  width: 4px;
}

.timepicker-column-body::-webkit-scrollbar-track {
  background: transparent;
}

.timepicker-column-body::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 2px;
}

.timepicker-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: hsl(var(--text));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.timepicker-option:hover {
  background: hsl(var(--surface-hover));
}

.timepicker-option--selected {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  font-weight: 600;
}

.timepicker-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: hsl(var(--text-muted));
  padding: 0 4px;
}

.timepicker-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid hsl(var(--border));
}

.timepicker-footer-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  font-size: 13px;
  color: hsl(var(--text));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.timepicker-footer-btn:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.timepicker-footer-btn--primary {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: white;
}

.timepicker-footer-btn--primary:hover {
  background: hsl(var(--primary) / 0.9);
}

.timepicker--sm .timepicker-selector {
  min-height: 32px;
  padding: 4px 10px;
}

.timepicker--sm .timepicker-value,
.timepicker--sm .timepicker-placeholder {
  font-size: 13px;
}

.timepicker--lg .timepicker-selector {
  min-height: 48px;
  padding: 8px 14px;
}

.timepicker--lg .timepicker-value,
.timepicker--lg .timepicker-placeholder {
  font-size: 16px;
}

.timepicker-dropdown-enter-active,
.timepicker-dropdown-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.timepicker-dropdown-enter-from,
.timepicker-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .timepicker-selector {
    min-height: 44px;
  }
  
  .timepicker-value,
  .timepicker-placeholder {
    font-size: var(--font-size-sm);
  }
  
  .timepicker--sm .timepicker-value,
  .timepicker--sm .timepicker-placeholder {
    font-size: var(--font-size-sm);
  }
  
  .timepicker--lg .timepicker-value,
  .timepicker--lg .timepicker-placeholder {
    font-size: var(--font-size-sm);
  }
  
  .timepicker-dropdown {
    width: 90vw !important;
    max-width: 280px;
    margin: 0 auto;
    left: 50% !important;
    transform: translateX(-50%);
    border-radius: 12px;
    padding: 12px;
  }
  
  .timepicker-option {
    height: 36px;
    font-size: var(--font-size-sm);
  }
  
  .timepicker-column-header {
    font-size: 13px;
    padding: 10px;
  }
  
  .timepicker-column-body {
    max-height: 220px;
  }
  
  .timepicker-separator {
    font-size: 24px;
  }
  
  .timepicker-footer-btn {
    padding: 8px 16px;
    font-size: var(--font-size-sm);
  }
  
  .timepicker-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .timepicker-arrow svg {
    width: 14px;
    height: 14px;
  }
  
  .timepicker-clear svg {
    width: 12px;
    height: 12px;
  }
}
</style>
