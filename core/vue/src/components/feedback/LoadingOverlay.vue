&lt;!--
LoadingOverlay 加载遮罩组件

属性：
- visible: 是否显示，必填
- text: 加载文本，默认值：'加载中...'
- size: 大小，可选值：sm, md, lg，默认值：md
- fullscreen: 是否全屏，默认值：false
- teleport: 是否 teleport 到 body，默认值：true
- showProgress: 是否显示进度条，默认值：false
- progress: 进度值（0-100），默认值：undefined
- cancellable: 是否可取消，默认值：false
- background: 背景色，默认值：''
- customClass: 自定义类名，默认值：''
- color: 加载颜色，默认值：''

事件：
- cancel: 取消时触发

使用方式：
&lt;LoadingOverlay
  :visible="loading"
  text="加载中..."
  :fullscreen="true"
  :show-progress="true"
  :progress="progress"
  @cancel="handleCancel"
/&gt;
--&gt;
<template>
  <div ref="targetRef" class="loading-overlay-wrapper">
    <slot />
    
    <Teleport to="body" v-if="teleport && fullscreen">
      <Transition name="loading-overlay">
        <div
          v-if="visible"
          class="loading-overlay loading-overlay--fullscreen"
          :class="props.customClass"
          :style="overlayStyle"
        >
          <div class="loading-overlay-content">
            <div class="loading-overlay-spinner" :class="`loading-overlay-spinner--${size}`" :style="spinnerStyle">
              <svg viewBox="0 0 50 50" class="loading-overlay-svg">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="4"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div v-if="displayText" class="loading-overlay-text">{{ displayText }}</div>
            <div v-if="showProgress && progress !== undefined" class="loading-overlay-progress">
              <div class="loading-overlay-progress-bar">
                <div
                  class="loading-overlay-progress-fill"
                  :style="{ width: `${progress}%`, backgroundColor: color || 'hsl(var(--primary))' }"
                />
              </div>
              <span class="loading-overlay-progress-text">{{ progress }}%</span>
            </div>
            <Button
              v-if="cancellable"
              variant="text"
              size="sm"
              class="loading-overlay-cancel"
              @click="handleCancel"
            >
              {{ t('components.feedback.loadingOverlay.cancel') }}
            </Button>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <Transition name="loading-overlay" v-else>
      <div
        v-if="visible"
        class="loading-overlay"
        :class="[fullscreen ? 'loading-overlay--fullscreen' : 'loading-overlay--local', props.customClass]"
        :style="overlayStyle"
      >
        <div class="loading-overlay-content">
          <div class="loading-overlay-spinner" :class="`loading-overlay-spinner--${size}`" :style="spinnerStyle">
            <svg viewBox="0 0 50 50" class="loading-overlay-svg">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div v-if="displayText" class="loading-overlay-text">{{ displayText }}</div>
          <div v-if="showProgress && progress !== undefined" class="loading-overlay-progress">
            <div class="loading-overlay-progress-bar">
              <div
                class="loading-overlay-progress-fill"
                :style="{ width: `${progress}%`, backgroundColor: color || 'hsl(var(--primary))' }"
              />
            </div>
            <span class="loading-overlay-progress-text">{{ progress }}%</span>
          </div>
          <Button
            v-if="cancellable"
            variant="text"
            size="sm"
            class="loading-overlay-cancel"
            @click="handleCancel"
          >
            {{ t('components.feedback.loadingOverlay.cancel') }}
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button } from '../utility';
import type { ComponentSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useScrollLock } from '@ocpui/vue/system';

const { uiT: t } = useUiT();

export type LoadingOverlaySize = ComponentSize;

interface Props {
  visible: boolean;
  text?: string;
  size?: LoadingOverlaySize;
  fullscreen?: boolean;
  teleport?: boolean;
  showProgress?: boolean;
  progress?: number;
  cancellable?: boolean;
  background?: string;
  customClass?: string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  text: '加载中...',
  size: 'md',
  fullscreen: false,
  teleport: true,
  showProgress: false,
  progress: undefined,
  cancellable: false,
  background: '',
  customClass: '',
  color: '',
});

const emit = defineEmits<{
  cancel: [];
}>();

const targetRef = ref<HTMLElement>();

const overlayStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.background) {
    style.background = props.background;
  }
  return style;
});

const spinnerStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.color) {
    style.color = props.color;
  }
  return style;
});

const handleCancel = () => {
  emit('cancel');
};

const displayText = computed(() => props.text || t('components.feedback.loadingOverlay.defaultText'));

/* 全屏 teleport 形态仅持纯背景滚动锁：数据态 loading 不进 overlay 栈、
   不 W4 降焦 / inert / 焦点 trap / overlay 信号（state-system §3：数据态与权重正交）。 */
const fullscreenLockVisible = computed(
  () => props.visible && props.fullscreen && props.teleport,
);
useScrollLock(fullscreenLockVisible);

defineExpose({
  targetRef,
});
</script>

<style scoped>
.loading-overlay-wrapper {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal);
}

.loading-overlay--fullscreen {
  position: fixed;
  inset: 0;
}

.loading-overlay--local {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.loading-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: var(--shadow-md);
}

.loading-overlay-spinner {
  color: hsl(var(--primary));
}

.loading-overlay-spinner--sm {
  width: 32px;
  height: 32px;
}

.loading-overlay-spinner--md {
  width: 48px;
  height: 48px;
}

.loading-overlay-spinner--lg {
  width: 64px;
  height: 64px;
}

.loading-overlay-svg {
  width: 100%;
  height: 100%;
  animation: loading-overlay-rotate 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
}

.loading-overlay-svg circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: loading-overlay-dash 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
  transform-origin: center;
}

@keyframes loading-overlay-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-overlay-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.loading-overlay-text {
  font-size: 14px;
  color: hsl(var(--text-secondary));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.loading-overlay-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
}

.loading-overlay-progress-bar {
  flex: 1;
  height: 4px;
  background: hsl(var(--surface-container-high));
  border-radius: 2px;
  overflow: hidden;
}

.loading-overlay-progress-fill {
  height: 100%;
  background: hsl(var(--primary));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.loading-overlay-progress-text {
  font-size: 12px;
  color: hsl(var(--text-muted));
  font-variant-numeric: tabular-nums;
}

.loading-overlay-cancel {
  color: hsl(var(--text-muted));
}

.loading-overlay-cancel:hover {
  color: hsl(var(--error));
}

/* 动画 */
.loading-overlay-enter-active,
.loading-overlay-leave-active {
  transition: opacity 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.loading-overlay-enter-from,
.loading-overlay-leave-to {
  opacity: 0;
}

.loading-overlay-enter-from .loading-overlay-content,
.loading-overlay-leave-to .loading-overlay-content {
  transform: scale(0.96);
}
</style>
