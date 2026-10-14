<template>
  <div class="card-header" :class="headerClass">
    <div class="card-header-left">
      <div v-if="icon" class="card-header-icon-wrapper" :class="iconVariantClass">
        <Icon :name="icon" :size="iconSize" class="card-header-icon" />
      </div>
      <div class="card-header-text">
        <div v-if="title" class="card-header-title">{{ title }}</div>
        <div v-if="subtitle" class="card-header-subtitle">{{ subtitle }}</div>
        <slot name="title" />
      </div>
    </div>
    <div class="card-header-right">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '../utility';

interface Props {
  title?: string;
  subtitle?: string;
  icon?: string;
  iconSize?: number;
  iconVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  icon: '',
  iconSize: 18,
  iconVariant: 'default',
  size: 'md',
  bordered: false,
});

const headerClass = computed(() => {
  const classes = ['card-header', `card-header--${props.size}`];
  if (props.bordered) {
    classes.push('card-header--bordered');
  }
  if (props.icon) {
    classes.push('card-header--with-icon');
  }
  return classes;
});

const iconVariantClass = computed(() => {
  return `card-header-icon--${props.iconVariant}`;
});
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.card-header--bordered {
  border-bottom: 1px solid hsl(var(--border));
}

.card-header--with-icon {
  gap: 16px;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.card-header-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.card-header-icon--default {
  background: linear-gradient(135deg, hsl(var(--surface-container-high) / 0.5), hsl(var(--surface-container-high) / 0.3));
}

.card-header-icon--primary {
  background: linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--text-secondary) / 0.1));
}

.card-header-icon--success {
  background: linear-gradient(135deg, hsl(var(--success) / 0.15), hsl(var(--success) / 0.1));
}

.card-header-icon--warning {
  background: linear-gradient(135deg, hsl(var(--warning) / 0.15), hsl(var(--warning) / 0.1));
}

.card-header-icon--error {
  background: linear-gradient(135deg, hsl(var(--error) / 0.15), hsl(var(--error) / 0.1));
}

.card-header-icon {
  color: hsl(var(--text));
  transition: color var(--transition-fast) var(--ease-out);
}

.card-header-icon--primary .card-header-icon {
  color: hsl(var(--primary));
}

.card-header-icon--success .card-header-icon {
  color: hsl(var(--success));
}

.card-header-icon--warning .card-header-icon {
  color: hsl(var(--warning));
}

.card-header-icon--error .card-header-icon {
  color: hsl(var(--error));
}

.card-header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.card-header-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: hsl(var(--text));
  line-height: 1.4;
  transition: color var(--transition-fast) var(--ease-out);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-header-subtitle {
  font-size: var(--font-size-sm);
  color: hsl(var(--text-muted));
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 尺寸变体 */
.card-header--sm {
  padding: var(--space-3) var(--space-4);
}

.card-header--sm .card-header-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.card-header--sm .card-header-title {
  font-size: var(--font-size-sm);
}

.card-header--sm .card-header-subtitle {
  font-size: var(--font-size-xs);
}

.card-header--lg {
  padding: var(--space-5) var(--space-6);
}

.card-header--lg .card-header-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.card-header--lg .card-header-title {
  font-size: var(--font-size-lg);
}

.card-header--lg .card-header-subtitle {
  font-size: var(--font-size-md);
}

/* 响应式 */
@media (max-width: 639.98px) {
  .card-header {
    padding: var(--space-3) var(--space-4);
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .card-header-left {
    width: 100%;
  }
  
  .card-header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .card-header-title {
    font-size: var(--font-size-sm);
  }
  
  .card-header-subtitle {
    font-size: var(--font-size-xs);
  }
  
  .card-header-icon-wrapper {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
}
</style>