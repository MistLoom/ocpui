&lt;!--
Loading 加载组件

属性：
- modelValue: 是否显示，必填
- text: 加载文本，默认值：''
- fullscreen: 是否全屏，默认值：true
- background: 背景色，默认值：''
- size: 大小，可选值：sm, md, lg，默认值：md
- lock: 是否锁定滚动，默认值：true（经感知 overlay 栈统一收口）
- customClass: 自定义类名，默认值：''
- color: 加载颜色，默认值：''
- 层级由 --z-modal token 统一管理

事件：
- update:modelValue: 更新可见状态时触发
- close: 关闭时触发

使用方式：
&lt;Loading
  v-model="loading"
  text="加载中..."
  :fullscreen="true"
  :size="'md'"
/&gt;
--&gt;
<template>
  <div class="loading-wrapper">
    <slot />
    <Teleport to="body">
      <Transition name="loading">
        <div 
          v-if="modelValue" 
          class="loading-overlay" 
          :class="loadingClass"
          :style="overlayStyle"
          role="dialog"
          aria-modal="true"
          :aria-label="t('components.feedback.loading.loading')"
        >
          <div class="loading-container">
            <div class="loading-spinner" :class="`loading-spinner--${size}`" :style="spinnerStyle">
              <svg viewBox="0 0 50 50" class="loading-spinner-svg">
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
            <div v-if="text" class="loading-text">{{ text }}</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, watch } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useScrollLock } from '@ocpui/vue/system';

const { uiT: t } = useUiT();

type LoadingSize = ComponentSize;

interface Props {
  modelValue: boolean;
  text?: string;
  fullscreen?: boolean;
  background?: string;
  size?: LoadingSize;
  /** 全屏时是否锁定背景滚动（经 overlay 栈统一收口），默认 true */
  lock?: boolean;
  customClass?: string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  text: '',
  fullscreen: true,
  background: '',
  size: 'md',
  lock: true,
  customClass: '',
  color: '',
});

const emit = defineEmits<{
  'update:modelValue': [boolean];
  'close': [];
}>();

const loadingClass = computed(() => {
  const classes: string[] = [];
  if (props.fullscreen) {
    classes.push('loading-fullscreen');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

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

// 全屏且需锁滚时仅持纯滚动锁：数据态 loading 不进 overlay 栈、
// 不 W4 降焦 / inert / 焦点 trap / overlay 信号（state-system §3：数据态与权重正交）。
const overlayVisible = computed(() => props.modelValue && props.fullscreen && props.lock);
useScrollLock(overlayVisible);

watch(() => props.modelValue, (val) => {
  if (!val) {
    emit('close');
  }
});

const close = () => {
  emit('update:modelValue', false);
};

defineExpose({
  close,
});
</script>

<style scoped>
.loading-wrapper {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(4px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  color: hsl(var(--primary));
}

.loading-spinner--sm {
  width: 32px;
  height: 32px;
}

.loading-spinner--md {
  width: 48px;
  height: 48px;
}

.loading-spinner--lg {
  width: 64px;
  height: 64px;
}

.loading-spinner-svg {
  width: 100%;
  height: 100%;
  animation: loading-rotate 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
}

.loading-spinner-svg circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: loading-dash 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
  transform-origin: center;
}

@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
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

.loading-text {
  font-size: 14px;
  color: hsl(var(--text-secondary));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.5;
}

.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style>
