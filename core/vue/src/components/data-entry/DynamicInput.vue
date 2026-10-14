<template>
  <div :class="dynamicInputClass">
    <div v-if="modelValue.length === 0" class="dynamic-input-empty">
      <slot name="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <p>{{ t('components.dataEntry.dynamicInput.empty') }}</p>
        <p class="dynamic-input-empty-hint">{{ t('components.dataEntry.dynamicInput.emptyHint') }}</p>
      </slot>
    </div>
    <div v-else class="dynamic-input-list">
      <div
        v-for="(item, index) in modelValue"
        :key="index"
        class="dynamic-input-item"
      >
        <slot :item="item" :index="index" :update="handleUpdate(index)">
          <Input
            class="dynamic-input-field"
            :model-value="item"
            :placeholder="placeholder"
            :disabled="disabled"
            @update:model-value="handleInput(index, String($event))"
            @keydown="(e: KeyboardEvent) => handleFieldKeydown(index, e)"
          />
        </slot>
        <div class="dynamic-input-actions">
          <Button
            v-if="!disabled && modelValue.length > min"
            type="button"
            size="sm"
            variant="secondary"
            class="dynamic-input-btn"
            :aria-label="removeButtonLabel"
            :disabled="disabled"
            @click="handleRemove(index)"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </Button>
          <Button
            v-if="!disabled && showSortButton && index > 0"
            type="button"
            size="sm"
            variant="secondary"
            class="dynamic-input-btn"
            :aria-label="t('components.dataEntry.dynamicInput.moveUp')"
            :disabled="disabled"
            @click="handleMoveUp(index)"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M6 2L2 6L6 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </Button>
          <Button
            v-if="!disabled && showSortButton && index < modelValue.length - 1"
            type="button"
            size="sm"
            variant="secondary"
            class="dynamic-input-btn"
            :aria-label="t('components.dataEntry.dynamicInput.moveDown')"
            :disabled="disabled"
            @click="handleMoveDown(index)"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M6 2L2 6L6 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </Button>
        </div>
      </div>
    </div>
    <Button
      v-if="!disabled && (max === 0 || modelValue.length < max)"
      type="button"
      size="sm"
      variant="secondary"
      class="dynamic-input-add"
      :disabled="disabled"
      @click="handleAdd"
    >
      <svg viewBox="0 0 12 12" fill="none">
        <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span>{{ addButtonLabel }}</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
/**
 * 动态输入组件
 * @description 允许用户添加、删除和排序输入项的组件
 * 
 * @props {
 *   modelValue: string[]; // 绑定值，输入项列表
 *   placeholder?: string; // 输入框占位符
 *   disabled?: boolean; // 是否禁用
 *   min?: number; // 最小输入项数量
 *   max?: number; // 最大输入项数量
 *   showSortButton?: boolean; // 是否显示排序按钮
 *   addButtonLabel?: string; // 添加按钮文本
 *   removeButtonLabel?: string; // 删除按钮文本
 *   customClass?: string; // 自定义类名
 * }
 * 
 * @emits {
 *   'update:modelValue': [value: string[]]; // 值更新事件
 *   'add': [index: number]; // 添加事件
 *   'remove': [index: number, value: string]; // 删除事件
 *   'change': [value: string[]]; // 变化事件
 * }
 * 
 * @example
 * // 基本使用
 * <DynamicInput v-model="tags" />
 * 
 * // 带排序功能
 * <DynamicInput v-model="items" show-sort-button />
 */
import { computed } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import Input from './Input.vue';
import Button from '../utility/Button.vue';

const { uiT: t } = useUiT();

interface Props {
  modelValue: string[];
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  showSortButton?: boolean;
  addButtonLabel?: string;
  removeButtonLabel?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入',
  disabled: false,
  min: 0,
  max: 0,
  showSortButton: false,
  addButtonLabel: '添加',
  removeButtonLabel: '删除',
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  'add': [index: number];
  'remove': [index: number, value: string];
  'change': [value: string[]];
}>();

const dynamicInputClass = computed(() => {
  const classes = ['dynamic-input'];
  if (props.disabled) classes.push('dynamic-input--disabled');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const handleInput = (index: number, value: string) => {
  const newValue = [...props.modelValue];
  newValue[index] = value;
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const handleUpdate = (index: number) => (value: string) => {
  handleInput(index, value);
};

const handleAdd = () => {
  const newValue = [...props.modelValue, ''];
  emit('update:modelValue', newValue);
  emit('add', newValue.length - 1);
  emit('change', newValue);
};

const handleRemove = (index: number) => {
  const removedValue = props.modelValue[index];
  const newValue = [...props.modelValue];
  newValue.splice(index, 1);
  emit('update:modelValue', newValue);
  emit('remove', index, removedValue);
  emit('change', newValue);
};

const handleMoveUp = (index: number) => {
  if (index === 0) return;
  const newValue = [...props.modelValue];
  [newValue[index - 1], newValue[index]] = [newValue[index], newValue[index - 1]];
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const handleMoveDown = (index: number) => {
  if (index === props.modelValue.length - 1) return;
  const newValue = [...props.modelValue];
  [newValue[index], newValue[index + 1]] = [newValue[index + 1], newValue[index]];
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const handleFieldKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleAdd();
    return;
  }
  if (event.key === 'Backspace' && props.modelValue[index] === '' && props.modelValue.length > props.min) {
    event.preventDefault();
    handleRemove(index);
  }
};
</script>

<style scoped>
.dynamic-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dynamic-input-item :deep(.input-wrapper) {
  flex: 1;
  min-width: 0;
}

.dynamic-input-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dynamic-input-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dynamic-input-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.dynamic-input-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s;
}

.dynamic-input-btn:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.dynamic-input-btn--remove:hover:not(:disabled) {
  background: hsl(var(--error) / 0.1);
  border-color: hsl(var(--error));
  color: hsl(var(--error));
}

.dynamic-input-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dynamic-input-btn svg {
  width: 12px;
  height: 12px;
}

.dynamic-input-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: 1px dashed hsl(var(--border));
  border-radius: 12px;
  font-size: 14px;
  color: hsl(var(--primary));
  cursor: pointer;
  transition: color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
  margin-top: 8px;
}

.dynamic-input-add:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.05);
  border-color: hsl(var(--primary));
}

.dynamic-input-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dynamic-input-add svg {
  width: 12px;
  height: 12px;
}

.dynamic-input--disabled {
  pointer-events: none;
  opacity: 0.6;
}

.dynamic-input-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background: hsl(var(--surface-container-high));
  border: 2px dashed hsl(var(--border));
  border-radius: 12px;
  margin-bottom: 8px;
}

.dynamic-input-empty svg {
  width: 48px;
  height: 48px;
  color: hsl(var(--text-muted));
  margin-bottom: 16px;
}

.dynamic-input-empty p {
  margin: 0 0 8px 0;
  color: hsl(var(--text));
  font-size: 14px;
  font-weight: 500;
}

.dynamic-input-empty-hint {
  color: hsl(var(--text-muted)) !important;
  font-size: 13px !important;
  font-weight: 400 !important;
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .dynamic-input-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .dynamic-input-actions {
    justify-content: flex-end;
  }
  
  .dynamic-input-empty {
    padding: 32px 16px;
  }
  
  .dynamic-input-empty svg {
    width: 32px;
    height: 32px;
  }
}
</style>
