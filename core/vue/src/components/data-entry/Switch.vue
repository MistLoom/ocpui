<!--
Switch 组件

功能：提供一个开关切换控件，支持不同尺寸、加载状态和自定义图标

Props:
- modelValue: boolean - 绑定的值，默认 false
- size: 'sm' | 'md' | 'lg' - 尺寸，默认 'md'
- disabled: boolean - 是否禁用，默认 false
- loading: boolean - 是否加载中，默认 false
- name: string - 输入框名称
- showIcons: boolean - 是否显示图标，默认 false
- checkedText: string - 选中时的文本
- uncheckedText: string - 未选中时的文本
- customClass: string - 自定义类名

Events:
- update:modelValue: (value: boolean) - 值变化时触发
- change: (value: boolean) - 值变化时触发

Slots:
- default - 自定义标签内容
- checked-icon - 自定义选中图标
- unchecked-icon - 自定义未选中图标

Methods:
- toggle() - 切换开关状态
- focus() - 聚焦到开关
- blur() - 失焦开关
- input - 原生 input 元素引用

使用示例：
<Switch v-model="isEnabled" />
<Switch v-model="isEnabled" size="lg" checkedText="开启" uncheckedText="关闭" />
<Switch v-model="isEnabled" :loading="true" disabled />
-->
<template>
  <label
    :class="switchClass"
    :style="switchStyle"
    @click.prevent="toggle"
    :aria-checked="modelValue"
    :aria-disabled="disabled"
  >
    <input
      ref="inputRef"
      type="checkbox"
      class="switch-input"
      :checked="modelValue"
      :disabled="disabled"
      :name="name"
      @change="handleChange"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
      :aria-label="`Switch ${modelValue ? 'on' : 'off'}`"
    />
    <span class="switch-inner" aria-hidden="true">
      <span :class="thumbClass">
        <span v-if="loading" class="switch-loading">
          <Icon name="loader-2" :size="thumbIconSize" spin />
        </span>
        <span v-else-if="showIcons && modelValue" class="switch-icon">
          <slot name="checked-icon">
            <Icon name="check" :size="thumbIconSize" />
          </slot>
        </span>
        <span v-else-if="showIcons && !modelValue" class="switch-icon">
          <slot name="unchecked-icon">
            <Icon name="x" :size="thumbIconSize" />
          </slot>
        </span>
      </span>
    </span>
    <span v-if="hasLabelContent" class="switch-label">
      <slot>
        {{ modelValue ? checkedText : uncheckedText }}
      </slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, watch, toRef } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { useComponentSize } from '../composables/useComponentSize';
import Icon from '../utility/Icon.vue';

interface Props {
  modelValue?: boolean;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  showIcons?: boolean;
  checkedText?: string;
  uncheckedText?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: undefined,
  disabled: false,
  loading: false,
  showIcons: false,
  checkedText: '',
  uncheckedText: '',
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'change': [value: boolean];
}>();

const resolvedSize = useComponentSize(toRef(props, 'size'));
const slots = useSlots();
const inputRef = ref<HTMLInputElement | null>(null);

const hasLabelContent = computed(() => {
  return !!(slots.default || props.checkedText || props.uncheckedText);
});

const sizeConfig = computed(() => {
  const configs: Record<ComponentSize, { track: { width: number; height: number }; thumb: number }> = {
    sm: { track: { width: 36, height: 20 }, thumb: 16 },
    md: { track: { width: 44, height: 24 }, thumb: 20 },
    lg: { track: { width: 56, height: 30 }, thumb: 26 },
  };
  return configs[resolvedSize.value];
});

const thumbIconSize = computed(() => {
  const map: Record<ComponentSize, number> = { sm: 10, md: 12, lg: 14 };
  return map[resolvedSize.value];
});

const switchClass = computed(() => {
  const classes = ['switch', `switch--${resolvedSize.value}`];
  if (props.modelValue) {
    classes.push('switch--checked');
  }
  if (props.disabled) {
    classes.push('switch--disabled');
  }
  if (props.loading) {
    classes.push('switch--loading');
  }
  if (hasLabelContent.value) {
    classes.push('switch--with-label');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const switchStyle = computed(() => {
  const config = sizeConfig.value;
  return {
    '--switch-track-width': `${config.track.width}px`,
    '--switch-track-height': `${config.track.height}px`,
    '--switch-thumb-size': `${config.thumb}px`,
    '--switch-thumb-offset': `${(config.track.height - config.thumb) / 2}px`,
  };
});

const thumbClass = computed(() => {
  const classes = ['switch-thumb'];
  if (props.modelValue) {
    classes.push('switch-thumb--checked');
  }
  return classes;
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (inputRef.value && inputRef.value.checked !== newValue) {
      inputRef.value.checked = newValue as boolean;
    }
  },
);

const toggle = () => {
  if (props.disabled || props.loading) return;
  const newValue = !props.modelValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
  emit('change', target.checked);
};

defineExpose({
  toggle,
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  input: inputRef,
});
</script>

<style scoped>
.switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.switch--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.switch--loading {
  cursor: wait;
}

.switch-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.switch-inner {
  position: relative;
  display: inline-block;
  width: var(--switch-track-width);
  height: var(--switch-track-height);
  flex-shrink: 0;
}

.switch-inner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: hsl(var(--border));
  border-radius: calc(var(--switch-track-height) / 2);
  transition: background-color 0.25s var(--ease-out);
}

.switch--checked .switch-inner::before {
  background: hsl(var(--primary));
}

.switch--disabled .switch-inner::before {
  background: hsl(var(--surface-container-high));
}

.switch-thumb {
  position: absolute;
  top: var(--switch-thumb-offset);
  left: var(--switch-thumb-offset);
  z-index: 1;
  width: var(--switch-thumb-size);
  height: var(--switch-thumb-size);
  background: hsl(var(--surface));
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-thumb--checked {
  transform: translateX(calc(var(--switch-track-width) - var(--switch-track-height)));
}

.switch-icon {
  width: 60%;
  height: 60%;
  color: hsl(var(--primary));
}

.switch-loading {
  width: 60%;
  height: 60%;
  color: hsl(var(--primary));
}

.switch-label {
  font-size: 14px;
  color: hsl(var(--text));
  transition: color 0.2s var(--ease-out);
}

.switch--disabled .switch-label {
  color: hsl(var(--text-muted));
}

.switch-input:focus-visible + .switch-inner {
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
  border-radius: calc(var(--switch-track-height) / 2);
}

.switch:not(.switch--disabled):not(.switch--loading):hover .switch-inner::before {
  background: hsl(var(--border-hover));
}

.switch:not(.switch--disabled):not(.switch--loading).switch--checked:hover .switch-inner::before {
  background: hsl(var(--primary) / 0.9);
}

.switch--sm {
  gap: 6px;
}

.switch--sm .switch-label {
  font-size: 12px;
}

.switch--lg {
  gap: 12px;
}

.switch--lg .switch-label {
  font-size: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .switch-inner::before,
  .switch-thumb,
  .switch-icon {
    transition: none;
  }
}
</style>
