<!--
IconButton 组件

功能：图标按钮组件，尺寸自动适配图标大小，保持统一美观

属性：
- variant: 按钮变体，可选值：primary, secondary, ghost, error, danger, text, outline，默认值：default
- size: 按钮尺寸，可选值：xs(16px图标), sm(18px图标), md(20px图标), lg(24px图标)，默认值：md
- disabled: 是否禁用，默认值：false
- loading: 是否加载中，默认值：false
- icon: 图标名称
- iconSvg: SVG 图标字符串
- type: 按钮类型，可选值：button, submit, reset，默认值：button
- color: 自定义颜色
- title: 提示文字（会显示原生 tooltip）
- shape: 形状，可选值：circle(圆形), square(方形，默认)，默认值：square

事件：
- click: 点击事件

使用方式：
<IconButton icon="plus" variant="primary" @click="handleClick" />
<IconButton iconSvg="<svg>...</svg>" variant="primary" @click="handleClick" />
<IconButton variant="ghost" :loading="loading" title="刷新">
  <Icon name="settings" />
</IconButton>
-->

<template>
  <button
    :class="buttonClass"
    :disabled="disabled || loading"
    :type="type"
    :title="title"
    :aria-label="ariaLabel || title"
    @click="handleClick"
  >
    <span v-if="loading" class="icon-button-loading">
      <Icon name="loader-2" :size="iconSize" class="spin" />
    </span>
    <span v-else class="icon-button-content">
      <slot>
        <Icon v-if="iconSvg" :svg="iconSvg" :size="iconSize" />
        <Icon v-else-if="icon" :name="icon" :size="iconSize" />
      </slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import Icon from './Icon.vue';
import type { ComponentSizeWithXs } from '@ocpui/vue/types';
import { useComponentSize } from '../composables/useComponentSize';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'error' | 'danger' | 'default' | 'text' | 'outline';
type ButtonSize = ComponentSizeWithXs;
type ButtonType = 'button' | 'submit' | 'reset';
type ButtonShape = 'circle' | 'square';

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconSvg?: string;
  type?: ButtonType;
  color?: string;
  title?: string;
  shape?: ButtonShape;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: undefined,
  disabled: false,
  loading: false,
  type: 'button',
  color: '',
  title: '',
  shape: 'square',
  ariaLabel: '',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const resolvedSize = useComponentSize(toRef(props, 'size'));

const buttonClass = computed(() => {
  const classes = ['icon-button'];
  classes.push(`icon-button--${props.variant}`);
  classes.push(`icon-button--${resolvedSize.value}`);
  if (props.shape === 'circle') {
    classes.push('icon-button--circle');
  }
  if (props.loading) {
    classes.push('icon-button--loading');
  }
  if (props.color) {
    classes.push('icon-button--custom');
  }
  return classes;
});

const iconSize = computed(() => {
  const map: Record<ButtonSize, number> = {
    xs: 16,
    sm: 18,
    md: 20,
    lg: 24,
  };
  return map[resolvedSize.value] ?? 20;
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  font-family: inherit;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
  padding: 0;
  flex-shrink: 0;
}

.icon-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.25);
}

.icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.icon-button:active:not(:disabled) {
  transform: scale(0.96);
}

.icon-button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.icon-button-svg {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button-svg :deep(svg) {
  width: var(--icon-size);
  height: var(--icon-size);
}

.icon-button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}



/* Size variants - square shape */
.icon-button--xs {
  --icon-size: 16px;
  width: calc(16px + 6px * 2);
  height: calc(16px + 6px * 2);
  border-radius: 6px;
}

.icon-button--sm {
  --icon-size: 18px;
  width: calc(18px + 7px * 2);
  height: calc(18px + 7px * 2);
  border-radius: 7px;
}

.icon-button--md {
  --icon-size: 20px;
  width: calc(20px + 8px * 2);
  height: calc(20px + 8px * 2);
  border-radius: 8px;
}

.icon-button--lg {
  --icon-size: 24px;
  width: calc(24px + 10px * 2);
  height: calc(24px + 10px * 2);
  border-radius: 10px;
}

/* Circle shape - maintains square ratio */
.icon-button--circle {
  border-radius: 50% !important;
}

/* Variant styles */
.icon-button--default {
  background: hsl(var(--surface));
  color: hsl(var(--text));
  border-color: hsl(var(--border));
}

.icon-button--default:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
  box-shadow: var(--shadow-sm);
}

.icon-button--primary {
  background: hsl(var(--primary));
  color: hsl(var(--surface));
  border-color: hsl(var(--primary));
  box-shadow: var(--shadow-sm);
}

.icon-button--primary:hover:not(:disabled) {
  background: hsl(var(--primary-hover, var(--primary)) / 0.95);
  border-color: hsl(var(--primary-hover, var(--primary)) / 0.95);
}

.icon-button--secondary {
  background: hsl(var(--surface-elevated));
  color: hsl(var(--text));
  border-color: hsl(var(--border));
}

.icon-button--secondary:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  box-shadow: var(--shadow-sm);
}

.icon-button--ghost {
  background: transparent;
  color: hsl(var(--text-secondary));
  border-color: transparent;
}

.icon-button--ghost:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
  border-color: hsl(var(--border));
}

.icon-button--text {
  background: transparent;
  color: hsl(var(--text-secondary));
  border-color: transparent;
}

.icon-button--text:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.08);
  color: hsl(var(--primary));
}

.icon-button--outline {
  background: transparent;
  color: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.icon-button--outline:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.08);
  border-color: hsl(var(--primary));
}

.icon-button--error,
.icon-button--danger {
  background: hsl(var(--error) / 0.1);
  color: hsl(var(--error));
  border-color: hsl(var(--error) / 0.2);
}

.icon-button--error:hover:not(:disabled),
.icon-button--danger:hover:not(:disabled) {
  background: hsl(var(--error) / 0.15);
  border-color: hsl(var(--error) / 0.3);
  box-shadow: var(--shadow-sm);
}

/* Custom color */
.icon-button--custom {
  background: v-bind(color);
  color: hsl(var(--surface));
  border-color: v-bind(color);
  box-shadow: var(--shadow-sm);
}

.icon-button--custom:hover:not(:disabled) {
  filter: brightness(0.95);
}

/* Loading state */
.icon-button--loading {
  pointer-events: none;
}

/* Responsive touch targets */
@media (hover: none) and (pointer: coarse) {
  .icon-button--xs,
  .icon-button--sm {
    min-width: 36px;
    min-height: 36px;
  }

  .icon-button--md {
    min-width: 44px;
    min-height: 44px;
  }

  .icon-button--lg {
    min-width: 52px;
    min-height: 52px;
  }
}
</style>
