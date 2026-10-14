<!--
FloatButton 组件

公开属性：
- icon: string - 图标名称
- iconSize: number - 图标尺寸
- type: 'primary' | 'default' | 'danger' - 按钮类型
- shape: 'circle' | 'square' - 按钮形状
- position: FloatButtonPosition - 按钮位置
- tooltip: string - 悬停提示文本
- badge: string | number | boolean - 角标内容
- badgeVariant: 'primary' | 'success' | 'warning' | 'error' | 'info' - 角标样式
- size: 'sm' | 'md' | 'lg' - 按钮尺寸
- disabled: boolean - 是否禁用
- bgColor: string - 自定义背景色
- textColor: string - 自定义文本颜色
- customClass: string - 自定义类名

事件处理器：
- click: (event: MouseEvent) - 点击时触发
-->
<template>
  <button
    :class="floatButtonClass"
    :style="floatButtonStyle"
    :disabled="disabled"
    :aria-label="ariaLabelResolved"
    v-bind="$attrs"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span class="float-button-icon">
      <slot name="icon">
        <Icon :name="icon" :size="iconSize" />
      </slot>
    </span>
    <span v-if="hasBadge" class="float-button-badge" :class="`float-button-badge--${badgeVariant}`">
      {{ badgeContent }}
    </span>
    <Transition name="float-button-tooltip">
      <span v-if="tooltip && showTooltip" class="float-button-tooltip" :class="tooltipClass">
        {{ tooltip }}
      </span>
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Icon from './Icon.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

export type FloatButtonPosition = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';

interface Props {
  icon?: string;
  iconSize?: number;
  type?: 'primary' | 'default' | 'danger';
  shape?: 'circle' | 'square';
  position?: FloatButtonPosition;
  tooltip?: string;
  badge?: string | number | boolean;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  bgColor?: string;
  textColor?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'plus',
  iconSize: 20,
  type: 'primary',
  shape: 'circle',
  position: 'bottom-end',
  tooltip: '',
  badge: false,
  badgeVariant: 'primary',
  size: 'md',
  disabled: false,
  customClass: '',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { uiT: t } = useUiT();

const ariaLabelResolved = computed(() =>
  props.tooltip || t('components.utility.floatButton.defaultAriaLabel', '浮动按钮')
);

const showTooltip = ref(false);

const hasBadge = computed(() => {
  if (typeof props.badge === 'boolean') return props.badge;
  return props.badge !== '' && props.badge !== null && props.badge !== undefined;
});

const floatButtonClass = computed(() => {
  const classes = [
    'float-button',
    `float-button--${props.type}`,
    `float-button--${props.shape}`,
    `float-button--${props.size}`,
  ];

  if (props.position) {
    classes.push(`float-button--${props.position}`);
  }

  if (hasBadge.value) {
    classes.push('float-button--with-badge');
  }

  if (props.tooltip) {
    classes.push('float-button--with-tooltip');
  }

  if (props.disabled) {
    classes.push('float-button--disabled');
  }

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes.join(' ');
});

const floatButtonStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.bgColor) {
    style.backgroundColor = props.bgColor;
  }

  if (props.textColor) {
    style.color = props.textColor;
  }

  return style;
});

const tooltipClass = computed(() => {
  const classes: string[] = [];

  if (props.position?.startsWith('top')) {
    classes.push('float-button-tooltip--bottom');
  } else if (props.position?.startsWith('bottom')) {
    classes.push('float-button-tooltip--top');
  }

  if (props.position?.endsWith('start')) {
    classes.push('float-button-tooltip--right');
  } else if (props.position?.endsWith('end')) {
    classes.push('float-button-tooltip--left');
  }

  return classes.join(' ');
});

const badgeContent = computed(() => {
  if (typeof props.badge === 'boolean') return '';
  if (typeof props.badge === 'number' && props.badge > 99) return '99+';
  return String(props.badge);
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};

const handleMouseEnter = () => {
  if (props.tooltip && !props.disabled) {
    showTooltip.value = true;
  }
};

const handleMouseLeave = () => {
  showTooltip.value = false;
};
</script>

<style scoped>
.float-button {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color var(--transition-normal) var(--ease-out),
    border-color var(--transition-normal) var(--ease-out),
    color var(--transition-normal) var(--ease-out),
    box-shadow var(--transition-normal) var(--ease-out),
    transform var(--transition-normal) var(--ease-out);
  z-index: var(--z-sticky);
  font-family: var(--font-sans);
  user-select: none;
}

.float-button--primary {
  background: hsl(var(--primary));
  color: hsl(var(--surface));
  border-color: hsl(var(--primary));
  box-shadow: var(--shadow-md);
}

.float-button--primary:hover:not(.float-button--disabled) {
  background: hsl(var(--primary) / 0.9);
  border-color: hsl(var(--primary) / 0.9);
}

.float-button--primary:active:not(.float-button--disabled) {
  transform: scale(0.96);
}

.float-button--default {
  background: hsl(var(--surface));
  color: hsl(var(--text-muted));
  border-color: hsl(var(--border));
  box-shadow: var(--shadow-md);
}

.float-button--default:hover:not(.float-button--disabled) {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
  border-color: hsl(var(--border-hover));
}

.float-button--default:active:not(.float-button--disabled) {
  transform: scale(0.96);
}

.float-button--danger {
  background: hsl(var(--error));
  color: hsl(var(--surface));
  border-color: hsl(var(--error));
  box-shadow: var(--shadow-md);
}

.float-button--danger:hover:not(.float-button--disabled) {
  background: hsl(var(--error) / 0.9);
  border-color: hsl(var(--error) / 0.9);
}

.float-button--danger:active:not(.float-button--disabled) {
  transform: scale(0.96);
}

.float-button--circle { border-radius: 50%; }
.float-button--square { border-radius: var(--radius-md-md); }

.float-button--sm {
  width: var(--float-btn-size-sm, 40px);
  height: var(--float-btn-size-sm, 40px);
}

.float-button--md {
  width: var(--float-btn-size-md, 48px);
  height: var(--float-btn-size-md, 48px);
}

.float-button--lg {
  width: var(--float-btn-size-lg, 56px);
  height: var(--float-btn-size-lg, 56px);
}

.float-button--top { top: var(--space-6, 24px); left: 50%; transform: translateX(-50%); }
.float-button--top-start { top: var(--space-6, 24px); left: var(--space-6, 24px); }
.float-button--top-end { top: var(--space-6, 24px); right: var(--space-6, 24px); }
.float-button--bottom { bottom: var(--space-6, 24px); left: 50%; transform: translateX(-50%); }
.float-button--bottom-start { bottom: var(--space-6, 24px); left: var(--space-6, 24px); }
.float-button--bottom-end { bottom: var(--space-6, 24px); right: var(--space-6, 24px); }

.float-button--top:hover:not(.float-button--disabled),
.float-button--bottom:hover:not(.float-button--disabled) {
  transform: translateX(-50%) translateY(-2px);
}

.float-button--top:active:not(.float-button--disabled),
.float-button--bottom:active:not(.float-button--disabled) {
  transform: translateX(-50%) scale(0.95);
}

.float-button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.float-button-icon :deep(svg) {
  stroke: currentColor;
}

.float-button-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  border-radius: 9px;
  border: 2px solid hsl(var(--background));
  box-sizing: border-box;
  color: hsl(var(--surface));
  display: flex;
  align-items: center;
  justify-content: center;
}

.float-button-badge--primary { background: hsl(var(--primary)); }
.float-button-badge--success { background: hsl(var(--success)); }
.float-button-badge--warning { background: hsl(var(--warning)); }
.float-button-badge--error { background: hsl(var(--error)); }
.float-button-badge--info { background: hsl(var(--info)); }

.float-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  transform: none !important;
  box-shadow: none !important;
}

.float-button-tooltip {
  position: absolute;
  padding: var(--space-1, 6px) var(--space-3, 12px);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm, 6px);
  box-shadow: var(--shadow-md);
  font-size: 13px;
  color: hsl(var(--text));
  white-space: nowrap;
  pointer-events: none;
  z-index: var(--z-tooltip);
}

.float-button-tooltip--left {
  right: calc(100% + var(--space-3, 12px));
  top: 50%;
  transform: translateY(-50%);
}

.float-button-tooltip--left::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-left-color: hsl(var(--surface));
}

.float-button-tooltip--right {
  left: calc(100% + var(--space-3, 12px));
  top: 50%;
  transform: translateY(-50%);
}

.float-button-tooltip--right::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: hsl(var(--surface));
}

.float-button-tooltip--top {
  bottom: calc(100% + var(--space-3, 12px));
  left: 50%;
  transform: translateX(-50%);
}

.float-button-tooltip--top::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: hsl(var(--surface));
}

.float-button-tooltip--bottom {
  top: calc(100% + var(--space-3, 12px));
  left: 50%;
  transform: translateX(-50%);
}

.float-button-tooltip--bottom::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-bottom-color: hsl(var(--surface));
}

.float-button-tooltip-enter-active,
.float-button-tooltip-leave-active {
  transition: opacity var(--transition-fast, 0.2s) var(--ease-out),
    transform var(--transition-fast, 0.2s) var(--ease-out);
}

.float-button-tooltip-enter-from,
.float-button-tooltip-leave-to {
  opacity: 0;
}

.float-button-tooltip-enter-from.float-button-tooltip--right,
.float-button-tooltip-leave-to.float-button-tooltip--right {
  transform: translateY(-50%) translateX(-4px);
}

.float-button-tooltip--top.float-button-tooltip-enter-from,
.float-button-tooltip--top.float-button-tooltip-leave-to {
  transform: translateX(-50%) translateY(4px);
}

.float-button-tooltip--bottom.float-button-tooltip-enter-from,
.float-button-tooltip--bottom.float-button-tooltip-leave-to {
  transform: translateX(-50%) translateY(-4px);
}

@media (max-width: 768px) {
  .float-button--top,
  .float-button--top-start,
  .float-button--top-end { top: var(--space-4, 16px); }

  .float-button--bottom,
  .float-button--bottom-start,
  .float-button--bottom-end { bottom: var(--space-4, 16px); }

  .float-button--top-start,
  .float-button--bottom-start { left: var(--space-4, 16px); }

  .float-button--top-end,
  .float-button--bottom-end { right: var(--space-4, 16px); }
}

@media (prefers-reduced-motion: reduce) {
  .float-button,
  .float-button-tooltip-enter-active,
  .float-button-tooltip-leave-active {
    transition: none;
  }
}
</style>
