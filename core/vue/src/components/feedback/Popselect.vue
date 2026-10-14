<template>
  <div :class="popselectClass">
    <PopupPanel
      ref="popupPanelRef"
      v-model="visible"
      :placement="placement"
      :disabled="disabled"
      custom-class="popselect-popup-panel"
      @open="handleOpen"
      @close="handleClose"
    >
      <template #trigger>
        <button 
          type="button" 
          class="popselect-trigger" 
          :disabled="disabled" 
          aria-haspopup="listbox"
          :aria-expanded="visible"
          :aria-controls="visible ? optionsId : undefined"
          @keydown="handleKeydown"
        >
          <span>{{ displayValue || placeholder }}</span>
          <svg viewBox="0 0 12 12" fill="currentColor" class="popselect-arrow">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </template>

      <!-- 自定义菜单内容 -->
      <template #default="{ close }">
        <ul :id="optionsId" class="popselect-options" role="listbox">
          <li
            v-for="(option, index) in props.options"
            :key="option.value"
            :class="optionClass(option, index)"
            role="option"
            :aria-disabled="option.disabled"
            :tabindex="option.disabled ? -1 : 0"
            @click.stop="handleOptionClick(option, close)"
            @mouseenter="handleOptionMouseEnter(index)"
            @keydown="handleOptionKeydown(option, $event, close)"
          >
            <!-- 多选复选框 -->
            <span v-if="multiple" class="popselect-checkbox" @click.stop>
              <input
                type="checkbox"
                :checked="isOptionSelected(option)"
                :disabled="option.disabled"
                @change="handleOptionClick(option, close)"
              />
              <span class="popselect-checkbox-indicator" />
            </span>

            <!-- 选项标签 -->
            <span class="popselect-option-label">
              {{ option.label }}
            </span>

            <!-- 单选选中标记 -->
            <span v-if="!multiple && isOptionSelected(option)" class="popselect-option-check">
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
import { computed, ref, watch } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import PopupPanel from './PopupPanel.vue';

/**
 * Popselect 气泡选择组件
 * 
 * @props modelValue - 当前选中值，支持单选和多选
 * @props options - 选项列表，格式为 [{ label: string, value: string | number, disabled?: boolean }]
 * @props placeholder - 占位文本，默认为 '请选择'
 * @props multiple - 是否支持多选，默认为 false
 * @props disabled - 是否禁用，默认为 false
 * @props placement - 气泡位置，可选值：'top' | 'bottom' | 'left' | 'right'，默认为 'bottom'
 * @props customClass - 自定义类名
 * 
 * @emits update:modelValue - 值变化时触发
 * @emits change - 值变化时触发
 * 
 * @usage
 * <template>
 *   <Popselect
 *     v-model="value"
 *     :options="options"
 *     placeholder="请选择"
 *     placement="bottom"
 *   />
 * </template>
 */

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface Props {
  modelValue?: string | number | (string | number)[];
  options?: Option[];
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  options: () => [],
  placeholder: '请选择',
  multiple: false,
  disabled: false,
  placement: 'bottom',
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [string | number | (string | number)[]];
  'change': [string | number | (string | number)[]];
}>();

const popupPanelRef = ref<InstanceType<typeof PopupPanel>>();
const visible = ref(false);
const focusedIndex = ref(-1);
const optionsId = useComponentId('popselect-options');

const popselectClass = computed(() => {
  const classes = ['popselect'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const displayValue = computed(() => {
  const modelValue = props.modelValue;
  if (props.multiple && Array.isArray(modelValue)) {
    const selectedOptions = props.options.filter(opt => modelValue.includes(opt.value));
    return selectedOptions.map(opt => opt.label).join(', ');
  }
  
  if (modelValue !== undefined && modelValue !== null) {
    const option = props.options.find(opt => opt.value === modelValue);
    return option?.label || '';
  }
  
  return '';
});

const isOptionSelected = (option: Option): boolean => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(option.value);
  }
  return props.modelValue === option.value;
};

const optionClass = (option: Option, index: number) => {
  const classes = ['popselect-option'];
  if (isOptionSelected(option)) {
    classes.push('popselect-option--selected');
  }
  if (option.disabled) {
    classes.push('popselect-option--disabled');
  }
  if (index === focusedIndex.value) {
    classes.push('popselect-option--focused');
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
  
  focusedIndex.value = -1;
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

const handleOpen = () => {
  focusedIndex.value = -1;
};

const handleClose = () => {
  focusedIndex.value = -1;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return;
  
  switch (e.key) {
    case 'Enter':
    case 'ArrowDown':
      e.preventDefault();
      popupPanelRef.value?.show();
      // 聚焦到第一个可用选项
      const firstEnabledIndex = props.options.findIndex(opt => !opt.disabled);
      if (firstEnabledIndex > -1) {
        focusedIndex.value = firstEnabledIndex;
      }
      break;
    case 'Escape':
      visible.value = false;
      break;
  }
};

watch(visible, (val) => {
  if (!val) {
    focusedIndex.value = -1;
  }
});

const show = () => {
  popupPanelRef.value?.show();
};

const hide = () => {
  visible.value = false;
};

defineExpose({
  show,
  hide,
  visible,
});
</script>

<style scoped>
.popselect {
  display: inline-block;
}

.popselect-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  font-size: 14px;
  color: hsl(var(--text));
  cursor: pointer;
  transition: background-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.popselect-trigger:hover:not(:disabled) {
  border-color: hsl(var(--border-hover));
}

.popselect-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: hsl(var(--surface-container-high));
}

.popselect-arrow {
  width: 12px;
  height: 12px;
  color: hsl(var(--text-muted));
  transition: transform 0.2s;
}

.popselect-trigger:hover:not(:disabled) .popselect-arrow {
  color: hsl(var(--text));
}

/* PopupPanel 样式覆盖 */
:deep(.popselect-popup-panel) {
  z-index: var(--z-popover);
  padding: 8px;
}

.popselect-options {
  list-style: none;
  margin: 0;
  padding: 0;
}

.popselect-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 4px;
  font-size: 14px;
  color: hsl(var(--text));
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  outline: none;
}

.popselect-option:last-child {
  margin-bottom: 0;
}

.popselect-option:hover:not(.popselect-option--disabled),
.popselect-option--focused:not(.popselect-option--disabled) {
  background: hsl(var(--surface-hover));
  transform: translateX(4px);
}

.popselect-option--selected {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  font-weight: 500;
}

.popselect-option--selected:hover:not(.popselect-option--disabled),
.popselect-option--selected.popselect-option--focused:not(.popselect-option--disabled) {
  background: hsl(var(--primary) / 0.15);
}

.popselect-option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.popselect-option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popselect-option-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: hsl(var(--primary));
  flex-shrink: 0;
}

.popselect-option-check svg {
  width: 12px;
  height: 12px;
}

.popselect-checkbox {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  cursor: pointer;
}

.popselect-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.popselect-checkbox-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  transition: background-color 0.2s, border-color 0.2s;
}

.popselect-checkbox input:checked + .popselect-checkbox-indicator {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.popselect-checkbox input:checked + .popselect-checkbox-indicator::after {
  content: '';
  display: block;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}
</style>
