<template>
  <div
    :class="inputWrapperClass"
    :role="hasStackedChrome ? 'group' : undefined"
    :aria-label="hasStackedChrome ? (label || t('components.dataEntry.input.fallbackAriaLabel')) : undefined"
  >
    <label v-if="hasStackedChrome && (label || $slots.label)" :class="labelClass" :for="inputId">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="input-required" aria-hidden="true">*</span>
    </label>

    <div :class="inputLineClass" @click="focusInput" role="presentation">
      <div v-if="prefix || $slots.prefix" class="input-affix input-prefix">
        <slot name="prefix">
          <Icon v-if="prefixIcon" :name="prefixIcon" :size="16" />
          <span v-else>{{ prefix }}</span>
        </slot>
      </div>

      <input
        ref="inputRef"
        v-model="modelValue"
        :type="currentType"
        :class="inputClass"
        :style="inputStyle"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :name="name"
        :id="inputId"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @change="handleChange"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
      />

      <div v-if="hasTrailingAffix" class="input-trailing">
        <button
          v-if="copyable && modelValue && !disabled"
          type="button"
          class="input-copy"
          @click.stop="copyToClipboard"
          @keydown.enter="copyToClipboard"
          @keydown.space.prevent="copyToClipboard"
          :title="copied ? t('components.dataEntry.input.copied') : t('components.dataEntry.input.copy')"
          :aria-label="t('components.dataEntry.input.copyContent')"
          tabindex="0"
        >
          <Icon :name="copied ? 'check' : 'copy'" :size="16" aria-hidden="true" />
        </button>

        <button
          v-if="clearable && modelValue && !disabled && !readonly"
          type="button"
          class="input-clear"
          @click.stop="clearInput"
          @keydown.enter="clearInput"
          @keydown.space.prevent="clearInput"
          :aria-label="t('components.dataEntry.input.clear')"
          tabindex="0"
        >
          <Icon name="x-circle" :size="16" aria-hidden="true" />
        </button>

        <button
          v-if="type === 'password' && showPasswordToggle"
          type="button"
          class="input-password-toggle"
          @click.stop="togglePassword"
          @keydown.enter="togglePassword"
          @keydown.space.prevent="togglePassword"
          :aria-label="passwordVisible ? t('components.dataEntry.input.hidePassword') : t('components.dataEntry.input.showPassword')"
          :aria-pressed="passwordVisible"
          tabindex="0"
        >
          <Icon :name="passwordVisible ? 'eye-off' : 'eye'" :size="16" aria-hidden="true" />
        </button>

        <div v-if="suffix || $slots.suffix" class="input-affix input-suffix">
          <slot name="suffix">
            <Icon v-if="suffixIcon" :name="suffixIcon" :size="16" />
            <span v-else>{{ suffix }}</span>
          </slot>
        </div>
      </div>
    </div>

    <div v-if="hasStackedChrome && (helpText || displayError || $slots.help)" :class="helpClass">
      <slot name="help">
        <Icon v-if="displayError" name="alert-circle" :size="14" />
        {{ displayError || helpText }}
      </slot>
    </div>

    <div v-if="hasStackedChrome && showCount && maxlength" class="input-count">
      {{ String(modelValue).length }} / {{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, toRef, useSlots } from 'vue';
import Icon from '../utility/Icon.vue';
import type { InputSize } from '@ocpui/vue/types';
import { useComponentSize, SIZE_HEIGHT_PX } from '../composables/useComponentSize';
import {
  useFieldValidation,
  type ValidatorType,
  type UseFieldValidationOptions,
} from '@ocpui/vue/validation';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useComponentId } from '../../composables/useComponentId';

const { uiT: t } = useUiT();
const slots = useSlots();

type ValidateTrigger = 'blur' | 'input' | 'change';

interface Props {
  modelValue?: string | number;
  type?: string;
  size?: InputSize;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  copyable?: boolean;
  showPasswordToggle?: boolean;
  prefix?: string;
  suffix?: string;
  prefixIcon?: string;
  suffixIcon?: string;
  maxlength?: number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  autocomplete?: string;
  autofocus?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  showCount?: boolean;
  customClass?: string;
  validateType?: ValidatorType | ValidatorType[];
  validateTrigger?: ValidateTrigger;
  validateOnMount?: boolean;
  validateDebounce?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidate?: (value: unknown) => boolean | string;
  validateMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: undefined,
  disabled: false,
  readonly: false,
  clearable: false,
  copyable: false,
  showPasswordToggle: true,
  required: false,
  showCount: false,
  customClass: '',
  validateTrigger: 'blur',
  validateOnMount: false,
  validateDebounce: 300,
});

const resolvedSize = useComponentSize(toRef(props, 'size'));

const modelValue = defineModel<string | number>({ default: '' });

const emit = defineEmits<{
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
  'input': [event: Event];
  'change': [event: Event];
  'keydown': [event: KeyboardEvent];
  'keyup': [event: KeyboardEvent];
  'clear': [];
  'validate': [result: { valid: boolean; message?: string }];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
const passwordVisible = ref(false);
const copied = ref(false);
const generatedId = useComponentId('input');
let copyTimeout: ReturnType<typeof setTimeout> | null = null;
let validateDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const inputId = computed(() => props.id || generatedId);

const currentType = computed(() => {
  if (props.type === 'password' && passwordVisible.value) {
    return 'text';
  }
  return props.type || 'text';
});

const validationOptions = computed<UseFieldValidationOptions>(() => ({
  validatorType: props.validateType,
  required: props.required,
  minLength: props.minLength,
  maxLength: props.maxLength,
  pattern: props.pattern,
  validate: props.customValidate,
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
  markDirty,
  markTouched,
  reset: resetValidation,
} = useFieldValidation(modelValue, validationOptions.value);

const displayError = computed(() => {
  if (props.error) return props.error;
  if (!isValid.value && isTouched.value) return validationError.value;
  return '';
});

const runValidation = () => {
  const result = validate();
  emit('validate', { valid: result, message: result ? undefined : validationError.value });
  return result;
};

const debouncedValidation = () => {
  if (validateDebounceTimer) clearTimeout(validateDebounceTimer);
  validateDebounceTimer = setTimeout(() => {
    runValidation();
  }, props.validateDebounce);
};

const sizeMap: Record<'sm' | 'md' | 'lg', { height: string; fontSize: string }> = {
  sm: { height: `${SIZE_HEIGHT_PX.sm}px`, fontSize: '14px' },
  md: { height: `${SIZE_HEIGHT_PX.md}px`, fontSize: '14px' },
  lg: { height: `${SIZE_HEIGHT_PX.lg}px`, fontSize: '16px' },
};

const showHelpBlock = computed(() => {
  return Boolean(props.helpText || displayError.value || slots.help);
});

const hasStackedChrome = computed(() => {
  return Boolean(
    props.label ||
      slots.label ||
      showHelpBlock.value ||
      (props.showCount && props.maxlength),
  );
});

const inputWrapperClass = computed(() => {
  const classes = ['input-wrapper'];
  if (hasStackedChrome.value) {
    classes.push('input-wrapper--stacked');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const labelClass = computed(() => {
  return ['input-label', { 'input-label--required': props.required }];
});

const hasTrailingAffix = computed(() => {
  return (
    props.copyable ||
    props.clearable ||
    (props.type === 'password' && props.showPasswordToggle) ||
    Boolean(props.suffix || props.suffixIcon || slots.suffix)
  );
});

const inputLineClass = computed(() => {
  const classes = ['input-line', 'input-container', `input-line--${resolvedSize.value}`];
  if (props.type === 'search') {
    classes.push('input-line--search');
  }
  if (isFocused.value) {
    classes.push('input-line--focused', 'input-container--focused');
  }
  if (props.disabled) {
    classes.push('input-line--disabled', 'input-container--disabled');
  }
  if (props.readonly) {
    classes.push('input-line--readonly', 'input-container--readonly');
  }
  if (props.error || displayError.value) {
    classes.push('input-line--error', 'input-container--error');
  }
  if (hasTrailingAffix.value) {
    classes.push('input-line--has-trailing');
  }
  return classes;
});

const inputClass = computed(() => {
  const classes = ['input', `input--${resolvedSize.value}`];
  if (props.type === 'search') {
    classes.push('input--search');
  }
  return classes;
});

const inputStyle = computed(() => {
  const size = sizeMap[resolvedSize.value];
  return {
    height: size.height,
    fontSize: size.fontSize,
  };
});

const helpClass = computed(() => {
  const classes = ['input-help'];
  if (props.error) {
    classes.push('input-help--error');
  }
  return classes;
});

const focusInput = () => {
  inputRef.value?.focus();
};

const clearInput = () => {
  modelValue.value = '';
  emit('clear');
  nextTick(() => {
    focusInput();
  });
};

const togglePassword = () => {
  passwordVisible.value = !passwordVisible.value;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(String(modelValue.value));
    copied.value = true;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    if (import.meta.env.DEV) console.warn('复制失败:', err);
  }
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  markTouched();
  if (props.validateTrigger === 'blur' && props.validateType) {
    runValidation();
  }
  emit('blur', event);
};

const handleInput = (event: Event) => {
  markDirty();
  if (props.validateTrigger === 'input' && props.validateType) {
    debouncedValidation();
  }
  emit('input', event);
};

const handleChange = (event: Event) => {
  markDirty();
  if (props.validateTrigger === 'change' && props.validateType) {
    runValidation();
  }
  emit('change', event);
};

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event);
};

const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event);
};

onMounted(() => {
  if (props.autofocus) {
    focusInput();
  }
  if (props.validateOnMount && props.validateType) {
    markTouched();
    runValidation();
  }
});

onUnmounted(() => {
  if (copyTimeout) {
    clearTimeout(copyTimeout);
    copyTimeout = null;
  }
  if (validateDebounceTimer) {
    clearTimeout(validateDebounceTimer);
    validateDebounceTimer = null;
  }
});

defineExpose({
  focus: focusInput,
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  input: inputRef,
  validate: runValidation,
  resetValidation,
  isValid,
  isDirty,
  isTouched,
});
</script>

<style scoped>
.input-wrapper:not(.input-wrapper--stacked) {
  display: contents;
}

.input-wrapper--stacked {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-family: var(--font-sans);
}

.input-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: hsl(var(--text));
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.input-required {
  color: hsl(var(--error));
}

.input-line {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md-md);
  background: hsl(var(--surface));
  overflow: hidden;
  transition:
    background-color var(--transition-fast) var(--ease-out),
    border-color var(--transition-fast) var(--ease-out),
    box-shadow var(--transition-fast) var(--ease-out),
    opacity var(--transition-fast) var(--ease-out);
}

.input-line--sm {
  min-height: 32px;
  padding: 0 var(--space-3);
}

.input-line--md {
  min-height: 36px;
  padding: 0 var(--space-4);
}

.input-line--lg {
  min-height: 40px;
  padding: 0 var(--space-5);
}

.input-line:hover:not(.input-line--disabled):not(.input-line--readonly) {
  border-color: hsl(var(--border-hover));
}

.input-line--focused {
  border-color: hsl(var(--border-focus, var(--primary)));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.input-line--disabled {
  background: hsl(var(--surface-container-high));
  cursor: not-allowed;
  opacity: 0.6;
}

.input-line--readonly {
  background: hsl(var(--surface-container-high));
}

.input-line--error {
  border-color: hsl(var(--error));
}

.input-line--error.input-line--focused {
  box-shadow: 0 0 0 3px hsl(var(--error) / 0.1);
}

.input-trailing {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding-right: var(--space-2);
  pointer-events: none;
  z-index: 1;
}

.input-trailing > * {
  pointer-events: auto;
}

.input {
  flex: 1;
  box-sizing: border-box;
  width: 100%;
  border: none;
  background: transparent;
  color: hsl(var(--text));
  outline: none;
  min-width: 0;
  padding: 0;
  box-shadow: none;
}

.input:hover,
.input:focus,
.input:focus-visible {
  border: none;
  box-shadow: none;
  outline: none;
}

.input--sm,
.input--md,
.input--lg {
  padding: 0;
}

.input[type='search'] {
  -webkit-appearance: none;
  appearance: none;
}

.input[type='search']::-webkit-search-decoration,
.input[type='search']::-webkit-search-cancel-button,
.input[type='search']::-webkit-search-results-button,
.input[type='search']::-webkit-search-results-decoration {
  -webkit-appearance: none;
  appearance: none;
}

.input::placeholder {
  color: hsl(var(--text-muted));
}

.input-line--has-trailing.input-line--sm {
  padding-right: 2.5rem;
}

.input-line--has-trailing.input-line--md {
  padding-right: 2.75rem;
}

.input-line--has-trailing.input-line--lg {
  padding-right: 3rem;
}

.input:disabled {
  cursor: not-allowed;
}

.input-affix {
  display: flex;
  align-items: center;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
}

.input-prefix {
  margin-right: var(--space-1);
}

.input-suffix {
  margin-left: var(--space-1);
}

.input-clear,
.input-copy,
.input-password-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
  border: none;
  background: transparent;
  color: hsl(var(--text-muted));
  cursor: pointer;
  border-radius: var(--radius-md-sm);
  transition: color var(--transition-fast) var(--ease-out), background-color var(--transition-fast) var(--ease-out), border-color var(--transition-fast) var(--ease-out);
  flex-shrink: 0;
}

.input-clear:hover,
.input-copy:hover,
.input-password-toggle:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-container-high));
}

.input-copy {
  color: hsl(var(--primary));
}

.input-copy:hover {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
}

.input-help {
  font-size: var(--font-size-xs);
  color: hsl(var(--text-muted));
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.input-help--error {
  color: hsl(var(--error));
}

.input-count {
  font-size: var(--font-size-xs);
  color: hsl(var(--text-muted));
  text-align: right;
}

@media (max-width: 639.98px) {
  .input-line {
    min-height: var(--touch-min-size);
  }
}
</style>
