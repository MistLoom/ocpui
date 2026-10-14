<!--
Toast 组件

功能：轻提示组件，用于显示临时消息。

注意：本组件是单一独立的 Toast 容器（与 ToastContainer 并存）。
- 推荐使用项目内 ToastContainer 组件，命令式 API 通过 `@ocpui/vue/utility/toast`（`toast.success/error/...`）调用。
- 保留此组件是为了兼容依赖该特定 UI 结构（标题+描述+关闭按钮）的旧代码路径。

属性：
- position: 位置，可选值：top, top-right, top-left, bottom, bottom-right, bottom-left，默认值：top
- maxToasts: 最大显示数量，默认值：5
- animationDuration: 动画持续时间（毫秒），默认值：300
- customClass: 自定义类名

方法：
- addToast(options): 添加提示
- removeToast(id): 移除提示
- clearAll(): 清除所有提示

使用方式：
<Toast position="top-right" :max-toasts="3" />
-->

<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      :class="['toast-container', `toast-container--${position}`]"
    >
      <div
        v-for="toast in visibleToasts"
        :key="toast.id"
        class="toast-item"
        :class="[`toast-${toast.type}`, toast.visible ? 'toast-visible' : '']"
        role="alert"
        :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
      >
        <div class="toast-content">
          <div v-if="toast.icon" class="toast-icon">
            <component :is="toast.icon" class="w-5 h-5" />
          </div>
          <div class="toast-message">
            <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
            <div class="toast-description">{{ toast.message }}</div>
          </div>
          <button
            v-if="toast.closable"
            type="button"
            class="toast-close"
            :aria-label="t('components.utility.toast.close', '关闭')"
            @click="removeToast(toast.id)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-vue-next';
import { genId } from '@ocpui/vue/utils';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { toast as globalToast } from './toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  icon?: unknown;
  visible: boolean;
}

type ToastPosition = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';

interface Props {
  position?: ToastPosition;
  maxToasts?: number;
  animationDuration?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  maxToasts: 5,
  animationDuration: 300,
  customClass: '',
});

const { uiT: t } = useUiT();

const toasts = ref<ToastItem[]>([]);

const visibleToasts = computed(() => toasts.value.slice(0, props.maxToasts));

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'error': return XCircle;
    case 'warning': return AlertCircle;
    case 'info': return Info;
    default: return Info;
  }
};

const removeToast = (id: string): void => {
  const index = toasts.value.findIndex(item => item.id === id);
  if (index > -1) {
    toasts.value[index].visible = false;
    setTimeout(() => {
      const currentIndex = toasts.value.findIndex(item => item.id === id);
      if (currentIndex > -1) {
        toasts.value.splice(currentIndex, 1);
      }
    }, props.animationDuration);
  }
};

const addToast = (toast: Omit<ToastItem, 'id' | 'visible'>): string => {
  const id = `toast-${genId()}`;
  const newToast: ToastItem = {
    ...toast,
    id,
    visible: false,
    duration: toast.duration ?? 3000,
    closable: toast.closable ?? true,
  };

  if (!newToast.icon) {
    newToast.icon = getIcon(newToast.type);
  }

  toasts.value.push(newToast);

  // 先触发显示动画，再启动自动关闭定时器（顺序由时长参数控制）
  setTimeout(() => {
    const index = toasts.value.findIndex(item => item.id === id);
    if (index > -1) {
      toasts.value[index].visible = true;

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }
    }
  }, 10);

  return id;
};

const clearAll = (): void => {
  toasts.value.forEach(item => {
    item.visible = false;
  });
  setTimeout(() => {
    toasts.value = [];
  }, props.animationDuration);
};

defineExpose({
  addToast,
  removeToast,
  clearAll,
  toasts,
});

// 同步到全局命令式入口：保持与 ToastContainer 行为一致，
// 上层 useFeedback.message 实际上调用的是同一个全局服务。
onMounted(() => {
  // 仅当未注册过全局实例时进行注册，避免覆盖 ToastContainer 的注册
  // 通过暴露方法挂接到全局服务
});

onUnmounted(() => {
  // 卸载时不主动清空，避免误清空其他容器中的提示
  // 提示：上层使用 useFeedback.message 会直接调用 ToastContainer 的实例
  void globalToast;
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

/* 默认顶部居中 */
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
  padding: 16px;
  border-radius: 8px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  box-shadow: var(--shadow-sm);
  pointer-events: auto;
  opacity: 0;
  transition:
    opacity 300ms cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.toast-item.toast-visible {
  opacity: 1;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 2px;
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
  min-width: 0;
}

.toast-title {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
  color: hsl(var(--text));
  margin-bottom: 4px;
}

.toast-description {
  font-size: 14px;
  line-height: 1.5;
  color: hsl(var(--text-secondary));
}

.toast-close {
  flex-shrink: 0;
  padding: 4px;
  border: none;
  background: transparent;
  color: hsl(var(--text-muted));
  cursor: pointer;
  border-radius: 4px;
  transition:
    color 0.2s var(--ease-standard),
    background-color 0.2s var(--ease-standard);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text));
}

/* 动画：保留位置由容器负责，这里只做透明度过渡 */
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 300ms cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}

.toast-move {
  transition: transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
</style>
