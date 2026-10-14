<template>
  <span
    :class="tagClass"
    :role="disabled ? undefined : 'button'"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
    @keydown.enter.prevent="handleKeyboardClick"
    @keydown.space.prevent="handleKeyboardClick"
  >
    <span v-if="loading" class="tag-loading-spinner" />
    <span v-if="$slots.icon && !loading" class="tag-icon">
      <slot name="icon" />
    </span>
    <slot />
    <button
      v-if="closable && !loading"
      type="button"
      class="tag-close"
      @click.stop="handleClose"
      :aria-label="t('components.dataDisplay.tag.closeAriaLabel')"
    >
      <svg viewBox="0 0 12 12" fill="currentColor" class="tag-close-icon">
        <path d="M6 4.6L3.4 2 2 3.4 4.6 6 2 8.6 3.4 10 6 7.4 8.6 10 10 8.6 7.4 6 10 3.4 8.6 2 6 4.6z"/>
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TagVariant, TagSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface Props {
  variant?: TagVariant;
  size?: TagSize;
  closable?: boolean;
  disabled?: boolean;
  round?: boolean;
  loading?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  closable: false,
  disabled: false,
  round: false,
  loading: false,
  customClass: '',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  close: [event: MouseEvent];
}>();

const tagClass = computed(() => {
  const classes = [
    'tag',
    `tag-${props.variant}`,
    `tag-${props.size}`,
  ];
  if (props.closable) {
    classes.push('tag-closable');
  }
  if (props.disabled) {
    classes.push('tag-disabled');
  }
  if (props.round) {
    classes.push('tag-round');
  }
  if (props.loading) {
    classes.push('tag-loading');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};

const handleKeyboardClick = () => {
  if (props.disabled) return;
  emit('click', new MouseEvent('click'));
};

const handleClose = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('close', event);
  }
};
</script>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1.4;
  border-radius: var(--radius-md-lg);
  border: 1px solid transparent;
  transition:
    background-color var(--transition-normal) var(--ease-out),
    border-color var(--transition-normal) var(--ease-out),
    color var(--transition-normal) var(--ease-out);
  cursor: default;
  font-family: var(--font-sans);
  user-select: none;
}

.tag-default {
  background: hsl(var(--surface));
  color: hsl(var(--text-secondary));
  border-color: hsl(var(--border));
}

.tag-primary {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  border-color: hsl(var(--primary) / 0.3);
}

.tag-success {
  background: hsl(var(--success) / 0.1);
  color: hsl(var(--success));
  border-color: hsl(var(--success) / 0.3);
}

.tag-warning {
  background: hsl(var(--warning) / 0.1);
  color: hsl(var(--warning));
  border-color: hsl(var(--warning) / 0.3);
}

.tag-error {
  background: hsl(var(--error) / 0.1);
  color: hsl(var(--error));
  border-color: hsl(var(--error) / 0.3);
}

.tag-info {
  background: hsl(var(--info) / 0.1);
  color: hsl(var(--info));
  border-color: hsl(var(--info) / 0.3);
}

.tag-sm {
  min-height: var(--pill-height-sm);
  padding: 0 var(--pill-pad-x-sm);
  font-size: var(--pill-font-sm);
  border-radius: var(--pill-radius);
}

.tag-lg {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-md);
  border-radius: var(--radius-md-xl);
}

.tag-round {
  border-radius: var(--radius-md-full);
}

.tag-closable {
  padding-right: var(--space-2);
}

.tag-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.tag-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: var(--space-1);
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  transition:
    opacity var(--transition-fast),
    background-color var(--transition-fast);
  border-radius: 50%;
}

.tag-close:hover {
  opacity: 1;
  background: hsl(var(--background) / 0.2);
}

.tag-close-icon {
  width: 12px;
  height: 12px;
}

.tag:not(.tag-disabled):hover {
  border-color: hsl(var(--border-hover));
  background: hsl(var(--surface-hover));
}

.tag-loading {
  cursor: wait;
}

.tag-loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: var(--space-1);
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: tag-spin 0.8s linear infinite;
}

@keyframes tag-spin {
  to { transform: rotate(360deg); }
}
</style>
