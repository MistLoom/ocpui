&lt;!--
日期格式选择器组件

## 组件说明
用于选择和自定义日期格式的组件，支持预设格式选择和自定义格式输入，并提供实时预览。

## 公开属性
- `modelValue` (string): 绑定的日期格式值，必选
- `label` (string, 可选): 组件标签，默认为 '日期格式'
- `presets` (DateFormatPreset[], 可选): 预设格式列表
- `customClass` (string, 可选): 自定义类名

## 事件
- `update:modelValue` (value: string): 值变更时触发
- `change` (value: string, isValid: boolean): 变更时触发，返回格式值和是否有效

## 方法
- `validate()`: 验证当前格式是否有效
- `getPreview()`: 获取当前格式的预览值

## 使用方式
```vue
&lt;DateFormatSelect
  v-model="dateFormat"
  label="日期格式"
  @change="handleDateFormatChange"
/&gt;
```
--&gt;
<template>
  <div :class="selectClass">
    <!-- 预设选择 -->
    <div class="dateformat-presets">
      <label class="dateformat-label">{{ label }}</label>
      <Select
        :model-value="selectedPreset"
        :options="presetOptions"
        :placeholder="t('components.dataEntry.dateFormatSelect.presetPlaceholder')"
        @update:model-value="handlePresetChange"
      />
    </div>

    <!-- 自定义输入 -->
    <div class="dateformat-custom">
      <div class="dateformat-input-wrapper">
        <Input
          v-model="customFormat"
          :placeholder="t('components.dataEntry.dateFormatSelect.customPlaceholder')"
          @blur="handleCustomBlur"
          @input="handleCustomInput"
        />
        <Tooltip :content="formatHelp" position="top">
          <button type="button" class="dateformat-help-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </Tooltip>
      </div>
      <span v-if="errorMessage" class="dateformat-error">{{ errorMessage }}</span>
    </div>

    <!-- 实时预览 -->
    <div class="dateformat-preview">
      <span class="dateformat-preview-label">{{ t('components.dataEntry.dateFormatSelect.previewLabel') }}</span>
      <span class="dateformat-preview-value">{{ previewValue }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Select from './Select.vue';
import Input from './Input.vue';
import { Tooltip } from '../feedback';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

export interface DateFormatPreset {
  value: string;
  label: string;
  format: string;
}

interface Props {
  modelValue: string;
  label?: string;
  presets?: DateFormatPreset[];
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: '日期格式',
  presets: () => [
    { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD', format: 'YYYY-MM-DD' },
    { value: 'yyyy/mm/dd', label: 'YYYY/MM/DD', format: 'YYYY/MM/DD' },
    { value: 'dd-mm-yyyy', label: 'DD-MM-YYYY', format: 'DD-MM-YYYY' },
    { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY', format: 'DD/MM/YYYY' },
    { value: 'mm-dd-yyyy', label: 'MM-DD-YYYY', format: 'MM-DD-YYYY' },
    { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY', format: 'MM/DD/YYYY' },
    { value: 'yyyy年mm月dd日', label: 'YYYY年MM月DD日', format: 'YYYY年MM月DD日' },
    { value: 'yyyy.mm.dd', label: 'YYYY.MM.DD', format: 'YYYY.MM.DD' },
  ],
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string, isValid: boolean];
}>();

// State
const selectedPreset = ref('');
const customFormat = ref(props.modelValue);
const errorMessage = ref('');

// Computed
const selectClass = computed(() => {
  const classes = ['dateformat-select'];
  if (props.customClass) classes.push(props.customClass);
  if (errorMessage.value) classes.push('dateformat-select--error');
  return classes;
});

const presetOptions = computed(() =>
  props.presets.map(p => ({
    value: p.value,
    label: p.label,
  }))
);

const formatHelp = computed(() => {
  return `格式说明：
YYYY - 四位年份 (2024)
YY - 两位年份 (24)
MM - 两位月份 (01-12)
M - 一位月份 (1-12)
DD - 两位日期 (01-31)
D - 一位日期 (1-31)`;
});

const previewValue = computed(() => {
  const now = new Date();
  try {
    return formatDate(now, customFormat.value || 'YYYY-MM-DD');
  } catch (e) {
    return '无效格式';
  }
});

// Methods
const formatDate = (date: Date, format: string): string => {
  if (!date || isNaN(date.getTime())) {
    return '无效日期';
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return format
    .replace(/YYYY/g, String(year))
    .replace(/YY/g, String(year).slice(-2))
    .replace(/MM/g, String(month).padStart(2, '0'))
    .replace(/M/g, String(month))
    .replace(/DD/g, String(day).padStart(2, '0'))
    .replace(/D/g, String(day));
};

const validateFormat = (format: string): boolean => {
  if (!format || !format.trim()) {
    errorMessage.value = '格式不能为空';
    return false;
  }

  // Check for valid format tokens
  const validTokens = /YYYY|YY|MM|M|DD|D/g;
  const hasValidToken = validTokens.test(format);

  if (!hasValidToken) {
    errorMessage.value = '格式必须包含至少一个有效标记（YYYY, MM, DD等）';
    return false;
  }

  errorMessage.value = '';
  return true;
};

const handlePresetChange = (value: string | number | (string | number)[] | undefined) => {
  const strValue = String(value);
  selectedPreset.value = strValue;
  const preset = props.presets.find(p => p.value === strValue);
  if (preset) {
    customFormat.value = preset.format;
    errorMessage.value = '';
    emit('update:modelValue', preset.format);
    emit('change', preset.format, true);
  }
};

const handleCustomInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  customFormat.value = value;
  // Clear preset selection when custom input changes
  const matchingPreset = props.presets.find(p => p.format === value);
  selectedPreset.value = matchingPreset ? matchingPreset.value : 'custom';
};

const handleCustomBlur = () => {
  const isValid = validateFormat(customFormat.value);
  if (isValid) {
    emit('update:modelValue', customFormat.value);
  }
  emit('change', customFormat.value, isValid);
};

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== customFormat.value) {
    customFormat.value = newValue;
    const matchingPreset = props.presets.find(p => p.format === newValue);
    selectedPreset.value = matchingPreset ? matchingPreset.value : 'custom';
  }
}, { immediate: true });

// Expose
defineExpose({
  validate: () => validateFormat(customFormat.value),
  getPreview: () => previewValue.value,
});
</script>

<style scoped>
.dateformat-select {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.dateformat-label {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  margin-bottom: 6px;
  display: block;
}

.dateformat-presets {
  display: flex;
  flex-direction: column;
}

.dateformat-custom {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dateformat-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dateformat-input-wrapper :deep(.input-line),
.dateformat-input-wrapper :deep(.input-wrapper) {
  flex: 1;
}

.dateformat-help-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--surface-container-high));
  border-radius: 8px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
  flex-shrink: 0;
}

.dateformat-help-btn:hover {
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
  background: hsl(var(--surface-hover));
}

.dateformat-help-btn svg {
  width: 18px;
  height: 18px;
}

.dateformat-error {
  font-size: 12px;
  color: hsl(var(--error));
}

.dateformat-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: hsl(var(--surface-container-high));
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
}

.dateformat-preview-label {
  font-size: 12px;
  color: hsl(var(--text-muted));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dateformat-preview-value {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--primary));
  font-family: monospace;
}

.dateformat-select--error .dateformat-preview {
  border-color: hsl(var(--error) / 0.3);
}
</style>
