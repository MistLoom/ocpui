<template>
  <button
    :class="buttonClass"
    :disabled="disabled || submitting"
    :type="type"
    :style="buttonStyle"
    @click="onClick"
  >
    <span v-if="submitting" class="btn-loading-spinner" />
    <span class="btn-content" :class="{ 'btn-content--loading': submitting }">
      <slot />
    </span>
    <span v-if="withArrow && !submitting" :class="arrowClass">→</span>
  </button>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { ButtonVariant, Size, ButtonType } from '@ocpui/vue/types';
import { useRepeatGuard } from '@ocpui/vue/system';
import { useComponentSize } from '../composables/useComponentSize';

interface Props {
  variant?: ButtonVariant;
  size?: Size;
  withArrow?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: ButtonType;
  customClass?: string;
  fullWidth?: boolean;
  bgColor?: string;
  textColor?: string;
  /**
   * 连点守卫（perception §3.1 复合-连点）：800ms 窗口内重复点击忽略并呈 submitting。
   * type='submit' 时默认启用；type='button' 的异步动作者显式开启。
   */
  repeatGuard?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: undefined,
  withArrow: false,
  disabled: false,
  loading: false,
  type: 'button',
  customClass: '',
  fullWidth: false,
  repeatGuard: undefined,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const resolvedSize = useComponentSize(toRef(props, 'size'));

// 连点守卫：仅提交型控件启用；外部 loading 期间同样锁定
const guardEnabled = computed(() => props.repeatGuard ?? props.type === 'submit');
const { pending: guardPending, guard } = useRepeatGuard({
  windowMs: 800,
  locked: toRef(() => props.loading),
});

/** 提交中 = 外部 loading 或守卫窗口内；非守卫按钮仅跟随 loading */
const submitting = computed(() =>
  guardEnabled.value ? props.loading || guardPending.value : props.loading,
);

const guardedClick = guard((event: MouseEvent) => {
  emit('click', event);
});

const onClick = (event: MouseEvent) => {
  // 非提交型按钮不启用连点守卫，点击直通
  if (guardEnabled.value) {
    guardedClick(event);
  } else {
    emit('click', event);
  }
};

const buttonClass = computed(() => {
  const classes: string[] = [];
  const size = resolvedSize.value;

  if (props.variant === 'icon') {
    classes.push('tool-button');
    
    if (size === 'sm') {
      classes.push('tool-button-sm');
    } else if (size === 'lg') {
      classes.push('tool-button-lg');
    }
  } else {
    classes.push('btn');
    
    if (props.variant === 'primary') {
      classes.push('btn-primary');
    } else if (props.variant === 'secondary') {
      classes.push('btn-secondary');
    } else if (props.variant === 'text') {
      classes.push('btn-text');
    } else if (props.variant === 'danger') {
      classes.push('btn-danger');
    } else if (props.variant === 'success') {
      classes.push('btn-success');
    } else if (props.variant === 'ghost') {
      classes.push('btn-ghost');
    }
    
    if (size === 'sm') {
      classes.push('btn-sm');
    } else if (size === 'lg') {
      classes.push('btn-lg');
    }
    
    if (submitting.value) {
      classes.push('btn--loading');
    }
    
    if (props.fullWidth) {
      classes.push('btn-full-width');
    }
  }
  
  if (props.customClass) {
    classes.push(props.customClass);
  }
  
  return classes;
});

const buttonStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.bgColor) {
    style.backgroundColor = props.bgColor;
  }
  
  if (props.textColor) {
    style.color = props.textColor;
  }
  
  return style;
});

const arrowClass = computed(() => {
  return 'btn-arrow';
});
</script>

<style scoped>
button {
  position: relative;
  overflow: hidden;
  font-family: var(--font-sans);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-5);
  font-size: var(--font-size-sm);
  font-weight: 560;
  line-height: 1.5;
  letter-spacing: -0.005em;
  min-height: var(--control-min-height);
  border-radius: var(--radius-control);
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color 0.16s var(--ease-emphasized),
    border-color 0.16s var(--ease-emphasized),
    color 0.16s var(--ease-emphasized),
    box-shadow 0.16s var(--ease-emphasized),
    transform 0.12s var(--ease-emphasized);
  user-select: none;
  white-space: nowrap;
}

.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-md-sm);
}

.btn-lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--font-size-md);
  border-radius: var(--radius-md-lg);
}

.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--surface));
  border-color: hsl(var(--primary));
  box-shadow: 0 3px 12px hsl(var(--primary) / 0.15);
}

.btn-primary:hover:not(:disabled) {
  background: hsl(var(--primary-dark));
  border-color: hsl(var(--primary-dark));
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-secondary {
  background: hsl(var(--surface));
  color: hsl(var(--text));
  border-color: hsl(var(--border));
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.btn-secondary:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-text {
  background: transparent;
  color: hsl(var(--primary));
  border-color: transparent;
  padding: var(--space-3);
}

.btn-text:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.08);
}

.btn-text:active:not(:disabled) {
  transform: scale(0.96);
  background: hsl(var(--primary) / 0.12);
}

.btn-danger {
  background: hsl(var(--error));
  color: hsl(var(--surface));
  border-color: hsl(var(--error));
  box-shadow: var(--shadow-sm);
}

.btn-danger:hover:not(:disabled) {
  background: hsl(var(--error) / 0.9);
  border-color: hsl(var(--error) / 0.9);
}

.btn-danger:active:not(:disabled) {
  transform: scale(0.96);
}

.btn-full-width {
  width: 100%;
}

.tool-button-sm {
  width: 32px;
  height: 32px;
  position: relative;
}

.tool-button-sm::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
}

.tool-button-lg {
  width: 44px;
  height: 44px;
}

.btn--loading {
  position: relative;
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  margin-top: -8px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: btn-spin 0.8s linear infinite;
}

.btn-content--loading {
  opacity: 0;
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}

.tool-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md-sm);
  cursor: pointer;
  transition: background-color var(--transition-normal) var(--ease-out), border-color var(--transition-normal) var(--ease-out), color var(--transition-normal) var(--ease-out), box-shadow var(--transition-normal) var(--ease-out), transform var(--transition-normal) var(--ease-out);
  color: hsl(var(--text-muted));
  position: relative;
}

.tool-button::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
}

.tool-button:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.dark .tool-button:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.dark .tool-button:hover:not(:disabled) :deep(.icon) {
  color: hsl(var(--text));
}

.tool-button:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-normal) var(--ease-out);
}

.btn-arrow {
  display: inline-block;
  margin-left: var(--space-2);
  transition: transform var(--transition-normal) var(--ease-out);
}

button:hover .btn-arrow {
  transform: translateX(4px);
}

button:active .btn-content {
  transform: scale(0.96);
}

@media (max-width: 639.98px) {
  .btn {
    min-height: var(--touch-min-size);
    padding: var(--space-3) var(--space-5);
    font-size: var(--font-size-sm);
    border-radius: var(--radius-md-md);
  }
  
  .btn-text {
    min-height: var(--touch-min-size);
    padding: var(--space-3) var(--space-4);
  }
  
  .tool-button {
    width: var(--touch-min-size);
    height: var(--touch-min-size);
    border-radius: var(--radius-md-md);
  }
  
  .btn-arrow {
    margin-left: var(--space-1);
  }
  
  .btn:hover:not(:disabled) {
    background: hsl(var(--primary) / 0.9);
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: hsl(var(--surface-hover));
    border-color: hsl(var(--border-hover));
  }
  
  .tool-button:hover:not(:disabled) {
    background: hsl(var(--surface-hover));
    border-color: hsl(var(--border-hover));
  }
}
</style>
