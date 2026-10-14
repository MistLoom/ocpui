<template>
  <div :class="spinClass" v-bind="$attrs">
    <div v-if="showSpin" class="spin-wrapper" :class="{ 'spin-wrapper--nested': $slots.default }">
      <div class="spin-indicator" :class="`spin-indicator--${size}`" :style="indicatorStyle">
        <div v-if="indicator === 'spinner'" class="spin-spinner">
          <svg viewBox="0 0 50 50" class="spin-spinner-svg">
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
        <div v-else-if="indicator === 'dots'" class="spin-dots">
          <span class="spin-dot spin-dot--1"></span>
          <span class="spin-dot spin-dot--2"></span>
          <span class="spin-dot spin-dot--3"></span>
        </div>
        <div v-else-if="indicator === 'ring'" class="spin-ring">
          <span class="spin-ring-item"></span>
          <span class="spin-ring-item"></span>
          <span class="spin-ring-item"></span>
          <span class="spin-ring-item"></span>
        </div>
        <slot v-else name="indicator">
          <div class="spin-spinner">
            <svg viewBox="0 0 50 50" class="spin-spinner-svg">
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
        </slot>
      </div>
      <div v-if="tip" class="spin-tip">{{ tip }}</div>
    </div>
    
    <div v-if="$slots.default" class="spin-content" :class="{ 'spin-content--blur': showSpin }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, watch } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';

/**
 * Spin 加载组件
 * 
 * @props spinning - 是否显示加载状态，默认为 true
 * @props size - 大小，可选值：'sm' | 'md' | 'lg'，默认为 'md'
 * @props indicator - 指示器类型，可选值：'spinner' | 'dots' | 'ring'，默认为 'spinner'
 * @props tip - 提示文本
 * @props delay - 延迟显示时间（毫秒），默认为 0
 * @props color - 加载颜色
 * @props customClass - 自定义类名
 * 
 * @slots indicator - 自定义指示器
 * @slots default - 加载时的内容
 * 
 * @usage
 * <template>
 *   <Spin :spinning="loading" tip="加载中..." />
 * </template>
 */

type SpinSize = ComponentSize;
type SpinIndicator = 'spinner' | 'dots' | 'ring';

interface Props {
  spinning?: boolean;
  size?: SpinSize;
  indicator?: SpinIndicator;
  tip?: string;
  delay?: number;
  color?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  spinning: true,
  size: 'md',
  indicator: 'spinner',
  tip: '',
  delay: 0,
  customClass: '',
});

const showSpin = ref(props.spinning);
let delayTimer: ReturnType<typeof setTimeout> | null = null;

// 监听 spinning 变化
watch(() => props.spinning, (newVal) => {
  if (props.delay > 0) {
    if (newVal) {
      delayTimer = setTimeout(() => {
        showSpin.value = true;
      }, props.delay);
    } else {
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
      showSpin.value = false;
    }
  } else {
    showSpin.value = newVal;
  }
});

const spinClass = computed(() => {
  const classes = ['spin'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const indicatorStyle = computed(() => {
  return {
    color: props.color,
  };
});

onUnmounted(() => {
  if (delayTimer) {
    clearTimeout(delayTimer);
  }
});
</script>

<style scoped>
.spin {
  position: relative;
  display: inline-block;
}

.spin-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spin-wrapper--nested {
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(4px);
  border-radius: 12px;
}

.spin-indicator {
  color: hsl(var(--primary));
}

.spin-indicator--sm {
  width: 24px;
  height: 24px;
}

.spin-indicator--md {
  width: 40px;
  height: 40px;
}

.spin-indicator--lg {
  width: 56px;
  height: 56px;
}

.spin-spinner {
  width: 100%;
  height: 100%;
}

.spin-spinner-svg {
  width: 100%;
  height: 100%;
  animation: spin-rotate 1.5s linear infinite;
}

.spin-spinner-svg circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: spin-dash 1.5s ease-in-out infinite;
  transform-origin: center;
}

@keyframes spin-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spin-dash {
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

.spin-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 100%;
}

.spin-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: hsl(var(--primary));
  border-radius: 50%;
  animation: spin-dot-bounce 1.4s ease-in-out infinite both;
}

.spin-indicator--sm .spin-dot {
  width: 6px;
  height: 6px;
}

.spin-indicator--lg .spin-dot {
  width: 12px;
  height: 12px;
}

.spin-dot--1 {
  animation-delay: -0.32s;
}

.spin-dot--2 {
  animation-delay: -0.16s;
}

@keyframes spin-dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.spin-ring {
  position: relative;
  width: 100%;
  height: 100%;
}

.spin-ring-item {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid hsl(var(--primary));
  border-radius: 50%;
  animation: spin-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: hsl(var(--primary)) transparent transparent transparent;
}

.spin-indicator--sm .spin-ring-item {
  border-width: 2px;
}

.spin-indicator--lg .spin-ring-item {
  border-width: 4px;
}

.spin-ring-item:nth-child(1) {
  animation-delay: -0.45s;
}

.spin-ring-item:nth-child(2) {
  animation-delay: -0.3s;
}

.spin-ring-item:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes spin-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spin-tip {
  margin-top: 12px;
  font-size: 14px;
  color: hsl(var(--text-secondary));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.spin-content {
  transition: opacity 0.3s;
}

.spin-content--blur {
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
}
</style>
