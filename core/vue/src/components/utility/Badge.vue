&lt;!--
Badge 组件

公开属性：
- variant: string - 徽章样式变体 ('primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default')
- size: string - 徽章尺寸 ('sm' | 'md' | 'lg')
- round: boolean - 是否为圆形徽章
- customClass: string - 自定义类名
- disabled: boolean - 是否禁用状态
- bgColor: string - 自定义背景色
- textColor: string - 自定义文本颜色

使用方式：
&lt;template&gt;
  &lt;!-- 基本用法 --&gt;
  &lt;Badge&gt;New&lt;/Badge&gt;
  
  &lt;!-- 不同变体 --&gt;
  &lt;Badge variant="success"&gt;Success&lt;/Badge&gt;
  &lt;Badge variant="warning"&gt;Warning&lt;/Badge&gt;
  &lt;Badge variant="error"&gt;Error&lt;/Badge&gt;
  
  &lt;!-- 不同尺寸 --&gt;
  &lt;Badge size="sm"&gt;Small&lt;/Badge&gt;
  &lt;Badge size="lg"&gt;Large&lt;/Badge&gt;
  
  &lt;!-- 圆形徽章 --&gt;
  &lt;Badge round&gt;1&lt;/Badge&gt;
  
  &lt;!-- 禁用状态 --&gt;
  &lt;Badge disabled&gt;Disabled&lt;/Badge&gt;
  
  &lt;!-- 自定义颜色 --&gt;
  &lt;Badge bgColor="#ff6b6b" textColor="white"&gt;Custom&lt;/Badge&gt;
&lt;/template&gt;
--&gt;

<template>
  <span
    :class="badgeClass"
    :style="badgeStyle"
    v-bind="$attrs"
  >
    <slot v-if="!dot" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  round?: boolean;
  customClass?: string;
  disabled?: boolean;
  bgColor?: string;
  textColor?: string;
  dot?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  round: false,
  customClass: '',
  disabled: false,
  bgColor: undefined,
  textColor: undefined,
  dot: false,
});

const badgeClass = computed(() => {
  const classes: string[] = ['badge'];
  
  classes.push(`badge-${props.variant}`);
  classes.push(`badge-${props.size}`);
  
  if (props.round) {
    classes.push('badge-round');
  }
  
  if (props.disabled) {
    classes.push('badge-disabled');
  }
  
  if (props.dot) {
    classes.push('badge-dot');
  }
  
  if (props.customClass) {
    classes.push(props.customClass);
  }
  
  return classes;
});

const badgeStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.bgColor) {
    style.backgroundColor = props.bgColor;
  }
  
  if (props.textColor) {
    style.color = props.textColor;
  }
  
  return style;
});
</script>

<style scoped>
.badge {
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
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  user-select: none;
}

.badge-primary {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.badge-secondary {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text-secondary));
}

.badge-success {
  background: hsl(var(--success) / 0.1);
  color: hsl(var(--success));
}

.badge-warning {
  background: hsl(var(--warning) / 0.1);
  color: hsl(var(--warning));
}

.badge-error {
  background: hsl(var(--error) / 0.1);
  color: hsl(var(--error));
}

.badge-info {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.badge-default {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text-secondary));
}

.badge-sm {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 8px;
}

.badge-lg {
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 16px;
}

.badge-round {
  border-radius: 9999px;
}

.badge-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.badge-dot {
  padding: 0;
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
  background: hsl(var(--primary));
  color: hsl(var(--primary));
}
</style>
