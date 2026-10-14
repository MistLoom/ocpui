<!--
Select 组件

功能：下拉选择组件，支持单选、多选、搜索过滤等功能

属性：
- modelValue: string | number | (string | number)[] - 当前选中值
- options: Option[] - 选项列表
  - label: string - 选项标签
  - value: string | number - 选项值
  - disabled?: boolean - 是否禁用该选项
- placeholder: string - 占位文本
- disabled: boolean - 是否禁用
- multiple: boolean - 是否支持多选
- filterable: boolean - 是否支持搜索过滤
- loading: boolean - 是否显示加载状态
- clearable: boolean - 是否可清除
- size: 'sm' | 'md' | 'lg' - 组件尺寸
- emptyText: string - 无数据提示文本
- maxTagCount: number - 多选时最大显示标签数
- customClass: string - 自定义类名
- ariaLabel: string - 无障碍标签

事件：
- update:modelValue - 值变化时触发
- change - 值变化时触发
- search - 搜索时触发
- clear - 清除时触发
- focus - 聚焦时触发
- blur - 失焦时触发

使用方式：
```vue
<Select
  v-model="selectedValue"
  :options="[
    { label: '选项1', value: '1' },
    { label: '选项2', value: '2' },
    { label: '选项3', value: '3', disabled: true }
  ]"
  placeholder="请选择"
  @change="handleChange"
/>

<!-- 多选模式 -->
<Select
  v-model="selectedValues"
  :options="options"
  multiple
  clearable
  @change="handleChange"
/>

<!-- 可搜索模式 -->
<Select
  v-model="selectedValue"
  :options="options"
  filterable
  @search="handleSearch"
/>
```
-->
<template>
  <div
    ref="selectRef"
    :class="selectClass"
    @keydown="handleKeydown"
    role="combobox"
    :aria-label="ariaLabel"
    :aria-expanded="visible"
    aria-haspopup="listbox"
    :aria-controls="visible ? dropdownId : undefined"
    :aria-disabled="disabled"
    :aria-multiselectable="multiple"
    tabindex="0"
  >
    <PopupPanel
      ref="popupPanelRef"
      v-model="visible"
      :loading="loading"
      :empty-text="emptyText"
      :disabled="disabled"
      placement="bottom-start"
      match-width
      content-compact
      custom-class="select-popup-panel"
      @open="handlePopupOpen"
      @close="handlePopupClose"
    >
      <template #trigger>
        <div
          class="select-selector"
          :style="selectorStyle"
          @click="handleSelectorClick"
        >
          <div v-if="multiple && selectedOptions.length > 0" class="select-tags">
            <Tag
              v-for="option in displayTags"
              :key="option.value"
              size="sm"
              closable
              :disabled="disabled"
              @close="handleRemoveTag(option)"
            >
              {{ option.label }}
            </Tag>
          </div>
          <input
            v-if="filterable && !multiple"
            ref="inputRef"
            type="text"
            class="select-input"
            :placeholder="selectedOption ? '' : placeholder"
            :disabled="disabled"
            :value="filterText"
            @input="handleFilter"
            @focus="handleFocus"
            @keydown.stop="handleInputKeydown"
            :aria-label="ariaLabel"
            :aria-autocomplete="'list'"
          />
          <span v-else-if="selectedOption" class="select-value" :aria-live="'polite'">
            {{ selectedOption.label }}
          </span>
          <span v-else-if="!multiple || selectedOptions.length === 0" class="select-placeholder">
            {{ placeholder }}
          </span>
          <span class="select-arrow" :class="{ 'select-arrow--open': visible }">
            <svg viewBox="0 0 12 12" fill="currentColor" class="select-arrow-icon">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <button
            v-if="clearable && hasValue && !disabled"
            type="button"
            class="select-clear"
            @click.stop="handleClear"
            :aria-label="t('components.dataEntry.select.clear')"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </template>

      <!-- 自定义菜单内容 -->
      <template #default="{ close }">
        <ul :id="dropdownId" class="select-options" role="listbox">
          <li
            v-for="(option, index) in filteredOptions"
            :key="option.value"
            :class="optionClass(option, index)"
            :aria-selected="isOptionSelected(option)"
            :aria-disabled="option.disabled"
            :tabindex="option.disabled ? -1 : 0"
            @click.stop="handleOptionClick(option, close)"
            @mouseenter="handleOptionMouseEnter(index)"
            @keydown="handleOptionKeydown(option, $event, close)"
          >
            <!-- 多选复选框 -->
            <span v-if="multiple" class="select-checkbox" @click.stop>
              <input
                type="checkbox"
                :checked="isOptionSelected(option)"
                :disabled="option.disabled"
                @change="handleOptionClick(option, close)"
              />
              <span class="select-checkbox-indicator" />
            </span>

            <!-- 选项标签 -->
            <span class="select-option-label">
              {{ option.label }}
            </span>

            <!-- 单选选中标记 -->
            <span v-if="!multiple && isOptionSelected(option)" class="select-option-check">
              <svg viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 6L4.5 8.5L10 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </li>
        </ul>
      </template>
    </PopupPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, onUnmounted, toRef } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import { Tag } from '../data-display';
import { PopupPanel } from '@ocpui/vue/feedback';
import type { ComponentSize } from '@ocpui/vue/types';
import { useComponentSize, SIZE_HEIGHT_PX } from '../composables/useComponentSize';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

export interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface Props {
  modelValue?: string | number | (string | number)[];
  options?: Option[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  filterable?: boolean;
  loading?: boolean;
  clearable?: boolean;
  size?: ComponentSize;
  emptyText?: string;
  maxTagCount?: number;
  customClass?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  multiple: false,
  filterable: false,
  loading: false,
  clearable: false,
  size: undefined,
  emptyText: '暂无数据',
  maxTagCount: undefined,
  customClass: '',
  ariaLabel: 'Select',
});

const resolvedSize = useComponentSize(toRef(props, 'size'));

const selectorStyle = computed(() => ({
  height: `${SIZE_HEIGHT_PX[resolvedSize.value]}px`,
}));

const emit = defineEmits<{
  'update:modelValue': [string | number | (string | number)[] | undefined];
  'change': [string | number | (string | number)[] | undefined];
  'search': [string];
  'clear': [];
  'focus': [];
  'blur': [];
}>();

const selectRef = ref<HTMLElement>();
const popupPanelRef = ref<{
  show: () => void;
  hide: () => void;
  toggle: () => void;
  updatePosition: () => void;
  visible: boolean;
}>();
const inputRef = ref<HTMLInputElement>();
const visible = ref(false);
const dropdownId = useComponentId('select-options');
const filterText = ref('');
const focusedIndex = ref(-1);

const selectClass = computed(() => {
  const classes = ['select', `select--${resolvedSize.value}`];
  if (props.disabled) {
    classes.push('select--disabled');
  }
  if (visible.value) {
    classes.push('select--focused');
  }
  if (props.multiple) {
    classes.push('select--multiple');
  }
  if (hasValue.value) {
    classes.push('select--has-value');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const hasValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0;
  }
  return props.modelValue !== undefined && props.modelValue !== null;
});

const selectedOption = computed(() => {
  if (props.multiple || props.modelValue === undefined) return null;
  return props.options.find(opt => opt.value === props.modelValue);
});

const selectedOptions = computed(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return [];
  return props.options.filter(opt => (props.modelValue as (string | number)[]).includes(opt.value));
});

const displayTags = computed(() => {
  if (!props.multiple || !props.maxTagCount) return selectedOptions.value;
  const tags = selectedOptions.value;
  if (tags.length <= props.maxTagCount) return tags;
  return [...tags.slice(0, props.maxTagCount), { label: `+${tags.length - props.maxTagCount}`, value: 'more' as const, disabled: true }];
});

const filteredOptions = computed(() => {
  if (!props.filterable || !filterText.value) return props.options;
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(filterText.value.toLowerCase())
  );
});

const handleSelectorClick = (event: MouseEvent) => {
  if (props.disabled) return;
  const target = event.target as HTMLElement;
  // 可搜索模式下点击输入框仅聚焦，不切换面板
  if (props.filterable && !props.multiple && target.closest('.select-input')) {
    event.stopPropagation();
    if (!visible.value) {
      popupPanelRef.value?.show();
    }
    return;
  }
  // 清除按钮由自身处理
  if (target.closest('.select-clear')) {
    return;
  }
};

const isOptionSelected = (option: Option): boolean => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(option.value);
  }
  return props.modelValue === option.value;
};

const optionClass = (option: Option, index: number) => {
  const classes = ['select-option'];
  if (isOptionSelected(option)) {
    classes.push('select-option--selected');
  }
  if (option.disabled) {
    classes.push('select-option--disabled');
  }
  if (index === focusedIndex.value) {
    classes.push('select-option--focused');
  }
  return classes;
};

const handleOptionClick = (option: Option, close: () => void) => {
  if (option.disabled) return;

  if (props.multiple) {
    const newValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = newValue.indexOf(option.value);
    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(option.value);
    }
    emit('update:modelValue', newValue);
    emit('change', newValue);
  } else {
    emit('update:modelValue', option.value);
    emit('change', option.value);
    close();
  }
  
  if (props.filterable && !props.multiple) {
    filterText.value = option.label;
  } else {
    filterText.value = '';
  }
};

const handleOptionMouseEnter = (index: number) => {
  focusedIndex.value = index;
};

const handleOptionKeydown = (option: Option, event: KeyboardEvent, close: () => void) => {
  if (option.disabled) return;

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleOptionClick(option, close);
  }
};

const handlePopupOpen = () => {
  focusedIndex.value = -1;
  nextTick(() => {
    if (props.filterable) {
      inputRef.value?.focus();
    }
  });
};

const handlePopupClose = () => {
  filterText.value = '';
  focusedIndex.value = -1;
  emit('blur');
};

const handleRemoveTag = (option: Option) => {
  if (props.disabled || !Array.isArray(props.modelValue) || option.value === 'more') return;
  const newValue = props.modelValue.filter(v => v !== option.value);
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const handleClear = () => {
  const newValue: typeof props.modelValue = props.multiple ? [] : undefined;
  emit('update:modelValue', newValue);
  emit('change', newValue);
  emit('clear');
  filterText.value = '';
};

const handleFilter = (event: Event) => {
  filterText.value = (event.target as HTMLInputElement).value;
  emit('search', filterText.value);
  focusedIndex.value = -1;
  // 搜索时确保面板打开
  if (!visible.value) {
    visible.value = true;
  }
};

const handleFocus = () => {
  emit('focus');
};

const handleInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    visible.value = false;
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (!visible.value) {
      visible.value = true;
    }
    // 聚焦到第一个可用选项
    const options = filteredOptions.value;
    const firstEnabledIndex = options.findIndex(opt => !opt.disabled);
    if (firstEnabledIndex > -1) {
      focusedIndex.value = firstEnabledIndex;
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (!visible.value) {
      visible.value = true;
    }
    // 聚焦到最后一个可用选项
    const options = filteredOptions.value;
    for (let i = options.length - 1; i >= 0; i--) {
      if (!options[i].disabled) {
        focusedIndex.value = i;
        break;
      }
    }
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (visible.value && focusedIndex.value >= 0) {
        const option = filteredOptions.value[focusedIndex.value];
        if (option && !option.disabled) {
          handleOptionClick(option, () => { visible.value = false; });
        }
      } else {
        popupPanelRef.value?.toggle();
      }
      break;
    case 'Escape':
      visible.value = false;
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (!visible.value) {
        popupPanelRef.value?.show();
      } else {
        // 向下移动聚焦
        const options = filteredOptions.value;
        let newIndex = focusedIndex.value + 1;
        while (newIndex < options.length && options[newIndex]?.disabled) {
          newIndex++;
        }
        if (newIndex < options.length) {
          focusedIndex.value = newIndex;
        }
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (!visible.value) {
        popupPanelRef.value?.show();
      } else {
        // 向上移动聚焦
        const options = filteredOptions.value;
        let newIndex = focusedIndex.value - 1;
        while (newIndex >= 0 && options[newIndex]?.disabled) {
          newIndex--;
        }
        if (newIndex >= 0) {
          focusedIndex.value = newIndex;
        }
      }
      break;
    case 'Backspace':
      if (props.multiple && !filterText.value && selectedOptions.value.length > 0) {
        const lastOption = selectedOptions.value[selectedOptions.value.length - 1];
        handleRemoveTag(lastOption);
      }
      break;
    case 'Home':
      event.preventDefault();
      if (visible.value) {
        const options = filteredOptions.value;
        const firstEnabledIndex = options.findIndex(opt => !opt.disabled);
        if (firstEnabledIndex > -1) {
          focusedIndex.value = firstEnabledIndex;
        }
      }
      break;
    case 'End':
      event.preventDefault();
      if (visible.value) {
        const options = filteredOptions.value;
        for (let i = options.length - 1; i >= 0; i--) {
          if (!options[i].disabled) {
            focusedIndex.value = i;
            break;
          }
        }
      }
      break;
  }
};

// 未选择不是非法值。清空会让父级写回空串并换新选项数组，选择框再次清空，更新停不下来。
function isUnsetSingle(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    // 确保值的有效性
    if (props.multiple) {
      if (!Array.isArray(newValue)) {
        emit('update:modelValue', []);
        emit('change', []);
      }
    } else if (!isUnsetSingle(newValue) && !props.options.some(opt => opt.value === newValue)) {
      emit('update:modelValue', undefined);
      emit('change', undefined);
    }
  }
);

watch(
  () => props.options,
  (newOptions) => {
    const optionValueSet = new Set(newOptions.map((opt) => opt.value));
    if (props.multiple) {
      const current = Array.isArray(props.modelValue) ? props.modelValue : [];
      const nextValue = current.filter((v) => optionValueSet.has(v));
      if (nextValue.length !== current.length) {
        emit('update:modelValue', nextValue);
        emit('change', nextValue);
      }
    } else {
      const singleValue = props.modelValue;
      if (
        (typeof singleValue === 'string' || typeof singleValue === 'number') &&
        !optionValueSet.has(singleValue)
      ) {
        emit('update:modelValue', undefined);
        emit('change', undefined);
      }
    }
  },
  { deep: true }
);

// 监听visible变化，同步到PopupPanel
watch(visible, (val) => {
  if (!val) {
    filterText.value = '';
    focusedIndex.value = -1;
  }
});

onUnmounted(() => {
  // 清理工作已在PopupPanel中处理
});

const focus = () => {
  selectRef.value?.focus();
};

const blur = () => {
  visible.value = false;
};

defineExpose({
  focus,
  blur,
  selectRef,
  popupPanelRef,
});
</script>

<style scoped>
.select {
  position: relative;
  display: block;
  width: 100%;
  min-width: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  outline: none;
}

.select :deep(.popup-panel-trigger) {
  display: block;
  width: 100%;
}

.select-selector {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 0 12px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.select:hover:not(.select--disabled) .select-selector {
  border-color: hsl(var(--border-hover));
}

.select--focused .select-selector {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.select--disabled {
  cursor: not-allowed;
}

.select--disabled .select-selector {
  opacity: 0.5;
  cursor: not-allowed;
  background: hsl(var(--surface-container-high));
}

.select-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.select-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 14px;
  color: hsl(var(--text));
  outline: none;
  box-shadow: none;
  font-family: inherit;
}

.select-input:focus {
  outline: none;
  box-shadow: none;
}

.select-input::placeholder {
  color: hsl(var(--text-muted));
}

.select-value {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-placeholder {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.select-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.select-arrow--open {
  transform: rotate(180deg);
}

.select-arrow-icon {
  width: 12px;
  height: 12px;
  color: hsl(var(--text-muted));
}

.select-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  margin-left: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.select-clear:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-container-high));
}

.select-clear svg {
  width: 10px;
  height: 10px;
}

/* PopupPanel 样式覆盖 */
:deep(.select-popup-panel) {
  z-index: var(--z-dropdown);
}

.select-options {
  list-style: none;
  margin: 0;
  padding: 0;
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 4px;
  font-size: 14px;
  color: hsl(var(--text));
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
  outline: none;
}

.select-option:last-child {
  margin-bottom: 0;
}

.select-option:hover:not(.select-option--disabled),
.select-option--focused:not(.select-option--disabled) {
  background: hsl(var(--surface-hover));
  transform: translateX(4px);
}

.select-option--selected {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  font-weight: 500;
}

.select-option--selected:hover:not(.select-option--disabled),
.select-option--selected.select-option--focused:not(.select-option--disabled) {
  background: hsl(var(--primary) / 0.15);
}

.select-option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-option-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: hsl(var(--primary));
  flex-shrink: 0;
}

.select-option-check svg {
  width: 12px;
  height: 12px;
}

.select-checkbox {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  cursor: pointer;
}

.select-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.select-checkbox-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.select-checkbox input:checked + .select-checkbox-indicator {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.select-checkbox input:checked + .select-checkbox-indicator::after {
  content: '';
  display: block;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.select--sm .select-selector {
  padding: 0 10px;
}

.select--md .select-selector {
  padding: 0 12px;
}

.select--lg .select-selector {
  padding: 0 14px;
}

.select--sm .select-input,
.select--sm .select-value,
.select--sm .select-placeholder {
  font-size: 13px;
}

.select--lg .select-input,
.select--lg .select-value,
.select--lg .select-placeholder {
  font-size: 15px;
}

/* 响应式样式 */
@media (max-width: 639.98px) {
  .select-selector {
    height: var(--touch-min-size) !important;
  }

  .select-input,
  .select-value,
  .select-placeholder {
    font-size: var(--font-size-sm);
  }

  .select-option {
    min-height: var(--touch-min-size);
    padding: 10px 12px;
  }

  :deep(.select-popup-panel) {
    max-height: min(70vh, 320px);
  }
}
</style>
