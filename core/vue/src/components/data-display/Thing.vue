<template>
  <div :class="thingClass">
    <div class="thing-avatar">
      <img v-if="avatar" :src="avatar" :alt="title" />
      <div v-else class="thing-avatar-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
    </div>
    <div class="thing-content">
      <div class="thing-header">
        <h3 class="thing-title">{{ title }}</h3>
        <span v-if="subtitle" class="thing-subtitle">{{ subtitle }}</span>
      </div>
      <p v-if="description" class="thing-description">{{ description }}</p>
      <div v-if="$slots.default" class="thing-extra">
        <slot />
      </div>
      <div v-if="actions && actions.length > 0" class="thing-actions">
        <button
          v-for="(action, index) in actions"
          :key="index"
          type="button"
          class="thing-action"
          :class="`thing-action--${action.type || 'default'}`"
          @click="handleAction(action)"
        >
          <component v-if="action.icon" :is="action.icon" />
          <span>{{ action.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ThingAction {
  label: string;
  type?: 'default' | 'primary' | 'danger';
  icon?: any;
  handler?: () => void;
}

interface Props {
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  actions?: ThingAction[];
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  description: '',
  avatar: '',
  actions: () => [],
  customClass: '',
});

const emit = defineEmits<{
  action: [action: ThingAction];
}>();

const thingClass = computed(() => {
  const classes = ['thing'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const handleAction = (action: ThingAction) => {
  if (action.handler) {
    action.handler();
  }
  emit('action', action);
};
</script>

<style scoped>
.thing {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.thing:hover {
  border-color: hsl(var(--border-hover));
  box-shadow: var(--shadow-sm);
}

.thing-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: hsl(var(--surface-container-high));
}

.thing-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thing-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--text-muted));
}

.thing-avatar-placeholder svg {
  width: 24px;
  height: 24px;
}

.thing-content {
  flex: 1;
  min-width: 0;
}

.thing-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.thing-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--text));
}

.thing-subtitle {
  font-size: 13px;
  color: hsl(var(--text-muted));
}

.thing-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: hsl(var(--text-secondary));
}

.thing-extra {
  margin-bottom: 12px;
}

.thing-actions {
  display: flex;
  gap: 8px;
}

.thing-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  font-size: 13px;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.thing-action:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.thing-action--primary {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.thing-action--primary:hover {
  background: hsl(var(--primary) / 0.9);
  border-color: hsl(var(--primary) / 0.9);
  color: hsl(var(--primary-foreground));
}

.thing-action--danger {
  border-color: hsl(var(--error));
  color: hsl(var(--error));
}

.thing-action--danger:hover {
  background: hsl(var(--error) / 0.1);
}
</style>
