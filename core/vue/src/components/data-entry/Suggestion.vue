<!--
Suggestion 建议输入组件

功能：提供输入建议和自动完成功能的输入框组件，支持自定义选项、搜索过滤、键盘导航和多种展示模式。

属性：
- modelValue: string - 当前输入值
- options: SuggestionOption[] - 建议选项列表
  - label: string - 选项显示文本
  - value: string | number - 选项值
  - disabled?: boolean - 是否禁用该选项
  - description?: string - 选项描述
  - icon?: string - 选项图标
- placeholder: string - 占位符文本
- disabled: boolean - 是否禁用
- clearable: boolean - 是否可清除
- loading: boolean - 是否加载中
- filterable: boolean - 是否启用本地过滤
- filterMethod: (inputValue: string, option: SuggestionOption) => boolean - 自定义过滤方法
- maxCount: number - 最大显示数量，默认 10
- emptyText: string - 空状态提示文本
- size: 'sm' | 'md' | 'lg' - 组件尺寸
- trigger: 'input' | 'focus' | 'manual' - 触发方式
- placement: 'bottom' | 'top' - 下拉框位置
- highlightFirst: boolean - 是否高亮第一个选项
- customClass: string - 自定义类名
- debounce: number - 防抖延迟，默认 300ms

事件：
- update:modelValue - 值变化时触发
- select - 选择选项时触发
- search - 搜索时触发
- focus - 获得焦点时触发
- blur - 失去焦点时触发
- clear - 清除时触发
- visible-change - 下拉框显示状态变化时触发

方法：
- focus() - 使输入框获得焦点
- blur() - 使输入框失去焦点
- show() - 显示建议列表
- hide() - 隐藏建议列表

使用方式：
```vue
<Suggestion
  v-model="value"
  :options="options"
  placeholder="请输入"
  @select="handleSelect"
/>
```
-->
<template>
  <div
    ref="suggestionRef"
    :class="suggestionClass"
    v-bind="$attrs"
  >
    <div class="suggestion-input-wrapper">
      <input
        ref="inputRef"
        type="text"
        :class="inputClass"
        :placeholder="placeholder"
        :disabled="disabled"
        :value="inputValue"
        :aria-expanded="visible"
        :aria-autocomplete="'list'"
        :aria-controls="visible ? dropdownId : undefined"
        :aria-activedescendant="activeDescendant"
        role="combobox"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <button
        v-if="clearable && inputValue && !disabled"
        type="button"
        class="suggestion-clear"
        :aria-label="t('components.dataEntry.suggestion.clear')"
        @click="handleClear"
      >
        <Icon name="close" :size="14" />
      </button>
      <div v-if="loading" class="suggestion-loading-indicator">
        <span class="suggestion-spinner" />
      </div>
    </div>

    <Teleport to="body">
      <Transition name="suggestion">
        <div
          v-if="visible"
          ref="dropdownRef"
          :id="dropdownId"
          :class="dropdownClass"
          :style="floatingBaseStyle"
          role="listbox"
          @mousedown.prevent
        >
          <!-- 加载状态 -->
          <div v-if="loading && !displayOptions.length" class="suggestion-loading">
            <span class="suggestion-spinner" />
            <span>{{ t('components.dataEntry.suggestion.loading') }}</span>
          </div>

          <!-- 空状态 -->
          <div v-else-if="displayOptions.length === 0" class="suggestion-empty">
            <Icon name="inbox" :size="24" class="suggestion-empty-icon" />
            <span>{{ emptyText }}</span>
          </div>

          <!-- 建议列表 -->
          <ul v-else class="suggestion-list">
            <li
              v-for="(option, index) in displayOptions"
              :id="`suggestion-option-${index}`"
              :key="option.value"
              :class="optionClass(option, index)"
              :aria-selected="index === selectedIndex"
              :aria-disabled="option.disabled"
              role="option"
              @click="handleSelect(option)"
              @mouseenter="handleMouseEnter(index)"
            >
              <!-- 图标 -->
              <Icon v-if="option.icon" :name="option.icon" :size="16" class="suggestion-option-icon" />

              <!-- 内容区域 -->
              <div class="suggestion-option-content">
                <div class="suggestion-option-label">
                  <HighlightText
                    :text="option.label"
                    :highlight="inputValue"
                    :case-sensitive="false"
                  />
                </div>
                <div v-if="option.description" class="suggestion-option-description">
                  {{ option.description }}
                </div>
              </div>

              <!-- 选中标记 -->
              <span v-if="isSelected(option)" class="suggestion-option-check">
                <Icon name="check" :size="14" />
              </span>
            </li>
          </ul>

          <!-- 底部信息 -->
          <div v-if="showFooter" class="suggestion-footer">
            <span class="suggestion-footer-text">
              {{ t('components.dataEntry.suggestion.totalCount', { count: filteredOptions.length }) }}
            </span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import { Icon } from '@ocpui/vue/utility';
import type { ComponentSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition, type FloatingPlacement } from '../composables/useFloatingPosition';

const { uiT: t } = useUiT();

interface SuggestionOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  description?: string;
  icon?: string;
}

type SuggestionSize = ComponentSize;
type SuggestionTrigger = 'input' | 'focus' | 'manual';
type SuggestionPlacement = 'bottom' | 'top';

interface Props {
  modelValue?: string;
  options?: SuggestionOption[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  loading?: boolean;
  filterable?: boolean;
  filterMethod?: (inputValue: string, option: SuggestionOption) => boolean;
  maxCount?: number;
  emptyText?: string;
  size?: SuggestionSize;
  trigger?: SuggestionTrigger;
  placement?: SuggestionPlacement;
  highlightFirst?: boolean;
  customClass?: string;
  debounce?: number;
  showFooter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  placeholder: '请输入',
  disabled: false,
  clearable: false,
  loading: false,
  filterable: true,
  filterMethod: undefined,
  maxCount: 10,
  emptyText: '暂无建议',
  size: 'md',
  trigger: 'input',
  placement: 'bottom',
  highlightFirst: true,
  customClass: '',
  debounce: 300,
  showFooter: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'select': [option: SuggestionOption];
  'search': [value: string];
  'focus': [];
  'blur': [];
  'clear': [];
  'visible-change': [visible: boolean];
}>();

// Refs
const suggestionRef = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const dropdownRef = ref<HTMLElement>();
const inputValue = ref('');
const visible = ref(false);
const dropdownId = useComponentId('suggestion-dropdown');
const selectedIndex = ref(-1);
const floatingBaseStyle = { position: 'fixed' as const };
let searchTimer: number | null = null;
let blurTimer: number | null = null;

const floatingPlacement = computed<FloatingPlacement>(() =>
  props.placement === 'top' ? 'top-start' : 'bottom-start'
);

const floating = useFloatingPosition({
  reference: inputRef,
  floating: dropdownRef,
  placement: floatingPlacement,
  matchWidth: true,
  offsetPx: 4,
  maxHeight: 320,
});

// 计算属性
const suggestionClass = computed(() => {
  const classes = ['suggestion', `suggestion--${props.size}`];
  if (props.disabled) {
    classes.push('suggestion--disabled');
  }
  if (visible.value) {
    classes.push('suggestion--focused');
  }
  if (props.loading) {
    classes.push('suggestion--loading');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const inputClass = computed(() => {
  const classes = ['suggestion-input'];
  if (props.clearable && inputValue.value) {
    classes.push('suggestion-input--with-clear');
  }
  if (props.loading) {
    classes.push('suggestion-input--with-loading');
  }
  return classes.join(' ');
});

const dropdownClass = computed(() => {
  const classes = ['suggestion-dropdown', `suggestion-dropdown--${props.placement}`];
  return classes.join(' ');
});

const activeDescendant = computed(() => {
  if (selectedIndex.value >= 0 && visible.value) {
    return `suggestion-option-${selectedIndex.value}`;
  }
  return undefined;
});

// 过滤后的选项
const filteredOptions = computed(() => {
  let result = props.options;

  // 应用过滤
  if (props.filterable && inputValue.value) {
    if (props.filterMethod) {
      result = result.filter(option => props.filterMethod!(inputValue.value, option));
    } else {
      const query = inputValue.value.toLowerCase();
      result = result.filter(option =>
        option.label.toLowerCase().includes(query) ||
        option.value.toString().toLowerCase().includes(query)
      );
    }
  }

  return result;
});

// 显示的选项（限制数量）
const displayOptions = computed(() => {
  return filteredOptions.value.slice(0, props.maxCount);
});

// 选项样式
const optionClass = (option: SuggestionOption, index: number) => {
  const classes = ['suggestion-option'];
  if (option.disabled) {
    classes.push('suggestion-option--disabled');
  }
  if (index === selectedIndex.value) {
    classes.push('suggestion-option--selected');
  }
  if (isSelected(option)) {
    classes.push('suggestion-option--active');
  }
  return classes.join(' ');
};

// 检查选项是否被选中
const isSelected = (option: SuggestionOption): boolean => {
  return inputValue.value === option.label;
};

// 处理输入
const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  inputValue.value = value;
  emit('update:modelValue', value);

  // 防抖搜索
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  searchTimer = window.setTimeout(() => {
    emit('search', value);
  }, props.debounce);

  // 根据触发方式显示建议
  if (props.trigger === 'input') {
    showSuggestions();
  }

  selectedIndex.value = props.highlightFirst && displayOptions.value.length > 0 && !displayOptions.value[0].disabled
    ? 0
    : -1;
};

// 处理焦点
const handleFocus = () => {
  emit('focus');

  if (blurTimer) {
    clearTimeout(blurTimer);
    blurTimer = null;
  }

  if (props.trigger === 'focus' || props.trigger === 'input') {
    showSuggestions();
  }
};

// 处理失焦
const handleBlur = () => {
  // 延迟关闭，允许点击选项
  blurTimer = window.setTimeout(() => {
    hideSuggestions();
    emit('blur');
  }, 200);
};

// 处理选择
const handleSelect = (option: SuggestionOption) => {
  if (option.disabled) return;

  inputValue.value = option.label;
  emit('update:modelValue', option.label);
  emit('select', option);
  hideSuggestions();
  selectedIndex.value = -1;
};

// 处理清除
const handleClear = () => {
  inputValue.value = '';
  emit('update:modelValue', '');
  emit('clear');
  inputRef.value?.focus();
};

// 处理鼠标进入
const handleMouseEnter = (index: number) => {
  if (!displayOptions.value[index]?.disabled) {
    selectedIndex.value = index;
  }
};

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (!visible.value) {
        showSuggestions();
      } else {
        navigateNext();
      }
      break;

    case 'ArrowUp':
      event.preventDefault();
      if (!visible.value) {
        showSuggestions();
      } else {
        navigatePrev();
      }
      break;

    case 'Enter':
      event.preventDefault();
      if (visible.value && selectedIndex.value >= 0) {
        const option = displayOptions.value[selectedIndex.value];
        if (option && !option.disabled) {
          handleSelect(option);
        }
      }
      break;

    case 'Escape':
      event.preventDefault();
      hideSuggestions();
      break;

    case 'Tab':
      if (visible.value && selectedIndex.value >= 0 && props.highlightFirst) {
        const option = displayOptions.value[selectedIndex.value];
        if (option && !option.disabled) {
          handleSelect(option);
          event.preventDefault();
        }
      } else {
        hideSuggestions();
      }
      break;

    case 'Home':
      if (visible.value) {
        event.preventDefault();
        navigateFirst();
      }
      break;

    case 'End':
      if (visible.value) {
        event.preventDefault();
        navigateLast();
      }
      break;
  }
};

// 导航方法
const navigateNext = () => {
  const options = displayOptions.value;
  let newIndex = selectedIndex.value + 1;
  while (newIndex < options.length && options[newIndex]?.disabled) {
    newIndex++;
  }
  if (newIndex < options.length) {
    selectedIndex.value = newIndex;
    scrollToSelected();
  }
};

const navigatePrev = () => {
  const options = displayOptions.value;
  let newIndex = selectedIndex.value - 1;
  while (newIndex >= 0 && options[newIndex]?.disabled) {
    newIndex--;
  }
  if (newIndex >= 0) {
    selectedIndex.value = newIndex;
    scrollToSelected();
  }
};

const navigateFirst = () => {
  const options = displayOptions.value;
  const firstEnabledIndex = options.findIndex(opt => !opt.disabled);
  if (firstEnabledIndex > -1) {
    selectedIndex.value = firstEnabledIndex;
    scrollToSelected();
  }
};

const navigateLast = () => {
  const options = displayOptions.value;
  for (let i = options.length - 1; i >= 0; i--) {
    if (!options[i].disabled) {
      selectedIndex.value = i;
      scrollToSelected();
      break;
    }
  }
};

// 滚动到选中项
const scrollToSelected = () => {
  nextTick(() => {
    const dropdown = dropdownRef.value;
    if (!dropdown) return;

    const selectedOption = dropdown.querySelector('.suggestion-option--selected') as HTMLElement;
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

// 显示建议
const showSuggestions = () => {
  if (props.disabled) return;
  visible.value = true;
  emit('visible-change', true);

  // 初始化选中索引
  if (props.highlightFirst && displayOptions.value.length > 0) {
    const firstEnabledIndex = displayOptions.value.findIndex(opt => !opt.disabled);
    selectedIndex.value = firstEnabledIndex > -1 ? firstEnabledIndex : -1;
  }
};

// 隐藏建议
const hideSuggestions = () => {
  visible.value = false;
  selectedIndex.value = -1;
  emit('visible-change', false);
};

// 点击外部处理
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (
    suggestionRef.value &&
    !suggestionRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    hideSuggestions();
  }
};

// 监听可见性变化
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

// 监听外部值变化
watch(() => props.modelValue, (val) => {
  if (val !== inputValue.value) {
    inputValue.value = val;
  }
}, { immediate: true });

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  if (blurTimer) {
    clearTimeout(blurTimer);
  }
});

// 暴露方法
const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

const show = () => {
  showSuggestions();
};

const hide = () => {
  hideSuggestions();
};

defineExpose({
  focus,
  blur,
  show,
  hide,
});
</script>

<script lang="ts">
// 高亮文本组件
import { h, defineComponent } from 'vue';

const HighlightText = defineComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
    highlight: {
      type: String,
      default: '',
    },
    caseSensitive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return () => {
      if (!props.highlight) {
        return h('span', props.text);
      }

      const flags = props.caseSensitive ? 'g' : 'gi';
      const escapedHighlight = props.highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedHighlight})`, flags);
      const parts = props.text.split(regex);

      return h('span', {}, parts.map((part, index) => {
        const isMatch = props.caseSensitive
          ? part === props.highlight
          : part.toLowerCase() === props.highlight.toLowerCase();

        if (isMatch) {
          return h('mark', {
            key: index,
            class: 'suggestion-highlight',
          }, part);
        }
        return h('span', { key: index }, part);
      }));
    };
  },
});
</script>

<style scoped>
.suggestion {
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.suggestion-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.suggestion-input {
  width: 100%;
  background: hsl(var(--surface-inset, var(--surface-container-high)));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  font-size: 14px;
  color: hsl(var(--text));
  outline: none;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  font-family: inherit;
}

.suggestion-input::placeholder {
  color: hsl(var(--text-muted));
}

.suggestion-input:hover:not(:disabled) {
  border-color: hsl(var(--border-hover));
}

.suggestion-input:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.suggestion-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: hsl(var(--surface-container-high));
}

/* 尺寸变体 */
.suggestion--sm .suggestion-input {
  min-height: 32px;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 8px;
}

.suggestion--md .suggestion-input {
  min-height: 40px;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 12px;
}

.suggestion--lg .suggestion-input {
  min-height: 48px;
  padding: 12px 16px;
  font-size: 16px;
  border-radius: 14px;
}

.suggestion-input--with-clear {
  padding-right: 36px;
}

.suggestion-input--with-loading {
  padding-right: 40px;
}

.suggestion-clear {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: color 0.2s;
  border-radius: 50%;
}

.suggestion-clear:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-container-high));
}

.suggestion-loading-indicator {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggestion-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: suggestion-spin 0.8s linear infinite;
}

@keyframes suggestion-spin {
  to { transform: rotate(360deg); }
}

.suggestion-dropdown {
  overflow-y: auto;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  font-family: inherit;
}

.suggestion-loading,
.suggestion-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 14px;
}

.suggestion-empty-icon {
  color: hsl(var(--text-muted) / 0.5);
}

.suggestion-list {
  list-style: none;
  margin: 0;
  padding: 8px;
}

.suggestion-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 2px;
  font-size: 14px;
  color: hsl(var(--text));
  border-radius: 8px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  outline: none;
}

.suggestion-option:last-child {
  margin-bottom: 0;
}

.suggestion-option:hover:not(.suggestion-option--disabled),
.suggestion-option--selected {
  background: hsl(var(--surface-hover));
}

.suggestion-option--active {
  color: hsl(var(--primary));
  font-weight: 500;
}

.suggestion-option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.suggestion-option-icon {
  flex-shrink: 0;
  color: hsl(var(--text-muted));
}

.suggestion-option-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.suggestion-option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-option-description {
  font-size: 12px;
  color: hsl(var(--text-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-option-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: hsl(var(--primary));
  flex-shrink: 0;
}

.suggestion-highlight {
  background: hsl(var(--primary) / 0.15);
  color: hsl(var(--primary));
  font-weight: 500;
  padding: 0 2px;
  border-radius: 2px;
}

.suggestion-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 12px;
  border-top: 1px solid hsl(var(--border));
  font-size: 12px;
  color: hsl(var(--text-muted));
}

/* 动画 */
.suggestion-enter-active,
.suggestion-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.suggestion-enter-from,
.suggestion-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 响应式样式 */
@media (max-width: 639.98px) {
  .suggestion-dropdown {
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
  }

  .suggestion-option {
    padding: 12px;
    min-height: 44px;
  }

  .suggestion-option-label {
    font-size: var(--font-size-sm, 14px);
  }

  .suggestion-loading,
  .suggestion-empty {
    padding: 20px;
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .suggestion-dropdown {
    min-width: 200px;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .suggestion-dropdown {
    background: hsl(var(--surface-dark, var(--surface)));
    border-color: hsl(var(--border-dark, var(--border)));
  }

  .suggestion-option:hover:not(.suggestion-option--disabled),
  .suggestion-option--selected {
    background: hsl(var(--surface-hover) / 0.5);
  }
}
</style>
