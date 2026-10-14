&lt;!--
自动完成组件

## 组件说明
提供输入建议和自动完成功能的输入框组件，支持自定义选项、搜索过滤和键盘导航。

## 公开属性
- `modelValue` (string | number, 可选): 绑定的值，默认为 ''
- `options` (Option[], 可选): 选项列表，默认为 []
- `placeholder` (string, 可选): 占位符文本，默认为 '请输入'
- `disabled` (boolean, 可选): 是否禁用，默认为 false
- `clearable` (boolean, 可选): 是否可清除，默认为 false
- `loading` (boolean, 可选): 是否加载中，默认为 false
- `filterMethod` ((inputValue: string, option: Option) =&gt; boolean, 可选): 自定义过滤方法
- `size` ('sm' | 'md' | 'lg', 可选): 组件尺寸，未设置时继承 FormItem/Form/容器密度
- `customClass` (string, 可选): 自定义类名

## 事件
- `update:modelValue` (value: string | number): 值变更时触发
- `select` (option: Option): 选择选项时触发
- `search` (value: string): 搜索时触发
- `focus` (): 获得焦点时触发
- `blur` (): 失去焦点时触发
- `clear` (): 清除内容时触发

## 方法
- `focus()`: 使输入框获得焦点
- `blur()`: 使输入框失去焦点

## 使用方式
```vue
&lt;AutoComplete
  v-model="value"
  :options="options"
  placeholder="请输入"
  :clearable="true"
  @select="handleSelect"
  @search="handleSearch"
/&gt;
```

```ts
const options = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' }
];
```
--&gt;
<template>
  <div :class="autoCompleteClass" v-bind="$attrs">
    <div class="autocomplete-input-wrapper">
      <input
        ref="inputRef"
        type="text"
        :class="inputClass"
        :placeholder="placeholder"
        :disabled="disabled"
        :value="inputValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <Icon v-if="clearable && inputValue" name="close" :size="14" class="autocomplete-clear" @click="handleClear" />
    </div>
    
    <Teleport to="body">
      <Transition name="autocomplete">
        <div
          v-if="visible && (loading || filteredOptions.length > 0)"
          ref="dropdownRef"
          class="autocomplete-dropdown"
          :style="floatingBaseStyle"
          role="listbox"
        >
          <div v-if="loading" class="autocomplete-loading">
            <span class="autocomplete-loading-spinner" />
            <span>{{ t('components.dataEntry.autoComplete.loading') }}</span>
          </div>
          <ul v-else class="autocomplete-options">
            <li
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              class="autocomplete-option"
              :class="{ 'autocomplete-option--selected': index === selectedIndex }"
              role="option"
              @click="handleSelect(option)"
              @mouseenter="selectedIndex = index"
            >
              <span class="autocomplete-option-label">{{ option.label }}</span>
            </li>
            <li v-if="filteredOptions.length === 0" class="autocomplete-option autocomplete-option--empty">
              <span class="autocomplete-option-label">{{ t('components.dataEntry.autoComplete.noMatch') }}</span>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch, toRef } from 'vue';
import { Icon } from '../utility';
import type { ComponentSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition } from '../composables/useFloatingPosition';
import { useComponentSize } from '../composables/useComponentSize';

const { uiT: t } = useUiT();

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  modelValue?: string | number;
  options?: Option[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  loading?: boolean;
  filterMethod?: (inputValue: string, option: Option) => boolean;
  size?: ComponentSize;
  customClass?: string;
  debounce?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  placeholder: '请输入',
  disabled: false,
  clearable: false,
  loading: false,
  filterMethod: undefined,
  size: undefined,
  customClass: '',
  debounce: 300,
});

const resolvedSize = useComponentSize(toRef(props, 'size'));

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'select': [option: Option];
  'search': [value: string];
  'focus': [];
  'blur': [];
  'clear': [];
}>();

const inputRef = ref<HTMLInputElement>();
const dropdownRef = ref<HTMLElement>();
const inputValue = ref('');
const visible = ref(false);
const selectedIndex = ref(-1);
const floatingBaseStyle = { position: 'fixed' as const };
let searchTimer: number | null = null;

const floating = useFloatingPosition({
  reference: inputRef,
  floating: dropdownRef,
  placement: 'bottom-start',
  matchWidth: true,
  offsetPx: 4,
});

const autoCompleteClass = computed(() => {
  const classes = ['autocomplete', `autocomplete--${resolvedSize.value}`];
  if (props.disabled) {
    classes.push('autocomplete--disabled');
  }
  if (visible.value) {
    classes.push('autocomplete--focused');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const inputClass = computed(() => {
  const classes = ['autocomplete-input'];
  if (props.clearable && inputValue.value) {
    classes.push('autocomplete-input--with-clear');
  }
  return classes.join(' ');
});

const filteredOptions = computed(() => {
  if (!inputValue.value) return props.options;
  
  if (props.filterMethod) {
    return props.options.filter(option => props.filterMethod!(inputValue.value, option));
  }
  
  return props.options.filter(option =>
    option.label.toLowerCase().includes(inputValue.value.toLowerCase())
  );
});

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  inputValue.value = value;
  emit('update:modelValue', value);
  
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  
  searchTimer = window.setTimeout(() => {
    emit('search', value);
  }, props.debounce);
  
  selectedIndex.value = -1;
};

const handleFocus = () => {
  visible.value = true;
  emit('focus');
};

const handleBlur = () => {
  setTimeout(() => {
    visible.value = false;
    emit('blur');
  }, 200);
};

const handleSelect = (option: Option) => {
  inputValue.value = option.label;
  emit('update:modelValue', option.value);
  emit('select', option);
  visible.value = false;
  selectedIndex.value = -1;
};

const handleClear = () => {
  inputValue.value = '';
  emit('update:modelValue', '');
  emit('clear');
  inputRef.value?.focus();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!visible.value) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      visible.value = true;
    }
    return;
  }
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredOptions.value.length - 1);
      scrollToSelected();
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
      scrollToSelected();
      break;
    case 'Enter':
      event.preventDefault();
      if (selectedIndex.value >= 0) {
        handleSelect(filteredOptions.value[selectedIndex.value]);
      }
      break;
    case 'Escape':
      visible.value = false;
      break;
  }
};

const scrollToSelected = () => {
  nextTick(() => {
    const dropdown = dropdownRef.value;
    if (!dropdown) return;
    const selectedOption = dropdown.querySelector('.autocomplete-option--selected') as HTMLElement;
    if (selectedOption) {
      const dropdownRect = dropdown.getBoundingClientRect();
      const optionRect = selectedOption.getBoundingClientRect();
      if (optionRect.bottom > dropdownRect.bottom) {
        dropdown.scrollTop += optionRect.bottom - dropdownRect.bottom;
      } else if (optionRect.top < dropdownRect.top) {
        dropdown.scrollTop -= dropdownRect.top - optionRect.top;
      }
    }
  });
};

const handleClickOutside = (event: MouseEvent) => {
  if (inputRef.value && !inputRef.value.contains(event.target as Node)) {
    visible.value = false;
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

watch(() => props.modelValue, (val) => {
  if (val !== inputValue.value) {
    const option = props.options.find(opt => opt.value === val);
    inputValue.value = option ? option.label : String(val);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});

const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

defineExpose({
  focus,
  blur,
});
</script>

<style scoped>
.autocomplete {
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.autocomplete-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.autocomplete-input {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  font-size: 14px;
  color: hsl(var(--text));
  outline: none;
  transition: background-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
  font-family: inherit;
}

.autocomplete-input::placeholder {
  color: hsl(var(--text-muted));
}

.autocomplete-input:hover:not(:disabled) {
  border-color: hsl(var(--border-hover));
}

.autocomplete-input:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.autocomplete-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: hsl(var(--surface-container-high));
}

.autocomplete-input--with-clear {
  padding-right: 36px;
}

.autocomplete--sm .autocomplete-input {
  min-height: 32px;
  padding: 4px 10px;
  font-size: 13px;
}

.autocomplete--lg .autocomplete-input {
  min-height: 48px;
  padding: 8px 14px;
  font-size: 16px;
}

.autocomplete-clear {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: color 0.2s;
}

.autocomplete-clear:hover {
  color: hsl(var(--text));
}

.autocomplete-dropdown {
  z-index: var(--z-dropdown);
  max-height: 256px;
  overflow-y: auto;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.autocomplete-loading {
  padding: 16px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.autocomplete-loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: autocomplete-spin 0.8s linear infinite;
}

@keyframes autocomplete-spin {
  to { transform: rotate(360deg); }
}

.autocomplete-options {
  list-style: none;
  margin: 0;
  padding: 8px;
}

.autocomplete-option {
  padding: 10px 12px;
  margin-bottom: 4px;
  font-size: 14px;
  color: hsl(var(--text));
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.autocomplete-option:last-child {
  margin-bottom: 0;
}

.autocomplete-option:hover,
.autocomplete-option--selected {
  background: hsl(var(--surface-hover));
}

.autocomplete-option--empty {
  color: hsl(var(--text-muted));
  cursor: default;
}

.autocomplete-option--empty:hover {
  background: transparent;
}

.autocomplete-option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.autocomplete-enter-active,
.autocomplete-leave-active {
  transition: opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.autocomplete-enter-from,
.autocomplete-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
