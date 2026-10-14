<template>
  <div
    ref="datePickerRef"
    :class="datePickerClass"
    @click="handleToggle"
    @keydown="handleKeydown"
    :tabindex="disabled ? -1 : 0"
    role="combobox"
    aria-haspopup="dialog"
    :aria-expanded="visible"
    :aria-disabled="disabled"
    :aria-label="ariaLabel"
    :aria-activedescendant="visible ? activeDescendantId : undefined"
    :aria-controls="visible ? dropdownId : undefined"
  >
    <div class="datepicker-selector">
      <span class="datepicker-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <span v-if="displayValue" class="datepicker-value">{{ displayValue }}</span>
      <span v-else class="datepicker-placeholder">{{ placeholder }}</span>
      <span v-if="clearable && hasValue && !disabled" class="datepicker-clear" @click.stop="handleClear">
        <svg viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="datepicker-arrow" :class="{ 'datepicker-arrow--open': visible }">
        <svg viewBox="0 0 12 12" fill="currentColor">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <Teleport to="body">
      <Transition name="datepicker-dropdown">
        <div
          v-if="visible"
          ref="dropdownRef"
          :id="dropdownId"
          class="datepicker-dropdown"
          :style="floatingBaseStyle"
          role="dialog"
          aria-modal="true"
          :aria-label="t('components.dataEntry.datePicker.selectDate')"
        >
          <div class="datepicker-header">
            <button type="button" class="datepicker-nav-btn" @click.stop="prevYear" :disabled="isPrevYearDisabled" :aria-label="t('components.dataEntry.datePicker.prevYear')">
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M9.5 1.5L4 6L9.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button type="button" class="datepicker-nav-btn" @click.stop="prevMonth" :disabled="isPrevMonthDisabled" :aria-label="t('components.dataEntry.datePicker.prevMonth')">
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="datepicker-header-title">
              <button type="button" class="datepicker-year-btn" @click.stop="showYearPanel = !showYearPanel">{{ currentYear }}{{ t('components.dataEntry.datePicker.yearSuffix') }}</button>
              <button type="button" class="datepicker-month-btn" @click.stop="showMonthPanel = !showMonthPanel">{{ currentMonth + 1 }}{{ t('components.dataEntry.datePicker.monthSuffix') }}</button>
            </div>
            <button type="button" class="datepicker-nav-btn" @click.stop="nextMonth" :disabled="isNextMonthDisabled" :aria-label="t('components.dataEntry.datePicker.nextMonth')">
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button type="button" class="datepicker-nav-btn" @click.stop="nextYear" :disabled="isNextYearDisabled" :aria-label="t('components.dataEntry.datePicker.nextYear')">
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M2.5 1.5L8 6L2.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <Transition name="datepicker-panel" mode="out-in">
            <div v-if="showYearPanel" class="datepicker-year-panel">
              <button
                v-for="year in yearOptions"
                :key="year"
                type="button"
                class="datepicker-year-item"
                :class="{ 'datepicker-year-item--selected': year === currentYear }"
                @click.stop="selectYear(year)"
              >
                {{ year }}
              </button>
            </div>
            <div v-else-if="showMonthPanel" class="datepicker-month-panel">
              <button
                v-for="(month, index) in monthNames"
                :key="index"
                type="button"
                class="datepicker-month-item"
                :class="{ 'datepicker-month-item--selected': index === currentMonth }"
                @click.stop="selectMonth(index)"
              >
                {{ month }}
              </button>
            </div>
            <div v-else class="datepicker-body">
              <div class="datepicker-weekdays">
                <span v-for="day in weekDays" :key="day" class="datepicker-weekday">{{ day }}</span>
              </div>
              <div class="datepicker-days">
                <button
                  v-for="(day, index) in calendarDays"
                  :key="index"
                  :id="getDayId(day.fullDate)"
                  type="button"
                  class="datepicker-day"
                  :class="{
                    'datepicker-day--other': day.otherMonth,
                    'datepicker-day--today': day.isToday,
                    'datepicker-day--selected': day.isSelected,
                    'datepicker-day--in-range': day.inRange,
                    'datepicker-day--range-start': day.isRangeStart,
                    'datepicker-day--range-end': day.isRangeEnd,
                    'datepicker-day--range-start-reverse': day.isRangeStart && hoverDirection === 'left',
                    'datepicker-day--range-end-reverse': day.isRangeEnd && hoverDirection === 'left',
                    'datepicker-day--range-start-hover': day.isRangeStart && isHoveringOnStartDate,
                    'datepicker-day--disabled': day.disabled
                  }"
                  :disabled="day.disabled"
                  :aria-current="day.isToday ? 'date' : undefined"
                  @click.stop="selectDate(day)"
                  @mouseenter="handleDayHover(day)"
                >
                  {{ day.date }}
                </button>
              </div>
            </div>
          </Transition>
          <div v-if="showFooter" class="datepicker-footer">
            <button type="button" class="datepicker-footer-btn" @click.stop="selectToday">{{ t('components.dataEntry.datePicker.today') }}</button>
            <button v-if="type === 'daterange'" type="button" class="datepicker-footer-btn datepicker-footer-btn--primary" @click.stop="confirmRange" :disabled="!rangeStart || !rangeEnd">{{ t('components.dataEntry.datePicker.confirm') }}</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
 * 日期选择器组件
 * @description 支持单日期选择、日期范围选择、年月选择等功能
 * 
 * @props {
 *   modelValue?: Date | string | [Date, Date] | null; // 绑定值，单日支持 ISO / yyyy-MM-dd 字符串
 *   type?: 'date' | 'daterange' | 'month' | 'year'; // 选择类型
 *   placeholder?: string; // 占位符
 *   disabled?: boolean; // 是否禁用
 *   clearable?: boolean; // 是否可清除
 *   size?: 'sm' | 'md' | 'lg'; // 尺寸
 *   format?: string; // 日期格式化
 *   minDate?: Date; // 最小日期
 *   maxDate?: Date; // 最大日期
 *   disabledDate?: (date: Date) => boolean; // 禁用日期函数
 *   showFooter?: boolean; // 是否显示底部按钮
 *   ariaLabel?: string; // 无障碍标签
 *   customClass?: string; // 自定义类名
 * }
 * 
 * @emits {
 *   'update:modelValue': [Date | [Date, Date] | null]; // 值更新事件
 *   'change': [Date | [Date, Date] | null]; // 选择变化事件
 *   'clear': []; // 清除事件
 *   'focus': []; // 聚焦事件
 *   'blur': []; // 失焦事件
 * }
 * 
 * @example
 * // 基本使用
 * <DatePicker v-model="date" />
 * 
 * // 日期范围选择
 * <DatePicker v-model="dateRange" type="daterange" />
 * 
 * // 带格式
 * <DatePicker v-model="date" format="yyyy/MM/dd" />
 */
import { computed, nextTick, ref, watch, onUnmounted, toRef } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import type { ComponentSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition } from '../composables/useFloatingPosition';
import { useComponentSize } from '../composables/useComponentSize';

const { uiT: t } = useUiT();

type DatePickerType = 'date' | 'daterange' | 'datetime' | 'datetimerange' | 'month' | 'year';
type DatePickerSize = ComponentSize;

/** 解析 Date 或 yyyy-MM-dd / ISO 字符串，避免时区偏移把日期打到前一天 */
function parseDateish(value: unknown): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const day = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (day) {
    const parsed = new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

interface Props {
  modelValue?: Date | string | [Date, Date] | null;
  type?: DatePickerType;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: DatePickerSize;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDate?: (date: Date) => boolean;
  showFooter?: boolean;
  ariaLabel?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  type: 'date',
  placeholder: '请选择日期',
  disabled: false,
  clearable: false,
  size: undefined,
  format: 'yyyy-MM-dd',
  minDate: undefined,
  maxDate: undefined,
  disabledDate: undefined,
  showFooter: false,
  ariaLabel: '日期选择器',
  customClass: '',
});

const resolvedSize = useComponentSize(toRef(props, 'size'));

const emit = defineEmits<{
  'update:modelValue': [Date | [Date, Date] | null];
  'change': [Date | [Date, Date] | null];
  'clear': [];
  'focus': [];
  'blur': [];
}>();

const datePickerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const visible = ref(false);
const floatingBaseStyle = { position: 'fixed' as const };

const floating = useFloatingPosition({
  reference: datePickerRef,
  floating: dropdownRef,
  placement: 'bottom-start',
  matchWidth: false,
  offsetPx: 4,
});
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const showYearPanel = ref(false);
const showMonthPanel = ref(false);
const rangeStart = ref<Date | null>(null);
const rangeEnd = ref<Date | null>(null);
const hoverDate = ref<Date | null>(null);
const hoverDirection = ref<'left' | 'right' | null>(null);
const activeDate = ref<Date | null>(null);
const dropdownId = useComponentId('datepicker-dropdown');

const isHoveringOnStartDate = computed(() => {
  if (!rangeStart.value || !hoverDate.value) return false;
  return hoverDate.value.toDateString() === rangeStart.value.toDateString();
});

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

const datePickerClass = computed(() => {
  const classes = ['datepicker', `datepicker--${resolvedSize.value}`];
  if (props.disabled) classes.push('datepicker--disabled');
  if (visible.value) classes.push('datepicker--focused');
  if (hasValue.value) classes.push('datepicker--has-value');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const selectedDate = computed(() =>
  Array.isArray(props.modelValue) ? null : parseDateish(props.modelValue),
);

const hasValue = computed(() => {
  if (props.type === 'daterange') {
    return Array.isArray(props.modelValue) && props.modelValue[0] && props.modelValue[1];
  }
  return selectedDate.value !== null;
});

const displayValue = computed(() => {
  if (props.type === 'daterange' && Array.isArray(props.modelValue)) {
    const [start, end] = props.modelValue;
    if (start && end) {
      return `${formatDate(start)} ~ ${formatDate(end)}`;
    }
    return '';
  }
  return selectedDate.value ? formatDate(selectedDate.value) : '';
});

const yearOptions = computed(() => {
  const year = currentYear.value;
  const startYear = Math.floor(year / 10) * 10 - 1;
  return Array.from({ length: 12 }, (_, i) => startYear + i);
});

const isPrevYearDisabled = computed(() => {
  if (!props.minDate) return false;
  return currentYear.value <= props.minDate.getFullYear();
});

const isNextYearDisabled = computed(() => {
  if (!props.maxDate) return false;
  return currentYear.value >= props.maxDate.getFullYear();
});

const isPrevMonthDisabled = computed(() => {
  if (!props.minDate) return false;
  return currentYear.value === props.minDate.getFullYear() && currentMonth.value <= props.minDate.getMonth();
});

const isNextMonthDisabled = computed(() => {
  if (!props.maxDate) return false;
  return currentYear.value === props.maxDate.getFullYear() && currentMonth.value >= props.maxDate.getMonth();
});

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Array<{
    date: number;
    fullDate: Date;
    otherMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    inRange: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
    disabled: boolean;
  }> = [];
  
  const startPadding = firstDay.getDay();
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date: prevMonthLastDay - i,
      fullDate: date,
      otherMonth: true,
      isToday: false,
      isSelected: isDateSelected(date),
      inRange: isDateInRange(date),
      isRangeStart: isRangeStartFunc(date),
      isRangeEnd: isRangeEndFunc(date),
      disabled: isDateDisabled(date),
    });
  }
  
  const today = new Date();
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({
      date: i,
      fullDate: date,
      otherMonth: false,
      isToday: date.toDateString() === today.toDateString(),
      isSelected: isDateSelected(date),
      inRange: isDateInRange(date),
      isRangeStart: isRangeStartFunc(date),
      isRangeEnd: isRangeEndFunc(date),
      disabled: isDateDisabled(date),
    });
  }
  
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date: i,
      fullDate: date,
      otherMonth: true,
      isToday: false,
      isSelected: isDateSelected(date),
      inRange: isDateInRange(date),
      isRangeStart: isRangeStartFunc(date),
      isRangeEnd: isRangeEndFunc(date),
      disabled: isDateDisabled(date),
    });
  }
  
  return days;
});

const getDayId = (date: Date): string => {
  return `datepicker-day-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const activeDescendantId = computed(() => {
  if (!activeDate.value) return undefined;
  return getDayId(activeDate.value);
});

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  let result = props.format;
  result = result.replace('yyyy', String(year));
  result = result.replace('MM', String(month).padStart(2, '0'));
  result = result.replace('M', String(month));
  result = result.replace('dd', String(day).padStart(2, '0'));
  result = result.replace('d', String(day));
  result = result.replace('HH', String(hours).padStart(2, '0'));
  result = result.replace('H', String(hours));
  result = result.replace('mm', String(minutes).padStart(2, '0'));
  result = result.replace('m', String(minutes));
  result = result.replace('ss', String(seconds).padStart(2, '0'));
  result = result.replace('s', String(seconds));
  
  return result;
};

const isDateSelected = (date: Date): boolean => {
  if (props.type === 'daterange') {
    // 当正在选择新范围时，只显示临时范围的开始日期为选中状态
    if (rangeStart.value && !rangeEnd.value) {
      return date.toDateString() === rangeStart.value.toDateString();
    }
    // 当没有正在选择的范围时，显示已选择的范围的开始和结束日期为选中状态
    else if (Array.isArray(props.modelValue)) {
      const [start, end] = props.modelValue;
      return (start && date.toDateString() === start.toDateString()) || 
             (end && date.toDateString() === end.toDateString());
    }
    return false;
  }
  return selectedDate.value !== null && date.toDateString() === selectedDate.value.toDateString();
};

const isDateInRange = (date: Date): boolean => {
  if (props.type !== 'daterange') return false;
  
  // 当正在选择新范围时，只显示临时范围
  if (rangeStart.value && !rangeEnd.value && hoverDate.value) {
    const dateTime = date.getTime();
    const tempStartTime = Math.min(rangeStart.value.getTime(), hoverDate.value.getTime());
    const tempEndTime = Math.max(rangeStart.value.getTime(), hoverDate.value.getTime());
    
    return dateTime > tempStartTime && dateTime < tempEndTime;
  }
  
  // 当没有正在选择的范围时，显示已选择的范围
  if (Array.isArray(props.modelValue)) {
    const [start, end] = props.modelValue;
    if (start && end) {
      const dateTime = date.getTime();
      const startTime = start.getTime();
      const endTime = end.getTime();
      
      return dateTime > Math.min(startTime, endTime) && dateTime < Math.max(startTime, endTime);
    }
  }
  
  return false;
};

const isRangeStartFunc = (date: Date): boolean => {
  if (props.type !== 'daterange') return false;

  // 当正在选择新范围时，只把开始日期标记为 range-start
  if (rangeStart.value && !rangeEnd.value) {
    return date.toDateString() === rangeStart.value.toDateString();
  }
  // 当没有正在选择的范围时，显示已选择的范围开始
  else if (Array.isArray(props.modelValue) && props.modelValue[0]) {
    return date.toDateString() === props.modelValue[0].toDateString();
  }

  return false;
};

const isRangeEndFunc = (date: Date): boolean => {
  if (props.type !== 'daterange') return false;

  // 当正在选择新范围时，只把悬停日期标记为 range-end
  if (rangeStart.value && !rangeEnd.value && hoverDate.value) {
    return date.toDateString() === hoverDate.value.toDateString();
  }
  // 当没有正在选择的范围时，显示已选择的范围结束
  else if (Array.isArray(props.modelValue) && props.modelValue[1]) {
    return date.toDateString() === props.modelValue[1].toDateString();
  }

  return false;
};

const isDateDisabled = (date: Date): boolean => {
  if (props.disabledDate && props.disabledDate(date)) return true;
  if (props.minDate && date < props.minDate) return true;
  if (props.maxDate && date > props.maxDate) return true;
  return false;
};

const handleToggle = () => {
  if (props.disabled) return;
  visible.value = !visible.value;
  
  if (visible.value) {
    initCurrentDate();
    emit('focus');
  } else {
    showYearPanel.value = false;
    showMonthPanel.value = false;
    emit('blur');
  }
};

const initCurrentDate = () => {
  if (props.modelValue) {
    if (props.type === 'daterange' && Array.isArray(props.modelValue)) {
      const [start, end] = props.modelValue;
      if (start) {
        currentYear.value = start.getFullYear();
        currentMonth.value = start.getMonth();
        rangeStart.value = start;
        rangeEnd.value = end || null;
        activeDate.value = new Date(start);
      }
    } else if (selectedDate.value) {
      currentYear.value = selectedDate.value.getFullYear();
      currentMonth.value = selectedDate.value.getMonth();
      activeDate.value = new Date(selectedDate.value);
    }
  } else {
    activeDate.value = new Date(currentYear.value, currentMonth.value, 1);
  }
};

const selectDate = (day: { fullDate: Date; disabled: boolean }) => {
  if (day.disabled) return;
  activeDate.value = new Date(day.fullDate);
  
  if (props.type === 'daterange') {
    if (!rangeStart.value) {
      // 开始选择新的范围
      rangeStart.value = day.fullDate;
      rangeEnd.value = null;
    } else if (!rangeEnd.value) {
      // 完成选择新的范围
      if (day.fullDate < rangeStart.value) {
        rangeEnd.value = rangeStart.value;
        rangeStart.value = day.fullDate;
      } else {
        rangeEnd.value = day.fullDate;
      }
      if (!props.showFooter) {
        emit('update:modelValue', [rangeStart.value, rangeEnd.value]);
        emit('change', [rangeStart.value, rangeEnd.value]);
        visible.value = false;
        // 重置临时范围状态
        rangeStart.value = null;
        rangeEnd.value = null;
        hoverDate.value = null;
        hoverDirection.value = null;
      }
    } else {
      // 重新开始选择新的范围
      rangeStart.value = day.fullDate;
      rangeEnd.value = null;
    }
  } else {
    emit('update:modelValue', day.fullDate);
    emit('change', day.fullDate);
    visible.value = false;
  }
};

const handleDayHover = (day: { fullDate: Date }) => {
  activeDate.value = new Date(day.fullDate);
  if (props.type === 'daterange' && rangeStart.value && !rangeEnd.value) {
    hoverDate.value = day.fullDate;
    // 只有悬停在其他日期（不是开始日期本身）时才记录方向
    if (day.fullDate.toDateString() !== rangeStart.value.toDateString()) {
      hoverDirection.value = day.fullDate < rangeStart.value ? 'left' : 'right';
    } else {
      hoverDirection.value = null;
    }
  }
};

const selectYear = (year: number) => {
  currentYear.value = year;
  showYearPanel.value = false;
};

const selectMonth = (month: number) => {
  currentMonth.value = month;
  showMonthPanel.value = false;
};

const prevYear = () => {
  if (isPrevYearDisabled.value) return;
  currentYear.value--;
};

const nextYear = () => {
  if (isNextYearDisabled.value) return;
  currentYear.value++;
};

const prevMonth = () => {
  if (isPrevMonthDisabled.value) return;
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (isNextMonthDisabled.value) return;
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const selectToday = () => {
  const today = new Date();
  if (props.type === 'daterange') {
    rangeStart.value = today;
    rangeEnd.value = today;
    emit('update:modelValue', [today, today]);
    emit('change', [today, today]);
  } else {
    emit('update:modelValue', today);
    emit('change', today);
  }
  visible.value = false;
};

const getKeyboardAnchorDate = (): Date => {
  if (props.type === 'daterange') {
    if (rangeStart.value && !rangeEnd.value) return new Date(rangeStart.value);
    if (Array.isArray(props.modelValue) && props.modelValue[0]) return new Date(props.modelValue[0]);
  } else if (selectedDate.value) {
    return new Date(selectedDate.value);
  }
  return new Date(currentYear.value, currentMonth.value, 1);
};

const selectDateFromKeyboard = (date: Date) => {
  currentYear.value = date.getFullYear();
  currentMonth.value = date.getMonth();
  activeDate.value = new Date(date);
  if (isDateDisabled(date)) return;
  if (props.type === 'daterange') {
    selectDate({ fullDate: date, disabled: false });
    return;
  }
  emit('update:modelValue', date);
  emit('change', date);
};

const confirmRange = () => {
  if (rangeStart.value && rangeEnd.value) {
    emit('update:modelValue', [rangeStart.value, rangeEnd.value]);
    emit('change', [rangeStart.value, rangeEnd.value]);
    visible.value = false;
    // 重置临时范围状态
    rangeStart.value = null;
    rangeEnd.value = null;
    hoverDate.value = null;
    hoverDirection.value = null;
  }
};

const handleClear = () => {
  rangeStart.value = null;
  rangeEnd.value = null;
  hoverDate.value = null;
  hoverDirection.value = null;
  emit('update:modelValue', null);
  emit('change', null);
  emit('clear');
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  const canNavigateDay = visible.value && !showYearPanel.value && !showMonthPanel.value;
  
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleToggle();
      break;
    case 'Escape':
      if (visible.value) {
        visible.value = false;
        showYearPanel.value = false;
        showMonthPanel.value = false;
        emit('blur');
        nextTick(() => {
          datePickerRef.value?.focus();
        });
      }
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (!visible.value) {
        handleToggle();
      } else if (canNavigateDay) {
        const anchor = getKeyboardAnchorDate();
        anchor.setDate(anchor.getDate() + 7);
        selectDateFromKeyboard(anchor);
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (!visible.value) {
        handleToggle();
      } else if (canNavigateDay) {
        const anchor = getKeyboardAnchorDate();
        anchor.setDate(anchor.getDate() - 7);
        selectDateFromKeyboard(anchor);
      }
      break;
    case 'ArrowLeft':
      event.preventDefault();
      if (canNavigateDay) {
        const anchor = getKeyboardAnchorDate();
        anchor.setDate(anchor.getDate() - 1);
        selectDateFromKeyboard(anchor);
      }
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (canNavigateDay) {
        const anchor = getKeyboardAnchorDate();
        anchor.setDate(anchor.getDate() + 1);
        selectDateFromKeyboard(anchor);
      }
      break;
    case 'Home':
      event.preventDefault();
      if (canNavigateDay) {
        const anchor = getKeyboardAnchorDate();
        anchor.setDate(1);
        selectDateFromKeyboard(anchor);
      }
      break;
    case 'End':
      event.preventDefault();
      if (canNavigateDay) {
        const anchor = getKeyboardAnchorDate();
        anchor.setMonth(anchor.getMonth() + 1, 0);
        selectDateFromKeyboard(anchor);
      }
      break;
    case 'PageUp':
      event.preventDefault();
      if (visible.value) {
        if (event.shiftKey) {
          prevYear();
        } else {
          prevMonth();
        }
      }
      break;
    case 'PageDown':
      event.preventDefault();
      if (visible.value) {
        if (event.shiftKey) {
          nextYear();
        } else {
          nextMonth();
        }
      }
      break;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (
    datePickerRef.value?.contains(target) ||
    dropdownRef.value?.contains(target)
  ) {
    return;
  }
  visible.value = false;
  showYearPanel.value = false;
  showMonthPanel.value = false;
  rangeStart.value = null;
  rangeEnd.value = null;
  hoverDate.value = null;
  hoverDirection.value = null;
  emit('blur');
  nextTick(() => {
    datePickerRef.value?.focus();
  });
};

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

watch(() => props.modelValue, () => {
  initCurrentDate();
}, { deep: true });

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

defineExpose({
  focus: () => datePickerRef.value?.focus(),
  blur: () => { visible.value = false; },
});
</script>

<style scoped>
.datepicker {
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  outline: none;
}

.datepicker-selector {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 12px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: border-color var(--duration-normal) var(--ease-standard),
              box-shadow var(--duration-normal) var(--ease-standard);
}

.datepicker:hover:not(.datepicker--disabled) .datepicker-selector {
  border-color: hsl(var(--border-hover));
}

.datepicker--focused .datepicker-selector {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.datepicker--disabled {
  cursor: not-allowed;
}

.datepicker--disabled .datepicker-selector {
  opacity: 0.5;
  cursor: not-allowed;
  background: hsl(var(--surface-container-high));
}

.datepicker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
}

.datepicker-icon svg {
  width: 16px;
  height: 16px;
}

.datepicker-value {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.datepicker-placeholder {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.datepicker-clear {
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
  transition: color var(--duration-fast) var(--ease-standard);
}

.datepicker-clear:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-container-high));
}

.datepicker-clear svg {
  width: 10px;
  height: 10px;
}

.datepicker-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.datepicker-arrow--open {
  transform: rotate(180deg);
}

.datepicker-arrow svg {
  width: 12px;
  height: 12px;
  color: hsl(var(--text-muted));
}

.datepicker-dropdown {
  z-index: var(--z-dropdown);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  padding: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.datepicker-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-fast) var(--ease-standard),
              color var(--duration-fast) var(--ease-standard);
}

.datepicker-nav-btn:hover:not(:disabled) {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text));
}

.datepicker-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.datepicker-nav-btn svg {
  width: 12px;
  height: 12px;
}

.datepicker-header-title {
  display: flex;
  align-items: center;
  gap: 4px;
}

.datepicker-year-btn,
.datepicker-month-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text));
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard);
}

.datepicker-year-btn:hover,
.datepicker-month-btn:hover {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.datepicker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.datepicker-weekday {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--text-muted));
}

.datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.datepicker-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: hsl(var(--text));
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.datepicker-day:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
}

.datepicker-day--other {
  color: hsl(var(--text-muted) / 0.5);
}

.datepicker-day--today {
  font-weight: 600;
  color: hsl(var(--primary));
}

.datepicker-day--today::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: hsl(var(--primary));
  border-radius: 50%;
}

.datepicker-day--selected {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.datepicker-day--selected:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
}

.datepicker-day--in-range {
  background: hsl(var(--primary) / 0.2);
  border-radius: 0;
  font-weight: 500;
}

.datepicker-day--in-range:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.3);
}

.datepicker-day--range-start {
  border-radius: 8px 0 0 8px;
  background: hsl(var(--primary));
  color: hsl(var(--surface));
  font-weight: 600;
}

/* ===== 范围开始日期样式 ===== */
.datepicker-day--range-start {
  background: hsl(var(--primary));
  color: hsl(var(--surface));
  font-weight: 600;
}

/* 正向选择（从左到右）：开始日期左侧圆角 */
.datepicker-day--range-start:not(.datepicker-day--range-start-reverse) {
  border-radius: 8px 0 0 8px;
}

/* 反向选择（从右到左）：开始日期右侧圆角 */
.datepicker-day--range-start-reverse {
  border-radius: 0 8px 8px 0 !important;
}

/* 悬停在开始日期本身上时显示全圆角 */
.datepicker-day--range-start-hover,
.datepicker-day--range-start-hover.datepicker-day--range-end-reverse {
  border-radius: 8px !important;
}

/* 开始日期悬停效果 - 方向性圆角（当悬停在其他日期时） */
.datepicker-day--range-start:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
}

/* ===== 范围结束日期样式 ===== */
.datepicker-day--range-end {
  background: hsl(var(--primary));
  color: hsl(var(--surface));
  font-weight: 600;
}

/* 正向选择（从左到右）：结束日期右侧圆角 */
.datepicker-day--range-end:not(.datepicker-day--range-end-reverse) {
  border-radius: 0 8px 8px 0;
}

/* 反向选择（从右到左）：结束日期左侧圆角 */
.datepicker-day--range-end-reverse {
  border-radius: 8px 0 0 8px !important;
}

/* 结束日期悬停效果 */
.datepicker-day--range-end:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
}

/* 悬停时保持方向性圆角 - 正向 */
.datepicker-day--range-end:not(.datepicker-day--range-end-reverse):hover:not(:disabled) {
  border-radius: 0 8px 8px 0;
}

/* 悬停时保持方向性圆角 - 反向 */
.datepicker-day--range-end-reverse:hover:not(:disabled) {
  border-radius: 8px 0 0 8px !important;
}

/* ===== 同一天的情况（开始和结束是同一天）===== */
.datepicker-day--range-start.datepicker-day--range-end {
  border-radius: 8px;
}

.datepicker-day--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.datepicker-year-panel,
.datepicker-month-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 8px 0;
}

.datepicker-year-item,
.datepicker-month-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: hsl(var(--text));
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-standard),
              color var(--duration-fast) var(--ease-standard);
}

.datepicker-year-item:hover,
.datepicker-month-item:hover {
  background: hsl(var(--surface-hover));
}

.datepicker-year-item--selected,
.datepicker-month-item--selected {
  background: hsl(var(--primary));
  color: hsl(var(--surface));
  font-weight: 600;
}

.datepicker-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid hsl(var(--border));
}

.datepicker-footer-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  font-size: 13px;
  color: hsl(var(--text));
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.datepicker-footer-btn:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.datepicker-footer-btn--primary {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--surface));
}

.datepicker-footer-btn--primary:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
}

.datepicker-footer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.datepicker--sm .datepicker-selector {
  min-height: 32px;
  padding: 4px 10px;
}

.datepicker--sm .datepicker-value,
.datepicker--sm .datepicker-placeholder {
  font-size: 13px;
}

.datepicker--lg .datepicker-selector {
  min-height: 48px;
  padding: 8px 14px;
}

.datepicker--lg .datepicker-value,
.datepicker--lg .datepicker-placeholder {
  font-size: 16px;
}

.datepicker-dropdown-enter-active,
.datepicker-dropdown-leave-active {
  transition: opacity var(--duration-fast) var(--ease-standard),
              transform var(--duration-fast) var(--ease-out-expo);
}

.datepicker-dropdown-enter-from,
.datepicker-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.datepicker-panel-enter-active,
.datepicker-panel-leave-active {
  transition: opacity var(--duration-fast) var(--ease-standard),
              transform var(--duration-fast) var(--ease-out-expo);
}

.datepicker-panel-enter-from,
.datepicker-panel-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .datepicker-selector {
    min-height: 44px;
  }
  
  .datepicker-value,
  .datepicker-placeholder {
    font-size: var(--font-size-sm);
  }
  
  .datepicker--sm .datepicker-value,
  .datepicker--sm .datepicker-placeholder {
    font-size: var(--font-size-sm);
  }
  
  .datepicker--lg .datepicker-value,
  .datepicker--lg .datepicker-placeholder {
    font-size: var(--font-size-sm);
  }
  
  .datepicker-dropdown {
    width: 90vw !important;
    max-width: 320px;
    margin: 0 auto;
    left: 50% !important;
    transform: translateX(-50%);
    border-radius: 12px;
    padding: 12px;
  }
  
  .datepicker-day {
    height: 36px;
    width: 36px;
    font-size: var(--font-size-sm);
  }
  
  .datepicker-weekday {
    height: 36px;
    font-size: 13px;
  }
  
  .datepicker-year-item,
  .datepicker-month-item {
    height: 44px;
    font-size: var(--font-size-sm);
  }
  
  .datepicker-footer-btn {
    padding: 8px 16px;
    font-size: var(--font-size-sm);
  }
  
  .datepicker-header-title {
    gap: 8px;
  }
  
  .datepicker-year-btn,
  .datepicker-month-btn {
    font-size: var(--font-size-sm);
  }
  
  .datepicker-nav-btn {
    width: 32px;
    height: 32px;
  }
  
  .datepicker-nav-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .datepicker-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .datepicker-arrow svg {
    width: 14px;
    height: 14px;
  }
  
  .datepicker-clear svg {
    width: 12px;
    height: 12px;
  }
}
</style>
