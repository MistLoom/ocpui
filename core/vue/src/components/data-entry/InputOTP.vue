&lt;!--
InputOTP 验证码输入组件

## 组件说明
用于输入一次性验证码(OTP)的组件，支持自动聚焦、粘贴输入、数字验证等功能。

## 公开属性
- modelValue: string - 绑定值
- length: number - 输入框数量，默认 6
- disabled: boolean - 是否禁用
- size: 'sm' | 'md' | 'lg' - 尺寸，默认 'md'
- mask: boolean - 是否显示掩码
- customClass: string - 自定义类名

## 事件
- update:modelValue - 值变更时触发
- complete - 输入完成时触发
- change - 值变更时触发

## 使用方式
```vue
&lt;InputOTP v-model="otpCode" :length="6" :mask="false" /&gt;
```
--&gt;
<template>
  <div :class="otpClass" @paste="handlePaste" role="group" :aria-label="t('components.dataEntry.inputOTP.ariaLabel')">
    <input
      v-for="(_, index) in digits"
      :key="index"
      :ref="el => setInputRef(el as HTMLInputElement, index)"
      v-model="digits[index]"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      :class="inputClass(index)"
      :disabled="disabled"
      :aria-label="t('components.dataEntry.inputOTP.ariaLabelAtIndex', { index: index + 1 })"
      @input="handleInput($event, index)"
      @keydown="handleKeydown($event, index)"
      @focus="handleFocus(index)"
      @blur="handleBlur"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

type OTPSize = ComponentSize;

interface Props {
  modelValue?: string;
  length?: number;
  disabled?: boolean;
  size?: OTPSize;
  mask?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  length: 6,
  disabled: false,
  size: 'md',
  mask: false,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [string];
  'complete': [string];
  'change': [string];
}>();

const digits = ref<string[]>(Array(props.length).fill(''));
const inputRefs = ref<(HTMLInputElement | null)[]>([]);
const focusedIndex = ref(-1);

const otpClass = computed(() => {
  const classes = ['otp-input', `otp-input--${props.size}`];
  if (props.disabled) {
    classes.push('otp-input--disabled');
  }
  if (props.mask) {
    classes.push('otp-input--mask');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const inputClass = (index: number) => {
  const classes = ['otp-input-item'];
  if (focusedIndex.value === index) {
    classes.push('otp-input-item--focused');
  }
  if (digits.value[index]) {
    classes.push('otp-input-item--filled');
  }
  return classes;
};

const setInputRef = (el: HTMLInputElement | null, index: number) => {
  if (el) {
    inputRefs.value[index] = el;
  }
};

const focusInput = (index: number) => {
  nextTick(() => {
    const input = inputRefs.value[index];
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const handleInput = (e: Event, index: number) => {
  const target = e.target as HTMLInputElement;
  let value = target.value;
  
  // Only allow numeric input
  value = value.replace(/[^0-9]/g, '');
  
  // Take only the last character if multiple
  if (value.length > 1) {
    value = value.slice(-1);
  }
  
  digits.value[index] = value;
  
  // Update model value
  const newValue = digits.value.join('');
  emit('update:modelValue', newValue);
  emit('change', newValue);
  
  // Auto-focus next input
  if (value && index < props.length - 1) {
    focusInput(index + 1);
  }
  
  // Check if complete
  if (newValue.length === props.length) {
    emit('complete', newValue);
  }
};

const handleKeydown = (e: KeyboardEvent, index: number) => {
  switch (e.key) {
    case 'Backspace':
      if (!digits.value[index] && index > 0) {
        // Move to previous input if current is empty
        e.preventDefault();
        digits.value[index - 1] = '';
        focusInput(index - 1);
        updateModelValue();
      } else if (digits.value[index]) {
        // Clear current input
        digits.value[index] = '';
        updateModelValue();
      }
      break;
      
    case 'ArrowLeft':
      if (index > 0) {
        e.preventDefault();
        focusInput(index - 1);
      }
      break;
      
    case 'ArrowRight':
      if (index < props.length - 1) {
        e.preventDefault();
        focusInput(index + 1);
      }
      break;
      
    case 'Home':
      e.preventDefault();
      focusInput(0);
      break;
      
    case 'End':
      e.preventDefault();
      focusInput(props.length - 1);
      break;
      
    default:
      // Allow numeric keys
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        digits.value[index] = e.key;
        
        // Update model value
        const newValue = digits.value.join('');
        emit('update:modelValue', newValue);
        emit('change', newValue);
        
        // Auto-focus next input
        if (index < props.length - 1) {
          focusInput(index + 1);
        }
        
        // Check if complete
        if (newValue.length === props.length) {
          emit('complete', newValue);
        }
      }
  }
};

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const pastedData = e.clipboardData?.getData('text') || '';
  const numericData = pastedData.replace(/[^0-9]/g, '').slice(0, props.length);
  
  if (numericData) {
    // Fill digits with pasted data
    for (let i = 0; i < props.length; i++) {
      digits.value[i] = numericData[i] || '';
    }
    
    // Update model value
    const newValue = digits.value.join('');
    emit('update:modelValue', newValue);
    emit('change', newValue);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = digits.value.findIndex(d => !d);
    if (nextEmptyIndex !== -1) {
      focusInput(nextEmptyIndex);
    } else {
      focusInput(props.length - 1);
    }
    
    // Check if complete
    if (newValue.length === props.length) {
      emit('complete', newValue);
    }
  }
};

const handleFocus = (index: number) => {
  focusedIndex.value = index;
};

const handleBlur = () => {
  focusedIndex.value = -1;
};

const updateModelValue = () => {
  const newValue = digits.value.join('');
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

// Watch for external value changes
watch(() => props.modelValue, (newVal) => {
  const chars = newVal.split('').slice(0, props.length);
  for (let i = 0; i < props.length; i++) {
    digits.value[i] = chars[i] || '';
  }
}, { immediate: true });

// Watch for length changes
watch(() => props.length, (newLength) => {
  const currentLength = digits.value.length;
  if (newLength > currentLength) {
    digits.value = [...digits.value, ...Array(newLength - currentLength).fill('')];
  } else if (newLength < currentLength) {
    digits.value = digits.value.slice(0, newLength);
    // Update model value if length decreased
    updateModelValue();
  }
});
</script>

<style scoped>
.otp-input {
  display: flex;
  gap: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.otp-input-item {
  width: 44px;
  height: 52px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: hsl(var(--text));
  background: hsl(var(--surface-inset));
  border: 2px solid hsl(var(--border));
  border-radius: 12px;
  outline: none;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  caret-color: hsl(var(--primary));
}

.otp-input-item:hover:not(:disabled) {
  border-color: hsl(var(--border-hover));
}

.otp-input-item:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
}

.otp-input-item--filled {
  background: hsl(var(--surface-container-high));
  border-color: hsl(var(--primary) / 0.3);
}

.otp-input-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: hsl(var(--surface-container-high));
}

/* Size variants */
.otp-input--sm .otp-input-item {
  width: 36px;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.otp-input--md .otp-input-item {
  width: 44px;
  height: 52px;
  font-size: 20px;
}

.otp-input--lg .otp-input-item {
  width: 52px;
  height: 60px;
  font-size: 24px;
  border-radius: 16px;
}

/* Masked input style */
.otp-input--mask .otp-input-item {
  -webkit-text-security: disc;
  text-security: disc;
}

/* Responsive styles */
@media (max-width: 575.98px) {
  .otp-input {
    gap: 6px;
    justify-content: center;
  }
  
  .otp-input-item {
    width: 40px !important;
    height: 48px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
}

/* Animation for filled state */
@keyframes otpPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.otp-input-item--filled:not(:focus) {
  animation: otpPulse 0.3s ease;
}
</style>
