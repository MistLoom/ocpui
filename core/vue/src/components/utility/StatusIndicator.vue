&lt;!--
StatusIndicator 组件

功能：状态指示器组件，用于显示各种状态

属性：
- status: 状态类型，可选值：active, warning, error, info, connecting, disconnected，默认值：active
- showDot: 是否显示状态点，默认值：true
- text: 自定义文本
- size: 尺寸，可选值：xs, sm, md, lg，默认值：md
- color: 自定义颜色
- customClass: 自定义类名
- ariaLabel: 无障碍标签

使用方式：
&lt;StatusIndicator status="active" text="在线" /&gt;
&lt;StatusIndicator status="warning" showDot size="sm" /&gt;
&lt;StatusIndicator status="error" text="失败" color="#ff4757" /&gt;
--&gt;

<template>
  <span 
    :class="statusClass" 
    :style="statusStyle"
    role="status"
    :aria-label="ariaLabel || displayText"
  >
    <span v-if="showDot" :class="dotClass" :style="dotStyle"></span>
    <slot>{{ displayText }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  status?: 'active' | 'warning' | 'error' | 'info' | 'connecting' | 'disconnected' | string;
  showDot?: boolean;
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  customClass?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'active',
  showDot: true,
  text: '',
  size: 'md',
  color: '',
  customClass: '',
  ariaLabel: '',
});

const statusMap: Record<string, { text: string; color: string }> = {
  active: { text: '正常', color: 'active' },
  connected: { text: '已连接', color: 'active' },
  warning: { text: '警告', color: 'warning' },
  connecting: { text: '连接中', color: 'warning' },
  error: { text: '错误', color: 'error' },
  disconnected: { text: '未连接', color: 'info' },
  info: { text: '信息', color: 'info' },
  success: { text: '成功', color: 'active' },
  loading: { text: '加载中', color: 'warning' },
  idle: { text: '空闲', color: 'info' },
};

const displayText = computed(() => {
  if (props.text) return props.text;
  return statusMap[String(props.status)]?.text || '未知';
});

const mappedStatus = computed(() => {
  return statusMap[String(props.status)]?.color || props.status;
});

const statusClass = computed(() => {
  const classes = ['status-indicator', `status-${mappedStatus.value}`, `size-${props.size}`];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  if (props.status === 'connecting' || props.status === 'loading') {
    classes.push('status-indicator--pulse');
  }
  return classes;
});

const dotClass = computed(() => {
  const classes = ['status-dot'];
  if (props.status === 'connecting' || props.status === 'loading') {
    classes.push('status-dot--pulse');
  }
  return classes;
});

const statusStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.color) {
    style.backgroundColor = `${props.color}10`;
    style.color = props.color;
    style.borderColor = `${props.color}30`;
  }
  return style;
});

const dotStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.color) {
    style.backgroundColor = props.color;
  }
  return style;
});
</script>

<style scoped>
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  border: 1px solid transparent;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  flex-shrink: 0;
}

.status-active {
  background: hsl(var(--success) / 0.1);
  color: hsl(var(--success));
  border-color: hsl(var(--success) / 0.3);
}

.status-active .status-dot {
  background: hsl(var(--success));
}

.status-warning {
  background: hsl(var(--warning) / 0.1);
  color: hsl(var(--warning));
  border-color: hsl(var(--warning) / 0.3);
}

.status-warning .status-dot {
  background: hsl(var(--warning));
}

.status-error {
  background: hsl(var(--error) / 0.1);
  color: hsl(var(--error));
  border-color: hsl(var(--error) / 0.3);
}

.status-error .status-dot {
  background: hsl(var(--error));
}

.status-info {
  background: hsl(var(--info) / 0.1);
  color: hsl(var(--info));
  border-color: hsl(var(--info) / 0.3);
}

.status-info .status-dot {
  background: hsl(var(--info));
}

.status-dot--pulse {
  animation: status-pulse 1.5s ease-in-out infinite;
}

.status-indicator--pulse {
  animation: status-indicator-pulse 2s ease-in-out infinite;
}

@keyframes status-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

@keyframes status-indicator-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 尺寸变体 */
.size-xs {
  padding: 1px 6px;
  font-size: 10px;
  border-radius: 8px;
  gap: 4px;
}

.size-xs .status-dot {
  width: 4px;
  height: 4px;
}

.size-sm {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 10px;
  gap: 5px;
}

.size-sm .status-dot {
  width: 6px;
  height: 6px;
}

.size-md {
  padding: 4px 12px;
  font-size: 0.875rem;
  border-radius: 12px;
  gap: 6px;
}

.size-md .status-dot {
  width: 8px;
  height: 8px;
}

.size-lg {
  padding: 6px 16px;
  font-size: 1rem;
  border-radius: 14px;
  gap: 8px;
}

.size-lg .status-dot {
  width: 10px;
  height: 10px;
}

/* 响应式样式 */
@media (max-width: 639.98px) {
  .status-indicator {
    padding: 3px 10px;
    font-size: 0.75rem;
  }
  
  .status-dot {
    width: 6px;
    height: 6px;
  }
}

/* 悬停效果 */
.status-indicator:hover {
  opacity: 0.9;
}
</style>