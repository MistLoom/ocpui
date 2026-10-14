<template>
  <div
    ref="dateRangePickerRef"
    :class="dateRangePickerClass"
    @click="handleToggle"
    @keydown="handleKeydown"
    :tabindex="disabled ? -1 : 0"
    role="combobox"
    aria-haspopup="dialog"
    :aria-expanded="visible"
    :aria-disabled="disabled"
    :aria-label="ariaLabel"
    :aria-controls="visible ? dropdownId : undefined"
  >
    <div class="daterange-selector">
      <span class="daterange-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <span v-if="displayValue" class="daterange-value">{{ displayValue }}</span>
      <span v-else class="daterange-placeholder">{{ placeholder }}</span>
      <span v-if="clearable && hasValue && !disabled" class="daterange-clear" @click.stop="handleClear">
        <svg viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="daterange-arrow" :class="{ 'daterange-arrow--open': visible }">
        <svg viewBox="0 0 12 12" fill="currentColor">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <Teleport to="body">
      <Transition name="daterange-dropdown">
        <div
          v-if="visible"
          ref="dropdownRef"
          :id="dropdownId"
          class="daterange-dropdown"
          :style="floatingBaseStyle"
          role="dialog"
          aria-modal="true"
          :aria-label="t('components.dataEntry.dateRangePicker.selectDateRange')"
          @click.stop
        >
          <!-- 快捷选项 -->
          <div v-if="showShortcuts && shortcuts.length > 0" class="daterange-shortcuts">
            <button
              v-for="shortcut in shortcuts"
              :key="shortcut.key"
              type="button"
              class="daterange-shortcut-btn"
              :class="{ 'daterange-shortcut-btn--active': isShortcutActive(shortcut) }"
              @click="selectShortcut(shortcut)"
            >
              {{ shortcut.label }}
            </button>
          </div>

          <!-- 双月历面板 -->
          <div class="daterange-panels">
            <!-- 左侧面板 -->
            <div class="daterange-panel">
              <div class="daterange-panel-header">
                <button type="button" class="daterange-nav-btn" @click.stop="prevMonth" :disabled="isPrevMonthDisabled" :aria-label="t('components.dataEntry.dateRangePicker.prevMonth')">
                  <svg viewBox="0 0 12 12" fill="none">
                    <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <span class="daterange-panel-title">{{ leftPanelYear }}{{ t('components.dataEntry.dateRangePicker.yearSuffix') }} {{ leftPanelMonth + 1 }}{{ t('components.dataEntry.dateRangePicker.monthSuffix') }}</span>
                <button type="button" class="daterange-nav-btn daterange-nav-btn--placeholder" disabled aria-hidden="true">
                  <svg viewBox="0 0 12 12" fill="none">
                    <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              <div class="daterange-panel-body">
                <div class="daterange-weekdays">
                  <span v-for="day in weekDays" :key="day" class="daterange-weekday">{{ day }}</span>
                </div>
                <div class="daterange-days">
                  <button
                    v-for="(day, index) in leftPanelDays"
                    :key="index"
                    type="button"
                    class="daterange-day"
                    :class="{
                      'daterange-day--other': day.otherMonth,
                      'daterange-day--today': day.isToday,
                      'daterange-day--selected': day.isSelected,
                      'daterange-day--in-range': day.inRange,
                      'daterange-day--range-start': day.isRangeStart,
                      'daterange-day--range-end': day.isRangeEnd,
                      'daterange-day--range-start-forward': day.isRangeStart && isRangeForward && !isHoveringOnStartDate,
                      'daterange-day--range-start-backward': day.isRangeStart && !isRangeForward && !isHoveringOnStartDate,
                      'daterange-day--range-end-forward': day.isRangeEnd && hoverDirection !== 'left',
                      'daterange-day--range-end-backward': day.isRangeEnd && hoverDirection === 'left',
                      'daterange-day--range-start-hover': day.isRangeStart && isHoveringOnStartDate,
                      'daterange-day--disabled': day.disabled
                    }"
                    :disabled="day.disabled"
                    @click.stop="selectDate(day)"
                    @mouseenter="handleDayHover(day)"
                  >
                    {{ day.date }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 右侧面板 -->
            <div class="daterange-panel">
              <div class="daterange-panel-header">
                <button type="button" class="daterange-nav-btn daterange-nav-btn--placeholder" disabled aria-hidden="true">
                  <svg viewBox="0 0 12 12" fill="none">
                    <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <span class="daterange-panel-title">{{ rightPanelYear }}{{ t('components.dataEntry.dateRangePicker.yearSuffix') }} {{ rightPanelMonth + 1 }}{{ t('components.dataEntry.dateRangePicker.monthSuffix') }}</span>
                <button type="button" class="daterange-nav-btn" @click.stop="nextMonth" :disabled="isNextMonthDisabled" :aria-label="t('components.dataEntry.dateRangePicker.nextMonth')">
                  <svg viewBox="0 0 12 12" fill="none">
                    <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              <div class="daterange-panel-body">
                <div class="daterange-weekdays">
                  <span v-for="day in weekDays" :key="day" class="daterange-weekday">{{ day }}</span>
                </div>
                <div class="daterange-days">
                  <button
                    v-for="(day, index) in rightPanelDays"
                    :key="index"
                    type="button"
                    class="daterange-day"
                    :class="{
                      'daterange-day--other': day.otherMonth,
                      'daterange-day--today': day.isToday,
                      'daterange-day--selected': day.isSelected,
                      'daterange-day--in-range': day.inRange,
                      'daterange-day--range-start': day.isRangeStart,
                      'daterange-day--range-end': day.isRangeEnd,
                      'daterange-day--range-start-forward': day.isRangeStart && isRangeForward && !isHoveringOnStartDate,
                      'daterange-day--range-start-backward': day.isRangeStart && !isRangeForward && !isHoveringOnStartDate,
                      'daterange-day--range-end-forward': day.isRangeEnd && hoverDirection !== 'left',
                      'daterange-day--range-end-backward': day.isRangeEnd && hoverDirection === 'left',
                      'daterange-day--range-start-hover': day.isRangeStart && isHoveringOnStartDate,
                      'daterange-day--disabled': day.disabled
                    }"
                    :disabled="day.disabled"
                    @click.stop="selectDate(day)"
                    @mouseenter="handleDayHover(day)"
                  >
                    {{ day.date }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作栏 -->
          <div class="daterange-footer">
            <div class="daterange-info">
              <template v-if="tempRangeStart && tempRangeEnd">
                <span class="daterange-info-text">{{ formatDate(tempRangeStart) }} ~ {{ formatDate(tempRangeEnd) }}</span>
              </template>
              <template v-else-if="tempRangeStart">
                <span class="daterange-info-text">{{ formatDate(tempRangeStart) }} ~ {{ t('components.dataEntry.dateRangePicker.selectEndDate') }}</span>
              </template>
              <template v-else>
                <span class="daterange-info-text">{{ t('components.dataEntry.dateRangePicker.selectDateRangePrompt') }}</span>
              </template>
            </div>
            <div class="daterange-actions">
              <button type="button" class="daterange-btn" @click="handleCancel">{{ t('components.dataEntry.dateRangePicker.cancel') }}</button>
              <button type="button" class="daterange-btn daterange-btn--primary" :disabled="!canConfirm" @click="handleConfirm">{{ t('components.dataEntry.dateRangePicker.confirm') }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
 * 日期范围选择器组件
 * @description 统一的日期范围选择器，支持双月历面板，在一个地方选择开始和结束日期
 * 
 * @props {
 *   modelValue?: [Date | null, Date | null]; // 绑定值，格式为 [开始日期, 结束日期]
 *   placeholder?: string; // 占位符
 *   disabled?: boolean; // 是否禁用
 *   clearable?: boolean; // 是否可清除
 *   size?: 'sm' | 'md' | 'lg'; // 尺寸
 *   format?: string; // 日期格式化
 *   minDate?: Date; // 最小日期
 *   maxDate?: Date; // 最大日期
 *   disabledDate?: (date: Date) => boolean; // 禁用日期函数
 *   showShortcuts?: boolean; // 是否显示快捷选项
 *   shortcuts?: Shortcut[]; // 快捷选项配置
 *   ariaLabel?: string; // 无障碍标签
 *   customClass?: string; // 自定义类名
 * }
 * 
 * @emits {
 *   'update:modelValue': [value: [Date | null, Date | null]]; // 值更新事件
 *   'change': [value: [Date | null, Date | null]]; // 选择变化事件
 *   'clear': []; // 清除事件
 *   'focus': []; // 聚焦事件
 *   'blur': []; // 失焦事件
 * }
 * 
 * @example
 * // 基本使用
 * <DateRangePicker v-model="dateRange" />
 * 
 * // 带快捷选项
 * <DateRangePicker v-model="dateRange" :show-shortcuts="true" />
 */
import { computed, nextTick, ref, watch, onUnmounted, toRef } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import type { ComponentSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition } from '../composables/useFloatingPosition';
import { useComponentSize } from '../composables/useComponentSize';

const { uiT: t } = useUiT();

type DateRangePickerSize = ComponentSize;

interface Shortcut {
  key: string;
  label: string;
  value: () => [Date, Date];
}

interface Props {
  /** 绑定值；允许 null（清空 / 未选） */
  modelValue?: [Date | null, Date | null] | null;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: DateRangePickerSize;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDate?: (date: Date) => boolean;
  showShortcuts?: boolean;
  shortcuts?: Shortcut[];
  ariaLabel?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [null, null],
  placeholder: '请选择日期范围',
  disabled: false,
  clearable: true,
  size: undefined,
  format: 'yyyy-MM-dd',
  minDate: undefined,
  maxDate: undefined,
  disabledDate: undefined,
  showShortcuts: true,
  shortcuts: () => [],
  ariaLabel: '日期范围选择器',
  customClass: ''
});

const resolvedSize = useComponentSize(toRef(props, 'size'));

const emit = defineEmits<{
  'update:modelValue': [value: [Date | null, Date | null]];
  'change': [value: [Date | null, Date | null]];
  'clear': [];
  'focus': [];
  'blur': [];
}>();

// 默认快捷选项
const defaultShortcuts: Shortcut[] = [
  {
    key: 'today',
    label: '今天',
    value: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return [today, today];
    }
  },
  {
    key: 'yesterday',
    label: '昨天',
    value: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      return [yesterday, yesterday];
    }
  },
  {
    key: 'last7days',
    label: '近7天',
    value: () => {
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return [start, end];
    }
  },
  {
    key: 'last30days',
    label: '近30天',
    value: () => {
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date(end);
      start.setDate(start.getDate() - 29);
      return [start, end];
    }
  },
  {
    key: 'thisMonth',
    label: '本月',
    value: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [start, end];
    }
  },
  {
    key: 'lastMonth',
    label: '上月',
    value: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return [start, end];
    }
  }
];

const dateRangePickerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const visible = ref(false);
const dropdownId = useComponentId('daterange-dropdown');
const floatingBaseStyle = { position: 'fixed' as const };

const floating = useFloatingPosition({
  reference: dateRangePickerRef,
  floating: dropdownRef,
  placement: 'bottom-start',
  matchWidth: false,
  offsetPx: 4,
});

// 左侧面板显示的月份（当前月）
const leftPanelYear = ref(new Date().getFullYear());
const leftPanelMonth = ref(new Date().getMonth());

// 临时选择的范围
const tempRangeStart = ref<Date | null>(null);
const tempRangeEnd = ref<Date | null>(null);
const hoverDate = ref<Date | null>(null);
const hoverDirection = ref<'left' | 'right' | null>(null);

const isHoveringOnStartDate = computed(() => {
  if (!tempRangeStart.value || !hoverDate.value) return false;
  return hoverDate.value.toDateString() === tempRangeStart.value.toDateString();
});

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// 计算右侧面板的年月（左侧面板的下一个月）
const rightPanelYear = computed(() => {
  if (leftPanelMonth.value === 11) {
    return leftPanelYear.value + 1;
  }
  return leftPanelYear.value;
});

const rightPanelMonth = computed(() => {
  if (leftPanelMonth.value === 11) {
    return 0;
  }
  return leftPanelMonth.value + 1;
});

// 合并默认快捷选项和自定义快捷选项
const mergedShortcuts = computed(() => {
  return props.shortcuts.length > 0 ? props.shortcuts : defaultShortcuts;
});
// 使用 mergedShortcuts 避免未使用变量的警告
void mergedShortcuts;

const dateRangePickerClass = computed(() => {
  const classes = ['daterange-picker', `daterange-picker--${resolvedSize.value}`];
  if (props.disabled) classes.push('daterange-picker--disabled');
  if (visible.value) classes.push('daterange-picker--focused');
  if (hasValue.value) classes.push('daterange-picker--has-value');
  if (props.customClass) classes.push(props.customClass);
  return classes.join(' ');
});

const hasValue = computed(() => {
  const range = props.modelValue;
  return Array.isArray(range) && range[0] != null && range[1] != null;
});

const displayValue = computed(() => {
  const [start, end] = props.modelValue ?? [null, null];
  if (start && end) {
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  }
  return '';
});

const canConfirm = computed(() => {
  return tempRangeStart.value !== null && tempRangeEnd.value !== null;
});

const isPrevMonthDisabled = computed(() => {
  if (!props.minDate) return false;
  const prevMonth = new Date(leftPanelYear.value, leftPanelMonth.value - 1, 1);
  return prevMonth.getFullYear() < props.minDate.getFullYear() ||
    (prevMonth.getFullYear() === props.minDate.getFullYear() && prevMonth.getMonth() < props.minDate.getMonth());
});

const isNextMonthDisabled = computed(() => {
  if (!props.maxDate) return false;
  const nextMonth = new Date(rightPanelYear.value, rightPanelMonth.value + 1, 1);
  return nextMonth.getFullYear() > props.maxDate.getFullYear() ||
    (nextMonth.getFullYear() === props.maxDate.getFullYear() && nextMonth.getMonth() > props.maxDate.getMonth());
});

// 生成日历天数
const generateCalendarDays = (year: number, month: number) => {
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

  // 上个月的日期
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push(createDayObject(date, true));
  }

  // 当前月的日期
  const today = new Date();
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push(createDayObject(date, false, today));
  }

  // 下个月的日期
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    days.push(createDayObject(date, true));
  }

  return days;
};

const createDayObject = (date: Date, otherMonth: boolean, today?: Date) => {
  const todayDate = today || new Date();
  return {
    date: date.getDate(),
    fullDate: date,
    otherMonth,
    isToday: date.toDateString() === todayDate.toDateString(),
    isSelected: isDateSelected(date),
    inRange: isDateInRange(date),
    isRangeStart: isRangeStartFunc(date),
    isRangeEnd: isRangeEndFunc(date),
    disabled: isDateDisabled(date)
  };
};

const leftPanelDays = computed(() => generateCalendarDays(leftPanelYear.value, leftPanelMonth.value));
const rightPanelDays = computed(() => generateCalendarDays(rightPanelYear.value, rightPanelMonth.value));

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let result = props.format;
  result = result.replace('yyyy', String(year));
  result = result.replace('MM', String(month).padStart(2, '0'));
  result = result.replace('M', String(month));
  result = result.replace('dd', String(day).padStart(2, '0'));
  result = result.replace('d', String(day));

  return result;
};

const isDateSelected = (date: Date): boolean => {
  // 优先检查临时选择的范围
  if (tempRangeStart.value && date.toDateString() === tempRangeStart.value.toDateString()) return true;
  if (tempRangeEnd.value && date.toDateString() === tempRangeEnd.value.toDateString()) return true;
  // 然后检查已确认的值
  if (props.modelValue?.[0] && date.toDateString() === props.modelValue[0].toDateString()) return true;
  if (props.modelValue?.[1] && date.toDateString() === props.modelValue[1].toDateString()) return true;
  return false;
};

const isDateInRange = (date: Date): boolean => {
  const dateTime = date.getTime();

  // 优先检查临时选择的范围（包括悬停预览）
  if (tempRangeStart.value) {
    const start = tempRangeStart.value;
    const end = tempRangeEnd.value || hoverDate.value;
    if (end) {
      const startTime = Math.min(start.getTime(), end.getTime());
      const endTime = Math.max(start.getTime(), end.getTime());
      return dateTime > startTime && dateTime < endTime;
    }
  }

  // 然后检查已确认的值
  if (props.modelValue?.[0] && props.modelValue?.[1]) {
    const startTime = Math.min(props.modelValue[0].getTime(), props.modelValue[1].getTime());
    const endTime = Math.max(props.modelValue[0].getTime(), props.modelValue[1].getTime());
    return dateTime > startTime && dateTime < endTime;
  }

  return false;
};

// 计算当前范围选择的方向（从左到右或从右到左）
const isRangeForward = computed(() => {
  // 如果有临时结束日期，根据临时范围判断
  if (tempRangeStart.value && tempRangeEnd.value) {
    return tempRangeStart.value <= tempRangeEnd.value;
  }
  // 如果只有开始日期和悬停日期，根据悬停判断
  if (tempRangeStart.value && hoverDate.value) {
    return tempRangeStart.value <= hoverDate.value;
  }
  // 根据已确认的值判断
  if (props.modelValue?.[0] && props.modelValue?.[1]) {
    return props.modelValue[0] <= props.modelValue[1];
  }
  return true; // 默认正向
});

const isRangeStartFunc = (date: Date): boolean => {
  // 优先检查临时选择的范围
  if (tempRangeStart.value && tempRangeEnd.value) {
    const startTime = Math.min(tempRangeStart.value.getTime(), tempRangeEnd.value.getTime());
    return date.getTime() === startTime;
  }
  if (tempRangeStart.value && !tempRangeEnd.value && hoverDate.value) {
    const startTime = Math.min(tempRangeStart.value.getTime(), hoverDate.value.getTime());
    return date.getTime() === startTime;
  }
  if (tempRangeStart.value && date.toDateString() === tempRangeStart.value.toDateString()) return true;

  // 然后检查已确认的值
  if (props.modelValue?.[0] && props.modelValue?.[1]) {
    const startTime = Math.min(props.modelValue[0].getTime(), props.modelValue[1].getTime());
    return date.getTime() === startTime;
  }

  return false;
};

const isRangeEndFunc = (date: Date): boolean => {
  // 优先检查临时选择的范围
  if (tempRangeStart.value && tempRangeEnd.value) {
    const endTime = Math.max(tempRangeStart.value.getTime(), tempRangeEnd.value.getTime());
    return date.getTime() === endTime;
  }
  if (tempRangeStart.value && !tempRangeEnd.value && hoverDate.value) {
    const endTime = Math.max(tempRangeStart.value.getTime(), hoverDate.value.getTime());
    return date.getTime() === endTime;
  }
  if (tempRangeEnd.value && date.toDateString() === tempRangeEnd.value.toDateString()) return true;

  // 然后检查已确认的值
  if (props.modelValue?.[0] && props.modelValue?.[1]) {
    const endTime = Math.max(props.modelValue[0].getTime(), props.modelValue[1].getTime());
    return date.getTime() === endTime;
  }

  return false;
};

const isDateDisabled = (date: Date): boolean => {
  if (props.disabledDate && props.disabledDate(date)) return true;
  if (props.minDate && date < props.minDate) return true;
  if (props.maxDate && date > props.maxDate) return true;
  return false;
};

const isShortcutActive = (shortcut: Shortcut): boolean => {
  const [shortcutStart, shortcutEnd] = shortcut.value();
  const [currentStart, currentEnd] = props.modelValue ?? [null, null];
  if (!currentStart || !currentEnd) return false;
  return shortcutStart.toDateString() === currentStart.toDateString() &&
         shortcutEnd.toDateString() === currentEnd.toDateString();
};

const handleToggle = () => {
  if (props.disabled) return;
  visible.value = !visible.value;

  if (visible.value) {
    initPanelDate();
    // 初始化临时范围
    if (props.modelValue?.[0] && props.modelValue?.[1]) {
      tempRangeStart.value = new Date(props.modelValue[0]);
      tempRangeEnd.value = new Date(props.modelValue[1]);
    } else {
      tempRangeStart.value = null;
      tempRangeEnd.value = null;
    }
    hoverDate.value = null;
    hoverDirection.value = null;
    emit('focus');
  } else {
    emit('blur');
  }
};

const initPanelDate = () => {
  if (props.modelValue?.[0]) {
    leftPanelYear.value = props.modelValue[0].getFullYear();
    leftPanelMonth.value = props.modelValue[0].getMonth();
  } else {
    const today = new Date();
    leftPanelYear.value = today.getFullYear();
    leftPanelMonth.value = today.getMonth();
  }
};

const selectDate = (day: { fullDate: Date; disabled: boolean }) => {
  if (day.disabled) return;

  if (!tempRangeStart.value) {
    // 开始选择新的范围
    tempRangeStart.value = day.fullDate;
    tempRangeEnd.value = null;
  } else if (!tempRangeEnd.value) {
    // 完成选择范围
    if (day.fullDate < tempRangeStart.value) {
      tempRangeEnd.value = tempRangeStart.value;
      tempRangeStart.value = day.fullDate;
    } else {
      tempRangeEnd.value = day.fullDate;
    }
  } else {
    // 重新开始选择新的范围
    tempRangeStart.value = day.fullDate;
    tempRangeEnd.value = null;
  }
};

const handleDayHover = (day: { fullDate: Date }) => {
  if (tempRangeStart.value && !tempRangeEnd.value) {
    hoverDate.value = day.fullDate;
    if (day.fullDate.toDateString() !== tempRangeStart.value.toDateString()) {
      hoverDirection.value = day.fullDate < tempRangeStart.value ? 'left' : 'right';
    } else {
      hoverDirection.value = null;
    }
  }
};

const selectShortcut = (shortcut: Shortcut) => {
  const [start, end] = shortcut.value();
  tempRangeStart.value = start;
  tempRangeEnd.value = end;
  // 自动确认
  confirmSelection();
};

const prevMonth = () => {
  if (isPrevMonthDisabled.value) return;
  if (leftPanelMonth.value === 0) {
    leftPanelMonth.value = 11;
    leftPanelYear.value--;
  } else {
    leftPanelMonth.value--;
  }
};

const nextMonth = () => {
  if (isNextMonthDisabled.value) return;
  if (leftPanelMonth.value === 11) {
    leftPanelMonth.value = 0;
    leftPanelYear.value++;
  } else {
    leftPanelMonth.value++;
  }
};

const handleClear = () => {
  tempRangeStart.value = null;
  tempRangeEnd.value = null;
  hoverDate.value = null;
  hoverDirection.value = null;
  emit('update:modelValue', [null, null]);
  emit('change', [null, null]);
  emit('clear');
};

const handleCancel = () => {
  visible.value = false;
  // 恢复原始值
  if (props.modelValue?.[0] && props.modelValue?.[1]) {
    tempRangeStart.value = new Date(props.modelValue[0]);
    tempRangeEnd.value = new Date(props.modelValue[1]);
  } else {
    tempRangeStart.value = null;
    tempRangeEnd.value = null;
  }
  hoverDate.value = null;
  hoverDirection.value = null;
  emit('blur');
  nextTick(() => {
    dateRangePickerRef.value?.focus();
  });
};

const handleConfirm = () => {
  if (tempRangeStart.value && tempRangeEnd.value) {
    confirmSelection();
  }
};

const confirmSelection = () => {
  if (tempRangeStart.value && tempRangeEnd.value) {
    const newValue: [Date, Date] = [tempRangeStart.value, tempRangeEnd.value];
    emit('update:modelValue', newValue);
    emit('change', newValue);
    visible.value = false;
    hoverDate.value = null;
    hoverDirection.value = null;
    emit('blur');
    nextTick(() => {
      dateRangePickerRef.value?.focus();
    });
  }
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
        handleCancel();
      }
      break;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (
    dateRangePickerRef.value?.contains(target) ||
    dropdownRef.value?.contains(target)
  ) {
    return;
  }
  if (visible.value) {
    handleCancel();
  }
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

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

defineExpose({
  focus: () => dateRangePickerRef.value?.focus(),
  blur: () => { visible.value = false; },
});
</script>

<style scoped>
.daterange-picker {
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  outline: none;
}

.daterange-selector {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 12px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.daterange-picker:hover:not(.daterange-picker--disabled) .daterange-selector {
  border-color: hsl(var(--border-hover));
}

.daterange-picker--focused .daterange-selector {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.daterange-picker--disabled {
  cursor: not-allowed;
}

.daterange-picker--disabled .daterange-selector {
  opacity: 0.5;
  cursor: not-allowed;
  background: hsl(var(--surface-container-high));
}

.daterange-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
}

.daterange-icon svg {
  width: 16px;
  height: 16px;
}

.daterange-value {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.daterange-placeholder {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.daterange-clear {
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
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.daterange-clear:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-container-high));
}

.daterange-clear svg {
  width: 10px;
  height: 10px;
}

.daterange-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.daterange-arrow--open {
  transform: rotate(180deg);
}

.daterange-arrow svg {
  width: 12px;
  height: 12px;
  color: hsl(var(--text-muted));
}

.daterange-dropdown {
  z-index: var(--z-dropdown);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  padding: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-width: 560px;
}

/* 快捷选项 */
.daterange-shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.daterange-shortcut-btn {
  padding: 6px 12px;
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  font-size: 13px;
  color: hsl(var(--text));
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.daterange-shortcut-btn:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.daterange-shortcut-btn--active {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
}

/* 双月历面板 */
.daterange-panels {
  display: flex;
  gap: 16px;
}

.daterange-panel {
  flex: 1;
  min-width: 252px;
}

.daterange-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.daterange-panel-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text));
}

.daterange-nav-btn {
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
  transition: color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s;
}

.daterange-nav-btn:hover:not(:disabled) {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text));
}

.daterange-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.daterange-nav-btn--placeholder {
  opacity: 0;
  pointer-events: none;
}

.daterange-nav-btn svg {
  width: 12px;
  height: 12px;
}

.daterange-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.daterange-weekday {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--text-muted));
}

.daterange-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.daterange-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: hsl(var(--text));
  cursor: pointer;
  transition: color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  margin: 0 auto;
}

.daterange-day:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
}

.daterange-day--other {
  color: hsl(var(--text-muted) / 0.5);
}

.daterange-day--today {
  font-weight: 600;
  color: hsl(var(--primary));
}

.daterange-day--selected {
  background: hsl(var(--primary));
  color: white;
}

.daterange-day--selected:hover:not(:disabled) {
  background: hsl(var(--primary-hover));
}

.daterange-day--in-range {
  background: hsl(var(--primary) / 0.15);
  border-radius: 0;
}

.daterange-day--in-range:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.25);
}

/* ===== 范围开始日期样式 ===== */
.daterange-day--range-start {
  background: hsl(var(--primary));
  color: white;
  font-weight: 600;
}

/* 正向选择（从左到右）：开始日期左侧圆角，结束日期右侧圆角 */
.daterange-day--range-start-forward {
  border-radius: 8px 0 0 8px;
}

.daterange-day--range-end-forward {
  border-radius: 0 8px 8px 0;
}

/* 反向选择（从右到左）：开始日期右侧圆角，结束日期左侧圆角 */
.daterange-day--range-start-backward {
  border-radius: 0 8px 8px 0;
}

.daterange-day--range-end-backward {
  border-radius: 8px 0 0 8px;
}

/* ===== 范围结束日期样式 ===== */
.daterange-day--range-end {
  background: hsl(var(--primary));
  color: white;
  font-weight: 600;
}

/* ===== 悬停时保持方向性圆角 ===== */
/* 悬停在开始日期本身上时显示全圆角 */
.daterange-day--range-start-hover,
.daterange-day--range-start-hover.daterange-day--selected {
  border-radius: 8px !important;
}

/* 开始日期悬停 */
.daterange-day--range-start.daterange-day--range-start-forward:hover,
.daterange-day--range-start.daterange-day--range-start-forward.daterange-day--selected:hover {
  border-radius: 8px 0 0 8px;
}

.daterange-day--range-start.daterange-day--range-start-backward:hover,
.daterange-day--range-start.daterange-day--range-start-backward.daterange-day--selected:hover {
  border-radius: 0 8px 8px 0;
}

/* 结束日期悬停 */
.daterange-day--range-end.daterange-day--range-end-forward:hover,
.daterange-day--range-end.daterange-day--range-end-forward.daterange-day--selected:hover {
  border-radius: 0 8px 8px 0;
}

.daterange-day--range-end.daterange-day--range-end-backward:hover,
.daterange-day--range-end.daterange-day--range-end-backward.daterange-day--selected:hover {
  border-radius: 8px 0 0 8px;
}

/* ===== 同一天的情况（开始和结束是同一天）===== */
.daterange-day--range-start.daterange-day--range-end {
  border-radius: 8px;
}

.daterange-day--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 底部操作栏 */
.daterange-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid hsl(var(--border));
}

.daterange-info {
  font-size: 13px;
  color: hsl(var(--text-muted));
}

.daterange-info-text {
  font-weight: 500;
}

.daterange-actions {
  display: flex;
  gap: 8px;
}

.daterange-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  font-size: 13px;
  color: hsl(var(--text));
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s;
}

.daterange-btn:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.daterange-btn--primary {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: white;
}

.daterange-btn--primary:hover:not(:disabled) {
  background: hsl(var(--primary-hover));
}

.daterange-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 尺寸变体 */
.daterange-picker--sm .daterange-selector {
  min-height: 32px;
  padding: 4px 10px;
}

.daterange-picker--sm .daterange-value,
.daterange-picker--sm .daterange-placeholder {
  font-size: 13px;
}

.daterange-picker--lg .daterange-selector {
  min-height: 48px;
  padding: 8px 14px;
}

.daterange-picker--lg .daterange-value,
.daterange-picker--lg .daterange-placeholder {
  font-size: 16px;
}

/* 动画 */
.daterange-dropdown-enter-active,
.daterange-dropdown-leave-active {
  transition: opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.daterange-dropdown-enter-from,
.daterange-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 响应式 */
@media (max-width: 639.98px) {
  .daterange-dropdown {
    min-width: auto;
    width: calc(100vw - 32px);
    max-width: 360px;
    left: 50% !important;
    transform: translateX(-50%);
    padding: 12px;
  }

  .daterange-panels {
    flex-direction: column;
    gap: 12px;
  }

  .daterange-panel {
    min-width: auto;
  }

  .daterange-shortcuts {
    gap: 6px;
  }

  .daterange-shortcut-btn {
    padding: 4px 8px;
    font-size: 12px;
  }

  .daterange-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .daterange-actions {
    justify-content: flex-end;
  }
}
</style>
