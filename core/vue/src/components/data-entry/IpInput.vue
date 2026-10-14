&lt;!--
IpInput IP地址输入组件

## 组件说明
用于输入和验证IP地址的组件，支持IPv4和IPv6格式，可选CIDR子网掩码。

## 公开属性
- modelValue: string - 绑定值
- placeholder: string - 占位符，默认 "请输入IP地址"
- disabled: boolean - 是否禁用
- ipVersion: 'v4' | 'v6' | 'auto' - IP版本，默认 'auto'
- supportsCidr: boolean - 是否支持CIDR，默认 true
- showCidr: boolean - 是否显示CIDR输入框，默认 true
- customClass: string - 自定义类名
- helpText: string - 帮助文本

## 事件
- update:modelValue - 值变更时触发
- change - 值变更时触发，带验证状态
- blur - 失去焦点时触发
- focus - 获得焦点时触发

## 方法
- validate() - 验证当前输入值
- focus() - 聚焦输入框
- blur() - 失去焦点

## 使用方式
```vue
&lt;IpInput v-model="ipAddress" :ipVersion="'v4'" :showCidr="true" /&gt;
```
--&gt;
<template>
  <div :class="inputClass" role="group" :aria-label="t('components.dataEntry.ipInput.ariaLabel')">
    <div class="ip-input-wrapper">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="ip-input-field"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="t('components.dataEntry.ipInput.ipLabel')"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @paste="handlePaste"
        @keydown="handleKeydown"
      />
      <div v-if="showCidr && supportsCidr" class="ip-input-cidr">
        <span class="cidr-separator">/</span>
        <input
          v-model.number="cidrValue"
          type="number"
          class="cidr-input"
          :min="cidrMin"
          :max="cidrMax"
          :disabled="disabled"
          :aria-label="t('components.dataEntry.ipInput.cidrLabel')"
          @input="handleCidrInput"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />
      </div>
    </div>
    <div v-if="errorMessage" class="ip-input-error">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ errorMessage }}</span>
    </div>
    <div v-else-if="helpText" class="ip-input-help">{{ helpText }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

type IpVersion = 'v4' | 'v6' | 'auto';

interface Props {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  ipVersion?: IpVersion;
  supportsCidr?: boolean;
  showCidr?: boolean;
  customClass?: string;
  helpText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入IP地址',
  disabled: false,
  ipVersion: 'auto',
  supportsCidr: true,
  showCidr: true,
  customClass: '',
  helpText: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string, isValid: boolean];
  'blur': [event: FocusEvent];
  'focus': [event: FocusEvent];
}>();

const inputRef = ref<HTMLInputElement>();
const inputValue = ref('');
const cidrValue = ref<number | null>(null);
const errorMessage = ref('');
const isFocused = ref(false);

const inputClass = computed(() => {
  const classes = ['ip-input'];
  if (props.customClass) classes.push(props.customClass);
  if (errorMessage.value) classes.push('ip-input--error');
  if (isFocused.value) classes.push('ip-input--focused');
  if (props.disabled) classes.push('ip-input--disabled');
  return classes;
});

const cidrMin = computed(() => 0);
const cidrMax = computed(() => props.ipVersion === 'v6' ? 128 : 32);

// 更完善的 IP 地址正则表达式
const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}$|^(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}$|^(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})$|^:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)$|^fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}$|^::1$|^::$/;
const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/;
const ipv6CidrRegex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^(?:[0-9a-fA-F]{1,4}:){1,7}:\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^::1\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$|^::$\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/;

const validateIp = (ip: string): boolean => {
  if (!ip) {
    errorMessage.value = '';
    return true;
  }

  const trimmedIp = ip.trim();

  if (props.supportsCidr && trimmedIp.includes('/')) {
    const [, cidrPart] = trimmedIp.split('/');
    const cidr = parseInt(cidrPart, 10);

    if (isNaN(cidr)) {
      errorMessage.value = 'CIDR格式不正确';
      return false;
    }

    if (props.ipVersion === 'v4' || props.ipVersion === 'auto') {
      if (ipv4CidrRegex.test(trimmedIp)) {
        errorMessage.value = '';
        return true;
      }
    }
    if (props.ipVersion === 'v6' || props.ipVersion === 'auto') {
      if (ipv6CidrRegex.test(trimmedIp)) {
        errorMessage.value = '';
        return true;
      }
    }
    errorMessage.value = 'IP地址格式不正确';
    return false;
  }

  if (props.ipVersion === 'v4' || props.ipVersion === 'auto') {
    if (ipv4Regex.test(trimmedIp)) {
      errorMessage.value = '';
      return true;
    }
  }
  if (props.ipVersion === 'v6' || props.ipVersion === 'auto') {
    if (ipv6Regex.test(trimmedIp)) {
      errorMessage.value = '';
      return true;
    }
  }

  errorMessage.value = 'IP地址格式不正确';
  return false;
};

const parseValue = (value: string) => {
  if (props.supportsCidr && value.includes('/')) {
    const [ip, cidr] = value.split('/');
    inputValue.value = ip;
    const cidrNum = parseInt(cidr, 10);
    cidrValue.value = isNaN(cidrNum) ? null : cidrNum;
  } else {
    inputValue.value = value;
    cidrValue.value = null;
  }
};

const composeValue = (): string => {
  if (props.supportsCidr && props.showCidr && cidrValue.value !== null) {
    return `${inputValue.value}/${cidrValue.value}`;
  }
  return inputValue.value;
};

const handleInput = () => {
  const value = composeValue();
  emit('update:modelValue', value);
};

const handleCidrInput = () => {
  if (cidrValue.value !== null) {
    if (cidrValue.value < cidrMin.value) cidrValue.value = cidrMin.value;
    if (cidrValue.value > cidrMax.value) cidrValue.value = cidrMax.value;
  }
  const value = composeValue();
  emit('update:modelValue', value);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  const value = composeValue();
  const isValid = validateIp(value);
  emit('change', value, isValid);
  emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit('focus', event);
};

const handlePaste = (e: ClipboardEvent) => {
  const pastedText = e.clipboardData?.getData('text') || '';
  // 自动处理粘贴的 IP 地址格式
  if (pastedText) {
    parseValue(pastedText);
    const value = composeValue();
    emit('update:modelValue', value);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  // 处理 Tab 键导航
  if (e.key === 'Tab') {
    // 自动完成导航逻辑
  }
};

watch(() => props.modelValue, (newValue) => {
  if (newValue !== composeValue()) {
    parseValue(newValue);
    validateIp(newValue);
  }
}, { immediate: true });

watch(() => props.ipVersion, () => {
  // IP 版本变更时重新验证
  const value = composeValue();
  validateIp(value);
});

defineExpose({
  validate: () => validateIp(composeValue()),
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
});
</script>

<style scoped>
.ip-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.ip-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.ip-input--focused .ip-input-wrapper {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.ip-input--error .ip-input-wrapper {
  border-color: hsl(var(--error));
}

.ip-input--error.ip-input--focused .ip-input-wrapper {
  box-shadow: 0 0 0 3px hsl(var(--error) / 0.1);
}

.ip-input--disabled .ip-input-wrapper {
  opacity: 0.5;
  cursor: not-allowed;
}

.ip-input-field {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: hsl(var(--text));
  font-family: 'JetBrains Mono', monospace;
  outline: none;
  min-width: 0;
}

.ip-input-field::placeholder {
  color: hsl(var(--text-muted));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.ip-input-cidr {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.cidr-separator {
  font-size: 14px;
  color: hsl(var(--text-muted));
  font-weight: 500;
}

.cidr-input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  font-size: 14px;
  color: hsl(var(--text));
  font-family: 'JetBrains Mono', monospace;
  text-align: center;
  outline: none;
}

.cidr-input:focus {
  border-color: hsl(var(--primary));
}

.ip-input-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: hsl(var(--error));
}

.ip-input-error svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.ip-input-help {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

@media (max-width: 639.98px) {
  .ip-input-wrapper {
    flex-wrap: wrap;
  }

  .ip-input-field {
    width: 100%;
  }
}
</style>
