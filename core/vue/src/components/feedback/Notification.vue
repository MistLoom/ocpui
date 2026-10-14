&lt;!--
Notification 通知组件

属性：
- type: 通知类型，可选值：info, success, warning, error，默认值：info
- title: 通知标题，默认值：''
- message: 通知消息，默认值：''
- duration: 持续时间（毫秒），默认值：4500
- closable: 是否可关闭，默认值：true
- onClose: 关闭回调函数，可选
- customClass: 自定义类名，默认值：''
- position: 位置，可选值：top, bottom, top-left, top-right, bottom-left, bottom-right，默认值：top-right
- zIndex: 层级，默认值：2000

事件：
- close: 关闭时触发

使用方式：
&lt;Notification
  type="success"
  title="成功"
  message="操作成功"
  :duration="3000"
  :closable="true"
  @close="handleClose"
/&gt;
--&gt;
<template>
  <Teleport to="body">
    <Transition name="notification">
      <div 
        v-if="visible" 
        :class="notificationClass" 
        @mouseenter="clearTimer"
        @mouseleave="startTimer"
      >
        <div v-if="type" class="notification-icon">
          <Icon :name="getIconName()" :size="20" />
        </div>
        <div class="notification-content">
          <div v-if="title" class="notification-title">{{ title }}</div>
          <div class="notification-message">
            <slot>{{ message }}</slot>
          </div>
        </div>
        <button v-if="closable" type="button" class="notification-close" @click="handleClose" :aria-label="t('components.feedback.notification.close')">
          <Icon name="close" :size="14" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '../utility';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

type NotificationType = 'info' | 'success' | 'warning' | 'error';
type NotificationPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface Props {
  type?: NotificationType;
  title?: string;
  message?: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  customClass?: string;
  position?: NotificationPosition;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: '',
  message: '',
  duration: 4500,
  closable: true,
  onClose: undefined,
  customClass: '',
  position: 'top-right',
});

const emit = defineEmits<{
  'close': [];
  'destroy': [];
}>();

const visible = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const notificationClass = computed(() => {
  const classes = ['notification', `notification--${props.type}`, `notification--${props.position}`];
  if (props.closable) {
    classes.push('notification--closable');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const getIconName = () => {
  const iconMap: Record<NotificationType, string> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
  };
  return iconMap[props.type];
};

const handleClose = () => {
  clearTimer();
  visible.value = false;
  emit('close');
  if (props.onClose) {
    props.onClose();
  }
};

const startTimer = () => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      handleClose();
    }, props.duration);
  }
};

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

onMounted(() => {
  visible.value = true;
  startTimer();
});

onUnmounted(() => {
  clearTimer();
});

defineExpose({
  close: handleClose,
  visible,
});
</script>

<style scoped>
.notification {
  position: fixed;
  z-index: var(--z-toast);
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 360px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.notification--top {
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
}

.notification--bottom {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
}

.notification--top-left {
  top: 24px;
  left: 24px;
}

.notification--top-right {
  top: 24px;
  right: 24px;
}

.notification--bottom-left {
  bottom: 24px;
  left: 24px;
}

.notification--bottom-right {
  bottom: 24px;
  right: 24px;
}

.notification--info {
  border-left: 4px solid hsl(var(--primary));
}

.notification--success {
  border-left: 4px solid hsl(var(--success));
}

.notification--warning {
  border-left: 4px solid hsl(var(--warning));
}

.notification--error {
  border-left: 4px solid hsl(var(--error));
}

.notification-icon {
  flex-shrink: 0;
  margin-right: 12px;
  margin-top: 2px;
}

.notification--info .notification-icon {
  color: hsl(var(--primary));
}

.notification--success .notification-icon {
  color: hsl(var(--success));
}

.notification--warning .notification-icon {
  color: hsl(var(--warning));
}

.notification--error .notification-icon {
  color: hsl(var(--error));
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--text));
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  color: hsl(var(--text-muted));
  line-height: 1.5;
}

.notification-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  margin-left: 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.notification-close:hover {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
}

.notification--closable {
  padding-right: 12px;
}

/* 过渡动画 */
.notification-enter-active,
.notification-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .notification {
    padding: 12px;
    border-radius: 8px;
    max-width: calc(100vw - 48px);
  }
  
  .notification--top,
  .notification--bottom {
    left: 24px;
    right: 24px;
    transform: none;
  }
  
  .notification--top-left,
  .notification--top-right {
    top: 16px;
    left: 16px;
    right: 16px;
  }
  
  .notification--bottom-left,
  .notification--bottom-right {
    bottom: 16px;
    left: 16px;
    right: 16px;
  }
  
  .notification-icon {
    margin-right: 10px;
    margin-top: 1px;
  }
  
  .notification-title {
    font-size: 14px;
    margin-bottom: 3px;
  }
  
  .notification-message {
    font-size: 13px;
  }
  
  .notification-close {
    width: 20px;
    height: 20px;
    margin-left: 10px;
  }
  
  .notification--closable {
    padding-right: 8px;
  }
}
</style>
