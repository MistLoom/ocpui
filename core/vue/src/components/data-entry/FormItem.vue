<template>
  <div :class="formItemClass">
    <label v-if="label" :class="labelClass" :style="labelStyle">
      <span v-if="required" class="form-item-required">*</span>
      {{ label }}
      <span v-if="optional" class="form-item-optional">{{ t('components.dataEntry.formItem.optional') }}</span>
    </label>
    <div class="form-item-content">
      <div class="form-item-input-wrapper">
        <slot />
        <span v-if="suffix" class="form-item-suffix">{{ suffix }}</span>
      </div>
      <div v-if="displayError" class="form-item-error">
        {{ displayError }}
      </div>
      <div v-else-if="help" class="form-item-help">
        {{ help }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, provide } from 'vue';
import { FORM_CONTEXT_KEY, FORM_ITEM_CONTEXT_KEY } from '@ocpui/vue/types';
import {
  useFieldValidation,
  type ValidatorType,
  type UseFieldValidationOptions,
} from '@ocpui/vue/validation';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface Props {
  label?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  help?: string;
  suffix?: string;
  labelWidth?: string | number;
  prop?: string;
  customClass?: string;
  validateType?: ValidatorType | ValidatorType[];
  validateTrigger?: 'blur' | 'input' | 'change';
  validateOnMount?: boolean;
  validateDebounce?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validateMessage?: string;
  name?: string;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  optional: false,
  error: '',
  help: '',
  suffix: '',
  labelWidth: undefined,
  prop: '',
  customClass: '',
  validateTrigger: 'blur',
  validateOnMount: false,
  validateDebounce: 300,
});

// 从 Form 组件注入配置
interface FormContext {
  model?: Record<string, unknown>;
  rules?: Record<string, any[]>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  labelPlacement?: 'left' | 'top';
  labelWidth?: string | number;
  registerItem?: (item: unknown) => void;
  unregisterItem?: (item: unknown) => void;
}

const formContext = inject<FormContext>(FORM_CONTEXT_KEY, {} as FormContext);

const fieldValue = ref<unknown>(undefined);
const localError = ref<string>('');

const validationOptions = computed<UseFieldValidationOptions>(() => ({
  validatorType: props.validateType,
  required: props.required,
  minLength: props.minLength,
  maxLength: props.maxLength,
  pattern: props.pattern,
  message: props.validateMessage,
  debounce: props.validateDebounce,
  name: props.name,
}));

const {
  error: validationError,
  isValid,
  isDirty,
  isTouched,
  validate,
  markTouched,
  reset: resetValidation,
} = useFieldValidation(fieldValue, validationOptions.value);

const displayError = computed(() => {
  if (props.error) return props.error;
  if (localError.value) return localError.value;
  if (!isValid.value && isTouched.value) return validationError.value;
  return '';
});

const formItemClass = computed(() => {
  const classes = ['form-item'];
  const placement = formContext.labelPlacement || 'top';
  const size = formContext.size || 'md';
  classes.push(`form-item--${placement}`);
  classes.push(`form-item--${size}`);
  if (props.error || displayError.value) {
    classes.push('form-item--error');
  }
  if (props.required) {
    classes.push('form-item--required');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const labelClass = computed(() => {
  const classes = ['form-item-label'];
  const placement = formContext.labelPlacement || 'top';
  classes.push(`form-item-label--${placement}`);
  return classes;
});

const labelStyle = computed(() => {
  const width = props.labelWidth ?? formContext.labelWidth;
  if (width && (formContext.labelPlacement === 'left' || props.labelWidth)) {
    return { width: typeof width === 'number' ? `${width}px` : width };
  }
  return {};
});

const setFieldValue = (value: unknown) => {
  fieldValue.value = value;
};

const setLocalError = (error: string) => {
  localError.value = error;
};

const clearLocalError = () => {
  localError.value = '';
};

provide(FORM_ITEM_CONTEXT_KEY, {
  get size() {
    return formContext.size;
  },
  validateType: computed(() => props.validateType),
  validateTrigger: computed(() => props.validateTrigger),
  validateOnMount: computed(() => props.validateOnMount),
  validateDebounce: computed(() => props.validateDebounce),
  setFieldValue,
  setLocalError,
  clearLocalError,
  markTouched,
});

const runValidate = async (): Promise<boolean> => {
  markTouched();
  const result = validate();
  return result;
};

const reset = () => {
  localError.value = '';
  fieldValue.value = undefined;
  resetValidation();
};

// 注册到 Form 组件
onMounted(() => {
  if (formContext.registerItem) {
    formContext.registerItem({ validate: runValidate, reset });
  }
});

onUnmounted(() => {
  if (formContext.unregisterItem) {
    formContext.unregisterItem({ validate: runValidate, reset });
  }
});

defineExpose({
  validate: runValidate,
  reset,
  isValid,
  isDirty,
  isTouched,
  setFieldValue,
  setLocalError,
  clearLocalError,
});
</script>

<style scoped>
.form-item {
  display: flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

/* 尺寸系统 - 基于 8px 栅格 */
.form-item--sm {
  gap: var(--space-2);
}

.form-item--md {
  gap: var(--space-2);
}

.form-item--lg {
  gap: var(--space-3);
}

/* 标签位置 - top */
.form-item--top {
  flex-direction: column;
}

/* 标签位置 - left */
.form-item--left {
  flex-direction: row;
  align-items: flex-start;
}

/* 标签样式 */
.form-item-label {
  font-weight: 500;
  color: hsl(var(--text));
  flex-shrink: 0;
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

/* 小尺寸标签 */
.form-item--sm .form-item-label {
  font-size: 13px;
}

/* 中尺寸标签 */
.form-item--md .form-item-label {
  font-size: 14px;
}

/* 大尺寸标签 */
.form-item--lg .form-item-label {
  font-size: 15px;
}

/* 标签位置 - top 样式 */
.form-item-label--top {
  margin-bottom: 8px;
}

/* 标签位置 - left 样式 */
.form-item-label--left {
  margin-bottom: 0;
  padding-top: 10px;
  min-width: 120px;
}

.form-item--sm .form-item-label--left {
  padding-top: 8px;
  min-width: 100px;
}

.form-item--lg .form-item-label--left {
  padding-top: 12px;
  min-width: 140px;
}

/* 必填标记 */
.form-item-required {
  color: hsl(var(--error, 0 84% 60%));
  margin-right: 4px;
  font-weight: 600;
}

/* 内容区域 */
.form-item-content {
  flex: 1;
  min-width: 0;
}

/* 错误提示 */
.form-item-error {
  color: hsl(var(--error, 0 84% 60%));
  font-size: 13px;
  margin-top: 6px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 帮助文本 */
.form-item-help {
  color: hsl(var(--text-secondary));
  font-size: 13px;
  margin-top: 6px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 可选标记 */
.form-item-optional {
  color: hsl(var(--text-muted));
  font-weight: 400;
  margin-left: 4px;
  font-size: 12px;
}

/* 输入框包装器 */
.form-item-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.form-item-input-wrapper > :deep(*:first-child) {
  flex: 1;
}

/* 后缀文本 */
.form-item-suffix {
  font-size: 14px;
  color: hsl(var(--text-secondary));
  white-space: nowrap;
  flex-shrink: 0;
  padding: 0 8px;
  border-radius: 4px;
  background-color: hsl(var(--bg-secondary));
  height: 32px;
  display: flex;
  align-items: center;
}

/* 错误状态 - 子元素边框高亮 */
.form-item--error :deep(.input-wrapper .input-line),
.form-item--error :deep(.input-wrapper .input-container),
.form-item--error :deep(.input-container-class),
.form-item--error :deep(.textarea),
.form-item--error :deep(.select-container),
.form-item--error :deep(.select-selector) {
  border-color: hsl(var(--error, 0 84% 60%));
}

.form-item--error :deep(.input-wrapper .input-line--focused),
.form-item--error :deep(.input-wrapper .input-container--focused),
.form-item--error :deep(.input-container-class--focused),
.form-item--error :deep(.textarea:focus),
.form-item--error :deep(.select-container--focused),
.form-item--error :deep(.select-selector--focused) {
  box-shadow: 0 0 0 3px hsl(var(--error, 0 84% 60%) / 0.1);
}

/* 焦点状态 */
.form-item :deep(.input-wrapper .input-line--focused),
.form-item :deep(.input-wrapper .input-container--focused),
.form-item :deep(.input-container-class--focused),
.form-item :deep(.textarea:focus),
.form-item :deep(.select-container--focused),
.form-item :deep(.select-selector--focused) {
  box-shadow: 0 0 0 3px hsl(var(--primary, 210 90% 50%) / 0.1);
}

/* 禁用状态 */
.form-item :deep(.input-wrapper .input-line--disabled),
.form-item :deep(.input-wrapper .input-container--disabled),
.form-item :deep(.input-container-class:disabled),
.form-item :deep(.textarea:disabled),
.form-item :deep(.select-container:disabled),
.form-item :deep(.select-selector:disabled) {
  background-color: hsl(var(--surface-container-low));
  border-color: hsl(var(--border-muted));
}

/* 响应式样式 */
@media (max-width: 768px) {
  .form-item--left {
    flex-direction: column;
  }
  
  .form-item-label--left {
    padding-top: 0;
    min-width: auto;
    margin-bottom: 8px;
  }
  
  .form-item--sm .form-item-label--left,
  .form-item--lg .form-item-label--left {
    padding-top: 0;
    min-width: auto;
    margin-bottom: 8px;
  }
}

@media (max-width: 576px) {
  .form-item--sm {
    gap: var(--space-1);
  }

  .form-item--md {
    gap: var(--space-1);
  }

  .form-item--lg {
    gap: var(--space-2);
  }
  
  .form-item-label {
    font-size: 13px !important;
  }
  
  .form-item-error,
  .form-item-help {
    font-size: 12px;
    margin-top: 4px;
  }
}
</style>
