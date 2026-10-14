&lt;!--
Message 消息组件

属性：
- type: 消息类型，可选值：success, error, warning, info，默认值：info
- content: 消息内容，默认值：''
- duration: 持续时间（毫秒），默认值：3000
- closable: 是否可关闭，默认值：false
- onClose: 关闭回调函数，可选
- id: 消息 ID，可选
- position: 位置，可选值：top, bottom, top-left, top-right, bottom-left, bottom-right，默认值：top

事件：
- close: 关闭时触发
- destroy: 销毁时触发

使用方式：
&lt;Message
  type="success"
  content="操作成功"
  :duration="3000"
  :closable="true"
  @close="handleClose"
/&gt;
--&gt;
<template>
  <Teleport to="body">
    <Transition name="message" @after-leave="handleAfterLeave">
      <div
        v-if="visible"
        :class="messageClass"
        role="alert"
        :aria-live="type === 'error' ? 'assertive' : 'polite'"
        @mouseenter="clearTimer"
        @mouseleave="startTimer"
      >
        <div class="message-icon">
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
        <div class="message-content">{{ content }}</div>
        <button 
          v-if="closable" 
          class="message-close" 
          @click.stop="handleClose"
          type="button"
          :aria-label="t('components.feedback.message.close')"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

type MessageType = 'success' | 'error' | 'warning' | 'info';

type MessagePosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface Props {
  type?: MessageType;
  content?: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  id?: string | number;
  position?: MessagePosition;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  content: '',
  duration: 3000,
  closable: false,
  onClose: undefined,
  id: undefined,
  position: 'top',
});

const emit = defineEmits<{
  close: [];
  destroy: [];
}>();

const visible = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;
let destroyTimer: ReturnType<typeof setTimeout> | null = null;

const messageClass = computed(() => {
  return ['message-container', `message-${props.type}`, `message-${props.position}`];
});

const handleClose = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  visible.value = false;
};

const handleAfterLeave = () => {
  emit('destroy');
  props.onClose?.();
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
  if (destroyTimer) {
    clearTimeout(destroyTimer);
  }
});

defineExpose({
  close: handleClose,
  visible,
});
</script>

<style scoped>
.message-container {
  position: fixed;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: calc(100vw - 48px);
}

.message-top {
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
}

.message-bottom {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
}

.message-top-left {
  top: 24px;
  left: 24px;
  transform: none;
}

.message-top-right {
  top: 24px;
  right: 24px;
  transform: none;
}

.message-bottom-left {
  bottom: 24px;
  left: 24px;
  transform: none;
}

.message-bottom-right {
  bottom: 24px;
  right: 24px;
  transform: none;
}

.message-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.message-icon svg {
  width: 20px;
  height: 20px;
}

.message-success .message-icon {
  color: hsl(var(--success));
}

.message-error .message-icon {
  color: hsl(var(--error));
}

.message-warning .message-icon {
  color: hsl(var(--warning));
}

.message-info .message-icon {
  color: hsl(var(--primary));
}

.message-content {
  font-size: 14px;
  color: hsl(var(--text));
  line-height: 1.5;
  flex: 1;
  min-width: 0;
}

.message-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color 0.2s, color 0.2s;
  flex-shrink: 0;
}

.message-close:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-container-high));
}

.message-close:focus-visible {
  
  outline-offset: 2px;
}

.message-close svg {
  width: 12px;
  height: 12px;
}

.message-enter-active {
  transition: opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.message-leave-active {
  transition: opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.message-top.message-enter-from,
.message-top-left.message-enter-from,
.message-top-right.message-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.message-bottom.message-enter-from,
.message-bottom-left.message-enter-from,
.message-bottom-right.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-top.message-leave-to,
.message-top-left.message-leave-to,
.message-top-right.message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.message-bottom.message-leave-to,
.message-bottom-left.message-leave-to,
.message-bottom-right.message-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .message-container {
    top: 16px;
    padding: 10px 16px;
    gap: 8px;
    border-radius: 8px;
  }
  
  .message-icon {
    width: 18px;
    height: 18px;
  }
  
  .message-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .message-content {
    font-size: 13px;
  }
  
  .message-close {
    width: 18px;
    height: 18px;
  }
  
  .message-close svg {
    width: 10px;
    height: 10px;
  }
}
</style>
