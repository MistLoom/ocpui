<template>
  <div :class="cardClass" :style="cardStyle" role="article">
    <div v-if="hasHeader" class="card-header" :class="{ 'card-header--bordered': headerBordered }">
      <div class="card-header-content">
        <div v-if="title" class="card-title">{{ title }}</div>
        <div v-if="subtitle" class="card-subtitle">{{ subtitle }}</div>
        <slot name="header" />
        <!-- 遗留 #title 兼容；新代码请用 #header。Card 禁止包裹 Table/DataTable -->
        <slot name="title" />
      </div>
      <div v-if="hasExtra" class="card-extra">
        <slot name="extra" />
      </div>
    </div>
    <div v-if="$slots.cover" class="card-cover">
      <slot name="cover" />
    </div>
    <div class="card-body" :style="bodyStyle">
      <div v-if="loading" class="card-loading-overlay">
        <div class="card-loading-spinner"></div>
      </div>
      <slot />
    </div>
    <div v-if="hasActions" class="card-actions">
      <div
        v-for="(action, index) in normalizedActions"
        :key="index"
        class="card-action"
        @click="handleActionClick(action, index)"
      >
        <component v-if="action.icon" :is="action.icon" class="card-action-icon" />
        <span class="card-action-text">{{ action.label }}</span>
      </div>
      <slot name="actions" />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { CardSize, CardShadow, CardAction } from '@ocpui/vue/types';

interface Props {
  title?: string;
  subtitle?: string;
  size?: CardSize;
  shadow?: CardShadow;
  bordered?: boolean;
  headerBordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  disHover?: boolean;
  actions?: (CardAction | string)[];
  bodyStyle?: Record<string, string>;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  size: 'md',
  shadow: 'hover',
  bordered: true,
  headerBordered: false,
  hoverable: false,
  loading: false,
  disHover: false,
  actions: () => [],
  bodyStyle: undefined,
  customClass: '',
});

const emit = defineEmits<{
  'action-click': [action: CardAction, index: number];
}>();

const slots = useSlots();

const hasHeader = computed(() => {
  return Boolean(props.title || props.subtitle || slots.header || slots.title);
});

const hasExtra = computed(() => {
  return slots.extra;
});

const hasActions = computed(() => {
  return props.actions.length > 0 || slots.actions;
});

const normalizedActions = computed(() => {
  return props.actions.map(action => {
    if (typeof action === 'string') {
      return { label: action };
    }
    return action;
  });
});

const cardClass = computed(() => {
  const classes = ['card', `card--${props.size}`];
  if (props.bordered) {
    classes.push('card--bordered');
  }
  if (props.shadow === 'always') {
    classes.push('card--shadow-always');
  } else if (props.shadow === 'hover') {
    classes.push('card--shadow-hover');
  }
  if (props.hoverable && !props.disHover) {
    classes.push('card--hoverable');
  }
  if (props.loading) {
    classes.push('card--loading');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const cardStyle = computed(() => {
  const style: Record<string, string> = {};
  return style;
});

const handleActionClick = (action: CardAction, index: number) => {
  if (action.handler) {
    action.handler();
  }
  emit('action-click', action, index);
};
</script>

<style scoped>
.card {
  position: relative;
  background: hsl(var(--surface));
  border-radius: var(--radius-md-lg);
  font-family: var(--font-sans);
  transition:
    background-color var(--transition-slow) var(--ease-out),
    border-color var(--transition-slow) var(--ease-out),
    box-shadow var(--transition-slow) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
  overflow: hidden;
}

.card::before {
  content: none;
}

.card--bordered {
  border: 1px solid hsl(var(--border));
}

.card--shadow-always {
  box-shadow: var(--shadow-sm);
}

.card--shadow-hover:hover {
  box-shadow: var(--shadow-md);
}

.card--hoverable {
  cursor: pointer;
}

.card--hoverable:hover {
  border-color: hsl(var(--border-hover));
  background: hsl(var(--surface-hover));
}

.card--hoverable:active {
  transform: scale(0.96);
}

.card--loading {
  pointer-events: none;
  opacity: 0.7;
}

.card-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsl(var(--surface) / 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md-lg);
  z-index: 10;
}

.card-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid hsl(var(--border));
  border-top: 3px solid hsl(var(--primary));
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  transition: background var(--transition-fast) var(--ease-out);
}

.card-header--bordered {
  border-bottom: 1px solid hsl(var(--border));
}

.card-header-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: hsl(var(--text));
  line-height: 1.4;
  transition: color var(--transition-fast) var(--ease-out);
}

.card--hoverable:hover .card-title {
  color: hsl(var(--primary));
}

.card-subtitle {
  margin-top: var(--space-1);
  font-size: var(--font-size-sm);
  color: hsl(var(--text-muted));
  line-height: 1.4;
}

.card-extra {
  flex-shrink: 0;
  margin-left: var(--space-4);
}

.card-cover {
  position: relative;
  overflow: hidden;
}

.card-cover :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform var(--transition-slow) var(--ease-out);
}

.card--hoverable:hover .card-cover :deep(img) {
  transform: scale(1.05);
}

.card-cover + .card-body {
  padding-top: var(--space-3);
}

.card-body {
  padding: var(--space-5);
  font-size: var(--font-size-sm);
  color: hsl(var(--text));
  line-height: 1.6;
}

.card-actions {
  display: flex;
  border-top: 1px solid hsl(var(--border));
}

.card-action {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition:
    color var(--transition-normal) var(--ease-out),
    background-color var(--transition-normal) var(--ease-out);
}

.card-action:hover {
  color: hsl(var(--primary));
  background: hsl(var(--surface-hover));
}

.card-action:not(:last-child) {
  border-right: 1px solid hsl(var(--border));
}

.card-action-icon {
  width: 18px;
  height: 18px;
  margin-bottom: var(--space-1);
  transition: transform var(--transition-normal) var(--ease-out);
}

.card-action:hover .card-action-icon {
  transform: scale(1.1);
}

.card-action-text {
  font-weight: 500;
}

.card-footer {
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid hsl(var(--border));
  /* 继承 Card 容器表面，避免与主体背景割裂 */
  background: transparent;
}

.card--sm .card-header {
  padding: var(--space-3) var(--space-4);
}

.card--sm .card-title {
  font-size: var(--font-size-sm);
}

.card--sm .card-subtitle {
  font-size: var(--font-size-xs);
}

.card--sm .card-body {
  padding: var(--space-4);
  font-size: var(--font-size-sm);
}

.card--lg .card-header {
  padding: var(--space-5) var(--space-6);
}

.card--lg .card-title {
  font-size: var(--font-size-lg);
}

.card--lg .card-subtitle {
  font-size: var(--font-size-md);
}

.card--lg .card-body {
  padding: var(--space-6);
  font-size: var(--font-size-md);
}

@media (max-width: 639.98px) {
  .card {
    border-radius: var(--radius-md-md);
  }
  
  .card-header {
    padding: var(--space-3) var(--space-4);
  }
  
  .card-title {
    font-size: var(--font-size-sm);
  }
  
  .card-subtitle {
    font-size: var(--font-size-xs);
    margin-top: var(--space-1);
  }
  
  .card-extra {
    margin-left: var(--space-3);
  }
  
  .card-body {
    padding: var(--space-3) var(--page-inline-xs);
    font-size: var(--font-size-sm);
    line-height: 1.55;
  }

  .card-cover + .card-body {
    padding-top: var(--space-2);
  }
  
  .card-action {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-xs);
  }
  
  .card-action-icon {
    width: 16px;
    height: 16px;
    margin-bottom: var(--space-1);
  }
  
  .card-footer {
    padding: var(--space-2) var(--space-4);
  }
  
  .card--sm .card-header {
    padding: var(--space-2) var(--space-3);
  }
  
  .card--sm .card-body {
    padding: var(--space-3);
    font-size: var(--font-size-xs);
  }
  
  .card--lg .card-header {
    padding: var(--space-4) var(--space-5);
  }
  
  .card--lg .card-title {
    font-size: var(--font-size-md);
  }
  
  .card--lg .card-body {
    padding: var(--space-5);
    font-size: var(--font-size-sm);
  }
  
  .card--hoverable:hover {
    border-color: hsl(var(--border-hover));
    background: hsl(var(--surface-hover));
  }
}
</style>
