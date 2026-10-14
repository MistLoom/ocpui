<template>
  <span
    :class="badgeClass"
    :style="badgeStyle"
    v-bind="$attrs"
  >
    <slot>{{ method }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  size?: 'sm' | 'md' | 'lg';
  round?: boolean;
  disabled?: boolean;
  border?: boolean;
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  method: 'GET',
  size: 'md',
  round: false,
  disabled: false,
  border: false,
  customClass: '',
});

const badgeClass = computed(() => {
  const classes: string[] = ['http-method-badge'];
  
  classes.push(`http-method-badge-${props.method.toLowerCase()}`);
  classes.push(`http-method-badge-${props.size}`);
  
  if (props.round) {
    classes.push('http-method-badge-round');
  }
  
  if (props.disabled) {
    classes.push('http-method-badge-disabled');
  }
  
  if (props.border) {
    classes.push('http-method-badge-border');
  }
  
  if (props.customClass) {
    classes.push(props.customClass);
  }
  
  return classes.join(' ');
});

const badgeStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.bgColor) {
    style.backgroundColor = props.bgColor;
  }
  
  if (props.textColor) {
    style.color = props.textColor;
  }
  
  if (props.border && props.borderColor) {
    style.borderColor = props.borderColor;
  }
  
  return style;
});
</script>

<style scoped>
.http-method-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0.03em;
  border-radius: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
  user-select: none;
  text-transform: uppercase;
  border: 1px solid transparent;
}

.http-method-badge-get {
  background: hsl(var(--success) / 0.1);
  color: hsl(var(--success));
}

.http-method-badge-post {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.http-method-badge-put {
  background: hsl(var(--warning) / 0.1);
  color: hsl(var(--warning));
}

.http-method-badge-delete {
  background: hsl(var(--error) / 0.1);
  color: hsl(var(--error));
}

.http-method-badge-patch {
  background: hsl(var(--info) / 0.1);
  color: hsl(var(--info));
}

.http-method-badge-head {
  background: hsl(195 100% 40% / 0.1);
  color: hsl(195 100% 40%);
}

.http-method-badge-options {
  background: hsl(60 100% 50% / 0.1);
  color: hsl(60 100% 50%);
}

.http-method-badge-sm {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 8px;
}

.http-method-badge-lg {
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 16px;
}

.http-method-badge-round {
  border-radius: 9999px;
}

.http-method-badge-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.http-method-badge-border {
  border: 1px solid currentColor;
}

.http-method-badge:not(.http-method-badge-disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px hsl(var(--shadow) / 0.1);
}

@media (max-width: 768px) {
  .http-method-badge {
    padding: 3px 10px;
    font-size: 11px;
  }
  
  .http-method-badge-sm {
    padding: 2px 6px;
    font-size: 10px;
  }
  
  .http-method-badge-lg {
    padding: 5px 14px;
    font-size: 13px;
  }
}
</style>
