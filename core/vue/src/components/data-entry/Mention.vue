&lt;!--
Mention 提及组件

## 组件说明
用于在文本输入中提及用户或其他实体的组件，支持 @ 符号触发下拉选择。

## 公开属性
- modelValue: string - 绑定值
- options: MentionOption[] - 提及选项列表
- prefix: string - 触发符号，默认 "@"
- placeholder: string - 占位符，默认 "输入 @ 提及"
- disabled: boolean - 是否禁用
- rows: number - 文本域行数，默认 3
- dropdownTitle: string - 下拉菜单标题，默认 "选择提及对象"
- emptyText: string - 无匹配结果文本，默认 "无匹配结果"
- customClass: string - 自定义类名

## 事件
- update:modelValue - 值变更时触发
- change - 值变更时触发
- select - 选择选项时触发
- search - 搜索时触发

## 接口
- MentionOption: { label: string; value: string; avatar?: string; description?: string; disabled?: boolean } - 提及选项接口

## 方法
- focus() - 聚焦文本域
- textarea - 文本域引用

## 使用方式
```vue
&lt;Mention v-model="content" :options="userOptions" /&gt;
```
--&gt;
<template>
  <div :class="mentionClass" role="combobox" aria-haspopup="listbox" :aria-expanded="showDropdown" :aria-controls="showDropdown ? dropdownId : undefined">
    <textarea
      ref="textareaRef"
      v-model="inputValue"
      class="mention-textarea"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :aria-label="t('components.dataEntry.mention.ariaLabel')"
      :aria-autocomplete="'list'"
      :aria-controls="showDropdown ? dropdownId : undefined"
      :aria-activedescendant="activeDescendantId"
      @input="handleInput"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <Teleport to="body">
    <Transition name="mention-dropdown">
      <div
        v-if="showDropdown"
        ref="dropdownRef"
        :id="dropdownId"
        class="mention-dropdown"
        :style="floatingBaseStyle"
        role="listbox"
        :aria-label="dropdownTitle"
      >
        <div class="mention-dropdown-header">
          <span class="mention-dropdown-title">{{ dropdownTitle }}</span>
        </div>
        <div class="mention-dropdown-list">
          <div
            v-for="(option, index) in filteredOptions"
            :id="`mention-option-${index}`"
            :key="option.value"
            class="mention-option"
            :class="{
              'mention-option--selected': index === selectedIndex,
              'mention-option--disabled': option.disabled
            }"
            @click="handleSelect(option)"
            @mouseenter="selectedIndex = index"
            role="option"
            :aria-selected="index === selectedIndex"
            :aria-disabled="option.disabled"
          >
            <div v-if="option.avatar" class="mention-option-avatar">
              <img :src="option.avatar" :alt="option.label" />
            </div>
            <div class="mention-option-content">
              <span class="mention-option-label">{{ option.label }}</span>
              <span v-if="option.description" class="mention-option-description">
                {{ option.description }}
              </span>
            </div>
          </div>
          <div v-if="filteredOptions.length === 0" class="mention-empty" role="status">
            {{ emptyText }}
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition } from '../composables/useFloatingPosition';

const { uiT: t } = useUiT();

interface MentionOption {
  label: string;
  value: string;
  avatar?: string;
  description?: string;
  disabled?: boolean;
}

interface Props {
  modelValue?: string;
  options?: MentionOption[];
  prefix?: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  dropdownTitle?: string;
  emptyText?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  prefix: '@',
  placeholder: '输入 @ 提及',
  disabled: false,
  rows: 3,
  dropdownTitle: '选择提及对象',
  emptyText: '无匹配结果',
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
  'select': [option: MentionOption];
  'search': [query: string];
}>();

const textareaRef = ref<HTMLTextAreaElement>();
const dropdownRef = ref<HTMLElement>();
const inputValue = ref(props.modelValue);
const showDropdown = ref(false);
const selectedIndex = ref(0);
const searchQuery = ref('');
const mentionStart = ref(-1);
const dropdownId = useComponentId('mention-dropdown');
const floatingBaseStyle = { position: 'fixed' as const };

const floating = useFloatingPosition({
  reference: textareaRef,
  floating: dropdownRef,
  placement: 'bottom-start',
  matchWidth: false,
  offsetPx: 4,
});

const mentionClass = computed(() => {
  const classes = ['mention'];
  if (props.disabled) classes.push('mention--disabled');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const query = searchQuery.value.toLowerCase();
  return props.options.filter(opt => 
    opt.label.toLowerCase().includes(query) ||
    opt.value.toLowerCase().includes(query)
  );
});

const activeDescendantId = computed(() => {
  if (!showDropdown.value || selectedIndex.value < 0 || selectedIndex.value >= filteredOptions.value.length) {
    return undefined;
  }
  return `mention-option-${selectedIndex.value}`;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  inputValue.value = target.value;
  emit('update:modelValue', inputValue.value);
  emit('change', inputValue.value);
  
  checkMention();
};

const checkMention = () => {
  if (!textareaRef.value) return;
  
  const cursorPos = textareaRef.value.selectionStart;
  const text = inputValue.value.substring(0, cursorPos);
  const lastPrefixIndex = text.lastIndexOf(props.prefix);
  
  if (lastPrefixIndex !== -1) {
    const afterPrefix = text.substring(lastPrefixIndex + 1);
    const hasSpace = afterPrefix.includes(' ');
    
    if (!hasSpace) {
      mentionStart.value = lastPrefixIndex;
      searchQuery.value = afterPrefix;
      showDropdown.value = true;
      selectedIndex.value = 0;
      emit('search', searchQuery.value);
      return;
    }
  }
  
  showDropdown.value = false;
  mentionStart.value = -1;
  searchQuery.value = '';
};

watch(showDropdown, (val) => {
  if (val) {
    nextTick(() => {
      floating.start();
    });
  } else {
    floating.stop();
  }
});

const handleKeydown = (event: KeyboardEvent) => {
  if (!showDropdown.value) return;
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value = Math.min(
        selectedIndex.value + 1,
        filteredOptions.value.length - 1
      );
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
      break;
    case 'Enter':
      event.preventDefault();
      if (filteredOptions.value[selectedIndex.value]) {
        handleSelect(filteredOptions.value[selectedIndex.value]);
      }
      break;
    case 'Escape':
      showDropdown.value = false;
      break;
  }
};

const handleSelect = (option: MentionOption) => {
  if (option.disabled) return;
  
  const beforeMention = inputValue.value.substring(0, mentionStart.value);
  const afterCursor = inputValue.value.substring(textareaRef.value?.selectionStart || 0);
  const newValue = `${beforeMention}${props.prefix}${option.value} ${afterCursor}`;
  
  inputValue.value = newValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
  emit('select', option);
  
  showDropdown.value = false;
  
  nextTick(() => {
    const cursorPos = beforeMention.length + props.prefix.length + option.value.length + 1;
    textareaRef.value?.setSelectionRange(cursorPos, cursorPos);
    textareaRef.value?.focus();
  });
};

const handleFocus = () => {
  checkMention();
};

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

const focus = () => {
  textareaRef.value?.focus();
};

defineExpose({
  focus,
  textarea: textareaRef,
});
</script>

<style scoped>
.mention {
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.mention-textarea {
  width: 100%;
  padding: 12px 16px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: hsl(var(--text));
  outline: none;
  resize: vertical;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  font-family: inherit;
}

.mention-textarea::placeholder {
  color: hsl(var(--text-muted));
}

.mention-textarea:hover:not(:disabled) {
  border-color: hsl(var(--border-hover));
}

.mention-textarea:focus:not(:disabled) {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.mention-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: hsl(var(--surface-container-high));
}

.mention--disabled {
  pointer-events: none;
  opacity: 0.6;
}

.mention-dropdown {
  width: 300px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  z-index: var(--z-dropdown);
  overflow: hidden;
}

.mention-dropdown-header {
  padding: 10px 14px;
  border-bottom: 1px solid hsl(var(--border));
}

.mention-dropdown-title {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--text-muted));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mention-dropdown-list {
  max-height: 240px;
  overflow-y: auto;
  padding: 8px;
}

.mention-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.mention-option:hover,
.mention-option--selected {
  background: hsl(var(--surface-hover));
}

.mention-option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mention-option-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.mention-option-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mention-option-content {
  flex: 1;
  min-width: 0;
}

.mention-option-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
}

.mention-option-description {
  display: block;
  font-size: 12px;
  color: hsl(var(--text-muted));
  margin-top: 2px;
}

.mention-empty {
  padding: 20px;
  text-align: center;
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.mention-dropdown-enter-active,
.mention-dropdown-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.mention-dropdown-enter-from,
.mention-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
