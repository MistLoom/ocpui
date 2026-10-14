<!--
Alert 警告组件

属性：
- type: 警告类型，可选值：success, error, warning, info，默认值：info
- title: 警告标题，默认值：''
- message: 警告消息，默认值：''
- closable: 是否可关闭，默认值：false
- showIcon: 是否显示图标，默认值：true
- customClass: 自定义类名，默认值：''
- visible: 是否显示，默认值：true
- banner: 是否为横幅模式，默认值：false

事件：
- close: 关闭时触发
- update: 更新可见状态时触发，参数为新的可见状态

插槽：
- action: 操作按钮区域（banner模式下不支持）

使用方式：
<Alert
  type="success"
  title="成功提示"
  message="操作成功"
  :closable="true"
  v-model:visible="showAlert"
  @close="handleClose"
>
  <template #action>
    <Button size="sm">{{ t('components.feedback.alert.viewDetails') }}</Button>
  </template>
</Alert>

<Alert
  type="warning"
  banner
>
  系统维护中，请稍后再试
</Alert>
-->
<template>
  <Transition name="alert">
    <div v-if="props.visible" :class="alertClass" role="alert">
      <div v-if="showIcon && !banner" class="alert-icon">
        <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>
      <div class="alert-content">
        <div v-if="title && !banner" class="alert-title">{{ title }}</div>
        <div class="alert-message">
          <slot>{{ message }}</slot>
        </div>
      </div>
      <div v-if="$slots.action && !banner" class="alert-action">
        <slot name="action" />
      </div>
      <button v-if="closable && !banner" class="alert-close" @click="handleClose">
        <svg viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  closable?: boolean;
  showIcon?: boolean;
  customClass?: string;
  visible?: boolean;
  banner?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: '',
  message: '',
  closable: false,
  showIcon: true,
  customClass: '',
  visible: true,
  banner: false,
});

const emit = defineEmits<{
  close: [];
  update: [value: boolean];
}>();

const alertClass = computed(() => {
  const classes = ['alert', `alert-${props.type}`];
  if (props.banner) {
    classes.push('alert--banner');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const handleClose = () => {
  emit('update', false);
  emit('close');
};
</script>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.alert--banner {
  border-radius: 0;
  border-left: none;
  border-right: none;
}

.alert-success {
  background: hsl(var(--success) / 0.1);
  border-color: hsl(var(--success) / 0.3);
}

.alert-success .alert-icon {
  color: hsl(var(--success));
}

.alert-error {
  background: hsl(var(--error) / 0.1);
  border-color: hsl(var(--error) / 0.3);
}

.alert-error .alert-icon {
  color: hsl(var(--error));
}

.alert-warning {
  background: hsl(var(--warning) / 0.1);
  border-color: hsl(var(--warning) / 0.3);
}

.alert-warning .alert-icon {
  color: hsl(var(--warning));
}

.alert-info {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.3);
}

.alert-info .alert-icon {
  color: hsl(var(--primary));
}

.alert-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-icon svg {
  width: 20px;
  height: 20px;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text));
  margin-bottom: 4px;
}

.alert-message {
  font-size: 14px;
  color: hsl(var(--text-secondary));
  line-height: 1.5;
}

.alert-action {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.alert-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: color 0.2s;
  flex-shrink: 0;
}

.alert-close:hover {
  color: hsl(var(--text));
}

.alert-close svg {
  width: 12px;
  height: 12px;
}

.alert-enter-active,
.alert-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.alert-enter-from,
.alert-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .alert {
    padding: 12px 16px;
    gap: 10px;
    border-radius: 10px;
  }

  .alert--banner {
    border-radius: 0;
  }

  .alert-icon {
    width: 18px;
    height: 18px;
    margin-top: 1px;
  }

  .alert-icon svg {
    width: 18px;
    height: 18px;
  }

  .alert-title {
    font-size: 13px;
    margin-bottom: 3px;
  }

  .alert-message {
    font-size: var(--font-size-sm);
    line-height: 1.4;
  }

  .alert-close svg {
    width: 10px;
    height: 10px;
  }

  .alert-action {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
}
</style>
