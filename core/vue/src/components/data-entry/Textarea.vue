&lt;!--
Textarea 组件

功能：提供一个多行文本输入框，支持自动调整大小、字数统计等功能

Props:
- modelValue: string - 绑定的值，默认 ''
- placeholder: string - 占位符文本，默认 ''
- disabled: boolean - 是否禁用，默认 false
- readonly: boolean - 是否只读，默认 false
- rows: number - 行数，默认 4
- autosize: boolean | { minRows?: number; maxRows?: number } - 是否自动调整大小，默认 false
- maxlength: number - 最大字符数
- showCount: boolean - 是否显示字数统计，默认 false
- resize: 'none' | 'both' | 'horizontal' | 'vertical' - 调整大小方向，默认 'vertical'
- size: 'sm' | 'md' | 'lg' - 尺寸，默认 'md'
- status: 'default' | 'error' | 'warning' - 状态，默认 'default'
- autoWidth: boolean - 是否自动宽度，默认 false
- customClass: string - 自定义类名

Events:
- update:modelValue: (string) - 值变化时触发
- change: (string) - 值变化时触发
- focus: (FocusEvent) - 聚焦时触发
- blur: (FocusEvent) - 失焦时触发
- keydown: (KeyboardEvent) - 按键按下时触发
- resize: ({ width: number; height: number }) - 调整大小时触发

Methods:
- focus() - 聚焦到文本框
- blur() - 失焦文本框
- select() - 选择文本
- textareaRef - 原生 textarea 元素引用

使用示例：
&lt;Textarea v-model="content" placeholder="请输入内容" /&gt;
&lt;Textarea v-model="content" :rows="3" :maxlength="100" showCount /&gt;
&lt;Textarea v-model="content" :autosize="{ minRows: 2, maxRows: 6 }" /&gt;
&lt;Textarea v-model="content" size="sm" status="error" disabled /&gt;
--&gt;
<template>
  <div :class="wrapperClass">
    <textarea
      ref="textareaRef"
      :class="textareaClass"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :rows="computedRows"
      :maxlength="computedMaxlength"
      :style="textareaStyle"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      :aria-disabled="disabled"
      :aria-readonly="readonly"
      :aria-invalid="status === 'error'"
      :aria-label="placeholder || 'Text input'"
    />
    <div v-if="showCount || maxlength" class="textarea-count" aria-hidden="true">
      <span>{{ currentLength }}</span>
      <span v-if="maxlength">/{{ maxlength }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, toRef } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { useComponentSize } from '../composables/useComponentSize';

type TextareaSize = ComponentSize;
type ResizeDirection = 'none' | 'both' | 'horizontal' | 'vertical';

interface Props {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  autosize?: boolean | { minRows?: number; maxRows?: number };
  maxlength?: number;
  showCount?: boolean;
  resize?: ResizeDirection;
  size?: TextareaSize;
  status?: 'default' | 'error' | 'warning';
  autoWidth?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  rows: 4,
  autosize: false,
  maxlength: undefined,
  showCount: false,
  resize: 'vertical',
  size: undefined,
  status: 'default',
  autoWidth: false,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [string];
  'change': [string];
  'focus': [FocusEvent];
  'blur': [FocusEvent];
  'keydown': [KeyboardEvent];
  'resize': [{ width: number; height: number }];
}>();

const textareaRef = ref<HTMLTextAreaElement>();
const focused = ref(false);
const textareaHeight = ref<number>();
const resolvedSize = useComponentSize(toRef(props, 'size'));

const wrapperClass = computed(() => {
  const classes = ['textarea-wrapper'];
  if (props.showCount || props.maxlength) {
    classes.push('textarea-wrapper--has-count');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const textareaClass = computed(() => {
  const classes = ['textarea', `textarea--${resolvedSize.value}`];
  if (props.disabled) {
    classes.push('textarea--disabled');
  }
  if (focused.value) {
    classes.push('textarea--focused');
  }
  if (props.readonly) {
    classes.push('textarea--readonly');
  }
  if (props.status === 'error') {
    classes.push('textarea--error');
  } else if (props.status === 'warning') {
    classes.push('textarea--warning');
  }
  return classes;
});

const textareaStyle = computed(() => {
  const style: Record<string, string> = {};
  style.resize = props.resize;
  if (textareaHeight.value) {
    style.height = `${textareaHeight.value}px`;
  }
  return style;
});

const computedRows = computed(() => {
  if (props.autosize && typeof props.autosize === 'object') {
    return props.autosize.minRows || 1;
  }
  return props.rows;
});

const computedMaxlength = computed(() => {
  return props.maxlength;
});

const currentLength = computed(() => {
  return props.modelValue?.length || 0;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  let value = target.value;
  
  if (props.maxlength && value.length > props.maxlength) {
    value = value.slice(0, props.maxlength);
    target.value = value;
  }
  
  emit('update:modelValue', value);
  emit('change', value);
  
  if (props.autosize) {
    autoResize();
  }
};

const handleFocus = (event: FocusEvent) => {
  if (props.disabled) return;
  focused.value = true;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  focused.value = false;
  emit('blur', event);
};

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event);
};

const autoResize = () => {
  if (!textareaRef.value) return;
  
  const textarea = textareaRef.value;
  const computedStyle = getComputedStyle(textarea);
  const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
  const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

  
  textarea.style.height = 'auto';
  
  let height = textarea.scrollHeight;
  
  if (typeof props.autosize === 'object') {
    const minHeight = (props.autosize.minRows || 1) * lineHeight + paddingTop + paddingBottom;
    const maxHeight = props.autosize.maxRows 
      ? props.autosize.maxRows * lineHeight + paddingTop + paddingBottom 
      : Infinity;
    height = Math.max(minHeight, Math.min(maxHeight, height));
  }
  
  textareaHeight.value = height;
  textarea.style.height = `${height}px`;
  
  emit('resize', { 
    width: textarea.offsetWidth, 
    height: textarea.offsetHeight 
  });
};

const focus = () => {
  textareaRef.value?.focus();
};

const blur = () => {
  textareaRef.value?.blur();
};

const select = () => {
  textareaRef.value?.select();
};

watch(() => props.modelValue, () => {
  if (props.autosize) {
    nextTick(() => autoResize());
  }
});

// 组件挂载后初始化自动调整大小
nextTick(() => {
  if (props.autosize) {
    autoResize();
  }
});

defineExpose({
  focus,
  blur,
  select,
  textareaRef,
});
</script>

<style scoped>
.textarea-wrapper {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
}

.textarea {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: hsl(var(--text));
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  outline: none;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.textarea::placeholder {
  color: hsl(var(--text-muted));
}

.textarea:hover:not(.textarea--disabled):not(.textarea--readonly) {
  border-color: hsl(var(--border-hover));
}

.textarea--focused {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.textarea--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: hsl(var(--surface-container-high));
}

.textarea--readonly {
  cursor: default;
}

.textarea--error {
  border-color: hsl(var(--error));
}

.textarea--error.textarea--focused {
  border-color: hsl(var(--error));
  box-shadow: 0 0 0 3px hsl(var(--error) / 0.1);
}

.textarea--warning {
  border-color: hsl(var(--warning));
}

.textarea--warning.textarea--focused {
  border-color: hsl(var(--warning));
  box-shadow: 0 0 0 3px hsl(var(--warning) / 0.1);
}

.textarea--sm {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 10px;
}

.textarea--lg {
  padding: 16px 20px;
  font-size: 16px;
  border-radius: 14px;
}

.textarea-count {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: hsl(var(--text-muted));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  pointer-events: none;
}

.textarea-wrapper--has-count .textarea {
  padding-bottom: 28px;
}
</style>
