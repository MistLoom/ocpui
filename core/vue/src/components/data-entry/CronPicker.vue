&lt;!--
Cron 表达式选择器组件

## 组件说明
用于生成和配置 Cron 表达式的组件，支持简单模式和高级模式，提供可视化配置界面。

## 公开属性
- `modelValue` (string, 可选): 绑定的 Cron 表达式，默认为 '0 0 * * *'
- `customClass` (string, 可选): 自定义类名

## 事件
- `update:modelValue` (value: string): 值变更时触发
- `change` (value: string): 变更时触发

## 使用方式
```vue
&lt;CronPicker
  v-model="cronExpression"
  @change="handleCronChange"
/&gt;
```
--&gt;
<template>
  <div :class="cronPickerClass">
    <div class="cron-picker-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="cron-picker-tab"
        :class="{ 'cron-picker-tab--active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="cron-picker-content">
      <!-- 简单模式 -->
      <template v-if="activeTab === 'simple'">
        <div class="cron-simple-form">
          <div class="cron-form-item">
            <label class="cron-form-label">{{ t('components.dataEntry.cronPicker.frequencyLabel') }}</label>
            <Select
              v-model="simpleConfig.frequency"
              :options="frequencyOptions"
              :placeholder="t('components.dataEntry.cronPicker.frequencyPlaceholder')"
            />
          </div>
          
          <div v-if="simpleConfig.frequency === 'daily'" class="cron-form-item">
            <label class="cron-form-label">{{ t('components.dataEntry.cronPicker.timeLabel') }}</label>
            <TimePicker v-model="simpleConfig.time" :placeholder="t('components.dataEntry.cronPicker.timePlaceholder')" />
          </div>
          
          <div v-if="simpleConfig.frequency === 'weekly'" class="cron-form-item">
            <label class="cron-form-label">{{ t('components.dataEntry.cronPicker.timeLabel') }}</label>
            <TimePicker v-model="simpleConfig.time" :placeholder="t('components.dataEntry.cronPicker.timePlaceholder')" />
            <label class="cron-form-label" style="margin-top: 12px;">{{ t('components.dataEntry.cronPicker.weekdayLabel') }}</label>
            <div class="cron-weekdays">
              <button
                v-for="day in weekdays"
                :key="day.value"
                type="button"
                class="cron-weekday-btn"
                :class="{ 'cron-weekday-btn--selected': simpleConfig.weekdays?.includes(day.value) }"
                @click="toggleWeekday(day.value)"
              >
                {{ day.label }}
              </button>
            </div>
          </div>
          
          <div v-if="simpleConfig.frequency === 'monthly'" class="cron-form-item">
            <label class="cron-form-label">{{ t('components.dataEntry.cronPicker.timeLabel') }}</label>
            <TimePicker v-model="simpleConfig.time" :placeholder="t('components.dataEntry.cronPicker.timePlaceholder')" />
            <label class="cron-form-label" style="margin-top: 12px;">{{ t('components.dataEntry.cronPicker.monthdayLabel') }}</label>
            <div class="cron-monthdays">
              <button
                v-for="date in monthDates"
                :key="date"
                type="button"
                class="cron-monthday-btn"
                :class="{ 'cron-monthday-btn--selected': simpleConfig.monthday === date }"
                @click="simpleConfig.monthday = date"
              >
                {{ date }}
              </button>
            </div>
          </div>
          
          <div v-if="simpleConfig.frequency === 'hourly'" class="cron-form-item">
            <label class="cron-form-label">{{ t('components.dataEntry.cronPicker.minuteIntervalLabel') }}</label>
            <InputNumber v-model="simpleConfig.minuteInterval" :min="0" :max="59" />
          </div>
        </div>
      </template>
      
      <!-- 高级模式 -->
      <template v-if="activeTab === 'advanced'">
        <div class="cron-advanced-form">
          <div class="cron-field-row">
            <div class="cron-field">
              <label class="cron-field-label">{{ t('components.dataEntry.cronPicker.minuteFieldLabel') }}</label>
              <Input v-model="cronParts.minute" placeholder="*" @blur="validateField('minute')" />
              <span class="cron-field-hint">{{ t('components.dataEntry.cronPicker.minuteFieldHint') }}</span>
            </div>
            <div class="cron-field">
              <label class="cron-field-label">{{ t('components.dataEntry.cronPicker.hourFieldLabel') }}</label>
              <Input v-model="cronParts.hour" placeholder="*" @blur="validateField('hour')" />
              <span class="cron-field-hint">{{ t('components.dataEntry.cronPicker.hourFieldHint') }}</span>
            </div>
          </div>
          <div class="cron-field-row">
            <div class="cron-field">
              <label class="cron-field-label">{{ t('components.dataEntry.cronPicker.dayFieldLabel') }}</label>
              <Input v-model="cronParts.dayOfMonth" placeholder="*" @blur="validateField('dayOfMonth')" />
              <span class="cron-field-hint">{{ t('components.dataEntry.cronPicker.dayFieldHint') }}</span>
            </div>
            <div class="cron-field">
              <label class="cron-field-label">{{ t('components.dataEntry.cronPicker.monthFieldLabel') }}</label>
              <Input v-model="cronParts.month" placeholder="*" @blur="validateField('month')" />
              <span class="cron-field-hint">{{ t('components.dataEntry.cronPicker.monthFieldHint') }}</span>
            </div>
          </div>
          <div class="cron-field-row">
            <div class="cron-field">
              <label class="cron-field-label">{{ t('components.dataEntry.cronPicker.weekFieldLabel') }}</label>
              <Input v-model="cronParts.dayOfWeek" placeholder="*" @blur="validateField('dayOfWeek')" />
              <span class="cron-field-hint">{{ t('components.dataEntry.cronPicker.weekFieldHint') }}</span>
            </div>
            <div class="cron-field">
              <label class="cron-field-label">{{ t('components.dataEntry.cronPicker.yearFieldLabel') }}</label>
              <Input v-model="cronParts.year" placeholder="*" @blur="validateField('year')" />
              <span class="cron-field-hint">1970-2099</span>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <div class="cron-picker-preview">
      <div class="cron-preview-label">{{ t('components.dataEntry.cronPicker.cronExpressionLabel') }}</div>
      <div class="cron-preview-value">{{ cronExpression }}</div>
      <div class="cron-preview-desc">{{ cronDescription }}</div>
      <div v-if="nextExecutions.length > 0" class="cron-next-executions">
        <div class="cron-next-label">{{ t('components.dataEntry.cronPicker.nextExecutionLabel') }}</div>
        <div class="cron-next-list">
          <span v-for="(time, index) in nextExecutions" :key="index" class="cron-next-item">
            {{ time }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Select from './Select.vue';
import Input from './Input.vue';
import InputNumber from './InputNumber.vue';
import TimePicker from './TimePicker.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface Props {
  modelValue?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '0 0 * * *',
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
}>();

const activeTab = ref<'simple' | 'advanced'>('simple');

const tabs = [
  { label: '简单设置', value: 'simple' as const },
  { label: '高级设置', value: 'advanced' as const },
];

const frequencyOptions = [
  { label: '每小时', value: 'hourly' },
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
];

const weekdays = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 0 },
];

const monthDates = Array.from({ length: 31 }, (_, i) => i + 1);

const simpleConfig = ref({
  frequency: 'daily',
  time: new Date(new Date().setHours(9, 0, 0, 0)),
  weekdays: [1, 2, 3, 4, 5],
  monthday: 1,
  minuteInterval: 0,
});

const cronParts = ref({
  minute: '0',
  hour: '0',
  dayOfMonth: '*',
  month: '*',
  dayOfWeek: '*',
  year: '*',
});

const cronPickerClass = computed(() => {
  const classes = ['cron-picker'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const cronExpression = computed(() => {
  if (activeTab.value === 'simple') {
    return generateCronFromSimple();
  }
  const { minute, hour, dayOfMonth, month, dayOfWeek } = cronParts.value;
  return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
});

const cronDescription = computed(() => {
  return parseCronExpression(cronExpression.value);
});

const nextExecutions = computed(() => {
  try {
    return calculateNextExecutions(cronExpression.value, 3);
  } catch (e) {
    return [];
  }
});

function generateCronFromSimple(): string {
  const { frequency, time, weekdays: selectedWeekdays, monthday, minuteInterval } = simpleConfig.value;
  const minutes = time?.getMinutes() ?? 0;
  const hours = time?.getHours() ?? 0;
  
  switch (frequency) {
    case 'hourly':
      return `${minuteInterval} * * * *`;
    case 'daily':
      return `${minutes} ${hours} * * *`;
    case 'weekly':
      if (!selectedWeekdays || selectedWeekdays.length === 0) return `${minutes} ${hours} * * *`;
      return `${minutes} ${hours} * * ${selectedWeekdays.join(',')}`;
    case 'monthly':
      return `${minutes} ${hours} ${monthday} * *`;
    default:
      return '0 0 * * *';
  }
}

function parseCronExpression(cron: string): string {
  const parts = cron.split(' ');
  if (parts.length < 5) return '无效的 Cron 表达式';
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  const descriptions: string[] = [];
  
  if (minute === '*') descriptions.push('每分钟');
  else if (minute.includes('/')) {
    const interval = minute.split('/')[1];
    descriptions.push(`每${interval}分钟`);
  }
  else descriptions.push(`${minute}分`);
  
  if (hour !== '*') {
    if (!minute.includes('/')) descriptions.push(`${hour}点`);
  }
  
  if (dayOfMonth !== '*') descriptions.push(`${dayOfMonth}日`);
  if (month !== '*') descriptions.push(`${month}月`);
  
  if (dayOfWeek !== '*') {
    const days = dayOfWeek.split(',').map(d => {
      const dayMap: Record<string, string> = { '0': '周日', '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六' };
      return dayMap[d] || d;
    });
    descriptions.push(days.join('、'));
  }
  
  if (descriptions.length === 0) return '每天执行';
  return descriptions.join('，');
}

function calculateNextExecutions(cron: string, count: number): string[] {
  const executions: string[] = [];
  const now = new Date();
  
  try {
    for (let i = 0; i < count; i++) {
      const next = getNextExecution(cron, i === 0 ? now : new Date(executions[i - 1]));
      if (next) {
        executions.push(formatDateTime(next));
      }
    }
  } catch (e) {
    // 解析失败返回空数组
  }
  
  return executions;
}

function getNextExecution(cron: string, after: Date): Date | null {
  const parts = cron.split(' ');
  if (parts.length < 5) return null;
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const next = new Date(after);
  next.setMinutes(next.getMinutes() + 1);
  next.setSeconds(0, 0);
  
  let attempts = 0;
  const maxAttempts = 366 * 24 * 60; // 最多尝试一年的时间
  while (attempts < maxAttempts) {
    if (matchesCron(next, minute, hour, dayOfMonth, month, dayOfWeek)) {
      return next;
    }
    next.setMinutes(next.getMinutes() + 1);
    attempts++;
  }
  
  return null;
}

function matchesCron(date: Date, minute: string, hour: string, dayOfMonth: string, month: string, dayOfWeek: string): boolean {
  const m = date.getMinutes();
  const h = date.getHours();
  const dom = date.getDate();
  const mo = date.getMonth() + 1;
  const dow = date.getDay();
  
  return matchesField(m, minute) &&
         matchesField(h, hour) &&
         matchesField(dom, dayOfMonth) &&
         matchesField(mo, month) &&
         matchesField(dow, dayOfWeek);
}

function matchesField(value: number, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern.includes(',')) {
    return pattern.split(',').some(p => matchesField(value, p.trim()));
  }
  if (pattern.includes('-')) {
    const [start, end] = pattern.split('-').map(Number);
    return value >= start && value <= end;
  }
  if (pattern.includes('/')) {
    const [base, step] = pattern.split('/');
    const start = base === '*' ? 0 : Number(base);
    return (value - start) % Number(step) === 0 && value >= start;
  }
  return value === Number(pattern);
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function toggleWeekday(value: number) {
  if (!simpleConfig.value.weekdays) {
    simpleConfig.value.weekdays = [];
  }
  const index = simpleConfig.value.weekdays.indexOf(value);
  if (index > -1) {
    simpleConfig.value.weekdays.splice(index, 1);
  } else {
    simpleConfig.value.weekdays.push(value);
  }
}

function validateField(field: keyof typeof cronParts.value) {
  const value = cronParts.value[field];
  if (value !== '*' && !/^[*0-9,-/]+$/.test(value)) {
    // 无效值，可以在这里添加错误提示
  }
}

function parseInitialValue() {
  const parts = props.modelValue.split(' ');
  if (parts.length >= 5) {
    cronParts.value.minute = parts[0];
    cronParts.value.hour = parts[1];
    cronParts.value.dayOfMonth = parts[2];
    cronParts.value.month = parts[3];
    cronParts.value.dayOfWeek = parts[4];
    if (parts[5]) cronParts.value.year = parts[5];
  }
}

watch(cronExpression, (newVal) => {
  emit('update:modelValue', newVal);
  emit('change', newVal);
}, { immediate: true });

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== cronExpression.value) {
    parseInitialValue();
  }
});

parseInitialValue();
</script>

<style scoped>
.cron-picker {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: hsl(var(--surface));
  border-radius: 12px;
  border: 1px solid hsl(var(--border));
  overflow: hidden;
}

.cron-picker-tabs {
  display: flex;
  border-bottom: 1px solid hsl(var(--border));
}

.cron-picker-tab {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
  position: relative;
}

.cron-picker-tab:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-container-high));
}

.cron-picker-tab--active {
  color: hsl(var(--primary));
  font-weight: 500;
}

.cron-picker-tab--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: hsl(var(--primary));
}

.cron-picker-content {
  padding: 20px;
}

.cron-simple-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cron-form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cron-form-label {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
}

.cron-weekdays {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cron-weekday-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--surface));
  color: hsl(var(--text-secondary));
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.cron-weekday-btn:hover {
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.cron-weekday-btn--selected {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: white;
}

.cron-monthdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.cron-monthday-btn {
  height: 32px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--surface));
  color: hsl(var(--text-secondary));
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.cron-monthday-btn:hover {
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.cron-monthday-btn--selected {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: white;
}

.cron-advanced-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cron-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.cron-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cron-field-label {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text));
}

.cron-field-hint {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

.cron-picker-preview {
  padding: 16px 20px;
  background: hsl(var(--surface-container-high));
  border-top: 1px solid hsl(var(--border));
}

.cron-preview-label {
  font-size: 12px;
  color: hsl(var(--text-muted));
  margin-bottom: 4px;
}

.cron-preview-value {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--primary));
  padding: 8px 12px;
  background: hsl(var(--surface));
  border-radius: 8px;
  margin-bottom: 8px;
}

.cron-preview-desc {
  font-size: 13px;
  color: hsl(var(--text-secondary));
}

.cron-next-executions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed hsl(var(--border));
}

.cron-next-label {
  font-size: 12px;
  color: hsl(var(--text-muted));
  margin-bottom: 6px;
}

.cron-next-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cron-next-item {
  font-size: 12px;
  color: hsl(var(--text-secondary));
  padding: 4px 8px;
  background: hsl(var(--surface));
  border-radius: 4px;
}

@media (max-width: 575.98px) {
  .cron-field-row {
    grid-template-columns: 1fr;
  }
  
  .cron-monthdays {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
