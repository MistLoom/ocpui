&lt;!--
日历组件

## 组件说明
提供日期选择功能的日历组件，支持月份和年份导航，以及日期选择。

## 公开属性
- `modelValue` (Date, 可选): 绑定的日期值
- `disabled` (boolean, 可选): 是否禁用，默认为 false
- `customClass` (string, 可选): 自定义类名
- `minDate` (Date, 可选): 最小可选日期
- `maxDate` (Date, 可选): 最大可选日期

## 事件
- `update:modelValue` (date: Date): 值变更时触发
- `select` (date: Date): 选择日期时触发
- `panel-change` (date: Date): 面板月份/年份变更时触发

## 方法
- `goToToday()`: 跳转到今天

## 使用方式
```vue
&lt;Calendar
  v-model="selectedDate"
  :disabled="false"
  @select="handleSelect"
  @panel-change="handlePanelChange"
/&gt;
```
--&gt;
<template>
  <div :class="calendarClass" v-bind="$attrs">
    <div class="calendar-header">
      <Button variant="icon" @click="handlePrevYear" :disabled="disabled">
        <Icon name="arrow-left" :size="16" />
      </Button>
      <Button variant="icon" @click="handlePrevMonth" :disabled="disabled">
        <Icon name="arrow-left" :size="16" />
      </Button>
      <div class="calendar-title">{{ currentYear }}{{ t('components.dataEntry.calendar.yearSuffix') }} {{ currentMonth + 1 }}{{ t('components.dataEntry.calendar.monthSuffix') }}</div>
      <Button variant="icon" @click="handleNextMonth" :disabled="disabled">
        <Icon name="arrow-right" :size="16" />
      </Button>
      <Button variant="icon" @click="handleNextYear" :disabled="disabled">
        <Icon name="arrow-right" :size="16" />
      </Button>
      <Button size="sm" @click="goToToday" :disabled="disabled">{{ t('components.dataEntry.calendar.today') }}</Button>
    </div>
    
    <div class="calendar-body">
      <div class="calendar-weekdays">
        <div v-for="day in weekDays" :key="day" class="calendar-weekday">
          {{ day }}
        </div>
      </div>
      
      <div class="calendar-days">
        <div
          v-for="(date, index) in calendarDays"
          :key="index"
          :class="getDayClass(date)"
          @click="handleDateClick(date)"
        >
          {{ date.day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Button, Icon } from '../utility';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface CalendarDate {
  date: Date;
  day: number;
  currentMonth: boolean;
  today: boolean;
  selected: boolean;
  disabled: boolean;
}

interface Props {
  modelValue?: Date;
  disabled?: boolean;
  customClass?: string;
  minDate?: Date;
  maxDate?: Date;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  disabled: false,
  customClass: '',
  minDate: undefined,
  maxDate: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [date: Date];
  'select': [date: Date];
  'panel-change': [date: Date];
}>();

const currentDate = ref(new Date());
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null);

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const calendarClass = computed(() => {
  const classes = ['calendar'];
  if (props.disabled) {
    classes.push('calendar--disabled');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

const isDateDisabled = (date: Date) => {
  if (props.minDate && date < props.minDate) return true;
  if (props.maxDate && date > props.maxDate) return true;
  return false;
};

const calendarDays = computed((): CalendarDate[] => {
  const year = currentYear.value;
  const month = currentMonth.value;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  
  const days: CalendarDate[] = [];
  
  const today = new Date();
  const isToday = (date: Date): boolean => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const isSelected = (date: Date): boolean => {
    return selectedDate.value !== null &&
           date.getDate() === selectedDate.value.getDate() &&
           date.getMonth() === selectedDate.value.getMonth() &&
           date.getFullYear() === selectedDate.value.getFullYear();
  };
  
  for (let i = 0; i < startDay; i++) {
    const prevDate = new Date(year, month, -startDay + i + 1);
    days.push({
      date: prevDate,
      day: prevDate.getDate(),
      currentMonth: false,
      today: isToday(prevDate),
      selected: isSelected(prevDate),
      disabled: isDateDisabled(prevDate),
    });
  }
  
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      day: i,
      currentMonth: true,
      today: isToday(date),
      selected: isSelected(date),
      disabled: isDateDisabled(date),
    });
  }
  
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(year, month + 1, i);
    days.push({
      date: nextDate,
      day: i,
      currentMonth: false,
      today: isToday(nextDate),
      selected: isSelected(nextDate),
      disabled: isDateDisabled(nextDate),
    });
  }
  
  return days;
});

const getDayClass = (date: CalendarDate) => {
  const classes = ['calendar-day'];
  
  if (!date.currentMonth) {
    classes.push('calendar-day--other-month');
  }
  
  if (date.today) {
    classes.push('calendar-day--today');
  }
  
  if (date.selected) {
    classes.push('calendar-day--selected');
  }
  
  if (date.disabled) {
    classes.push('calendar-day--disabled');
  }
  
  return classes.join(' ');
};

const handlePrevYear = () => {
  currentDate.value = new Date(currentYear.value - 1, currentMonth.value, 1);
  emit('panel-change', currentDate.value);
};

const handleNextYear = () => {
  currentDate.value = new Date(currentYear.value + 1, currentMonth.value, 1);
  emit('panel-change', currentDate.value);
};

const handlePrevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
  emit('panel-change', currentDate.value);
};

const handleNextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
  emit('panel-change', currentDate.value);
};

const handleDateClick = (date: CalendarDate) => {
  if (props.disabled || date.disabled) return;
  
  selectedDate.value = date.date;
  emit('update:modelValue', date.date);
  emit('select', date.date);
};

const goToToday = () => {
  currentDate.value = new Date();
  selectedDate.value = new Date();
  emit('update:modelValue', selectedDate.value);
  emit('select', selectedDate.value);
};

// 监听外部 modelValue 变化
watch(() => props.modelValue, (val) => {
  if (val && (!selectedDate.value || val.getTime() !== selectedDate.value.getTime())) {
    selectedDate.value = new Date(val);
    currentDate.value = new Date(val);
  }
});

defineExpose({
  goToToday,
});
</script>

<style scoped>
.calendar {
  display: inline-block;
  min-width: 320px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.calendar-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--text));
}

.calendar-body {
  padding: 16px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.calendar-weekday {
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text-muted));
  padding: 8px 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  font-size: 14px;
  color: hsl(var(--text));
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.calendar-day:hover:not(.calendar-day--other-month) {
  background: hsl(var(--surface-hover));
}

.calendar-day--other-month {
  color: hsl(var(--text-muted));
  opacity: 0.5;
}

.calendar-day--today {
  color: hsl(var(--primary));
  font-weight: 600;
}

.calendar-day--selected {
  background: hsl(var(--primary));
  color: white;
  font-weight: 600;
}

.calendar-day--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.calendar-day--disabled:hover {
  background: transparent;
}

.calendar--disabled .calendar-day {
  cursor: not-allowed;
  opacity: 0.5;
}

.calendar--disabled .calendar-day:hover {
  background: transparent;
}
</style>
