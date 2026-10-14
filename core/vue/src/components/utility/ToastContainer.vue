<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      :class="['toast-container', `toast-container--${position}`]"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto toast-item"
        :class="[`toast-${toast.type}`]"
        role="alert"
        :aria-live="(toast.type || 'info') === 'error' ? 'assertive' : 'polite'"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <component :is="getIcon(toast.type || 'info')" class="w-5 h-5" />
          </div>
          <div class="toast-message">{{ toast.message }}</div>
          <button
            v-if="toast.closable"
            @click="remove(toast.id)"
            class="toast-close"
            :aria-label="t('components.utility.toastContainer.close')"
            type="button"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-vue-next';
import { registerToastContainer } from './toast';
import type { ToastType, ToastPosition, ToastOptions } from './toast.types';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface ToastItem extends ToastOptions {
  id: string;
  timer?: ReturnType<typeof setTimeout>;
}

withDefaults(defineProps<{
  position?: ToastPosition;
}>(), {
  position: 'top',
});

const toasts = ref<ToastItem[]>([]);
let seed = 0;

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'error': return XCircle;
    case 'warning': return AlertCircle;
    case 'info': return Info;
    default: return Info;
  }
};

const remove = (id: string | number) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    const toast = toasts.value[index];
    if (toast.timer) clearTimeout(toast.timer);
    toasts.value.splice(index, 1);
  }
};

const add = (options: ToastOptions): string => {
  const id = `toast-${Date.now()}-${seed++}`;
  const duration = options.duration ?? 3000;
  const closable = options.closable ?? true;

  const toast: ToastItem = {
    ...options,
    id,
    closable,
  };

  // 限制最大数量，移除最早的
  if (toasts.value.length >= 5) {
    const oldest = toasts.value[0];
    if (oldest.timer) clearTimeout(oldest.timer);
    toasts.value.shift();
  }

  toasts.value.push(toast);

  // 自动关闭
  if (duration > 0) {
    toast.timer = setTimeout(() => {
      remove(id);
    }, duration);
  }

  return id;
};

const clearAll = () => {
  toasts.value.forEach(t => {
    if (t.timer) clearTimeout(t.timer);
  });
  toasts.value = [];
};

// 注册到全局服务
onMounted(() => {
  registerToastContainer({ add, remove, clearAll });
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 顶部居中 - 默认 */
.toast-container--top {
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.toast-container--top-right {
  top: 80px;
  right: 24px;
  align-items: flex-end;
}

.toast-container--top-left {
  top: 80px;
  left: 24px;
  align-items: flex-start;
}

/* 底部位置 */
.toast-container--bottom {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
  flex-direction: column-reverse;
}

.toast-container--bottom-right {
  bottom: 24px;
  right: 24px;
  align-items: flex-end;
  flex-direction: column-reverse;
}

.toast-container--bottom-left {
  bottom: 24px;
  left: 24px;
  align-items: flex-start;
  flex-direction: column-reverse;
}

.toast-item {
  min-width: 320px;
  max-width: 420px;
  padding: 12px 16px;
  border-radius: 8px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  box-shadow: var(--shadow-sm);
  pointer-events: auto;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-success .toast-icon {
  color: hsl(var(--success));
}

.toast-error .toast-icon {
  color: hsl(var(--error));
}

.toast-warning .toast-icon {
  color: hsl(var(--warning));
}

.toast-info .toast-icon {
  color: hsl(var(--primary));
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: hsl(var(--text));
}

.toast-close {
  flex-shrink: 0;
  padding: 4px;
  border: none;
  background: transparent;
  color: hsl(var(--text-muted));
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text));
}

/* 动画 - 从上方滑入 */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 300ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 顶部居中 - 从上往下 */
.toast-container--top .toast-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.toast-container--top .toast-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* 顶部左右 - 从侧边滑入 */
.toast-container--top-right .toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-container--top-right .toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-container--top-left .toast-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.toast-container--top-left .toast-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* 底部居中 - 从下往上 */
.toast-container--bottom .toast-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.toast-container--bottom .toast-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* 底部左右 - 从侧边滑入 */
.toast-container--bottom-right .toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-container--bottom-right .toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-container--bottom-left .toast-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.toast-container--bottom-left .toast-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.toast-move {
  transition: transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .toast-container {
    gap: 8px;
  }

  .toast-container--top,
  .toast-container--top-right,
  .toast-container--top-left {
    top: 64px;
  }

  .toast-container--top,
  .toast-container--bottom {
    left: 16px;
    right: 16px;
    transform: none;
    align-items: stretch;
  }

  .toast-container--top-right,
  .toast-container--bottom-right {
    right: 16px;
  }

  .toast-container--top-left,
  .toast-container--bottom-left {
    left: 16px;
  }

  .toast-item {
    min-width: auto;
    max-width: 100%;
  }

  .toast-message {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .toast-container--top,
  .toast-container--top-right,
  .toast-container--top-left {
    top: 56px;
  }

  .toast-container--top,
  .toast-container--bottom {
    left: 12px;
    right: 12px;
  }

  .toast-container--top-right,
  .toast-container--bottom-right {
    right: 12px;
  }

  .toast-container--top-left,
  .toast-container--bottom-left {
    left: 12px;
  }
}
</style>
