<!--
Split 分割面板组件

属性：
- direction: 'horizontal' | 'vertical'，默认 horizontal
- size: 第一面板占容器百分比，默认 50
- min / max: 百分比钳制，默认 10 / 90

事件：
- update:size / resize: 拖拽或键盘调整后的百分比
-->
<template>
  <div ref="splitRef" :class="splitClass">
    <div class="split-pane split-pane--first" :style="firstPaneStyle">
      <slot name="first" />
    </div>
    <div
      class="split-trigger"
      :class="`split-trigger--${direction}`"
      role="separator"
      :aria-orientation="direction === 'horizontal' ? 'vertical' : 'horizontal'"
      :aria-valuenow="Math.round(currentSize)"
      :aria-valuemin="min"
      :aria-valuemax="max"
      tabindex="0"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
      @keydown="handleKeydown"
    >
      <div class="split-trigger-bar" />
      <div class="split-trigger-icon" aria-hidden="true">
        <svg v-if="direction === 'horizontal'" viewBox="0 0 12 12" fill="currentColor">
          <rect x="4" y="2" width="1.5" height="8" rx="0.75"/>
          <rect x="6.5" y="2" width="1.5" height="8" rx="0.75"/>
        </svg>
        <svg v-else viewBox="0 0 12 12" fill="currentColor">
          <rect x="2" y="4" width="8" height="1.5" rx="0.75"/>
          <rect x="2" y="6.5" width="8" height="1.5" rx="0.75"/>
        </svg>
      </div>
    </div>
    <div class="split-pane split-pane--second" :style="secondPaneStyle">
      <slot name="second" />
    </div>
    <div v-if="isResizing" class="split-drag-mask" :class="`split-drag-mask--${direction}`" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

type SplitDirection = 'horizontal' | 'vertical';

interface Props {
  direction?: SplitDirection;
  size?: number;
  min?: number;
  max?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  size: 50,
  min: 10,
  max: 90,
  customClass: '',
});

const emit = defineEmits<{
  'update:size': [size: number];
  resize: [size: number];
}>();

const splitRef = ref<HTMLElement>();
const currentSize = ref(props.size);
const isResizing = ref(false);
const activePointerId = ref<number | null>(null);

const splitClass = computed(() => {
  const classes = ['split', `split--${props.direction}`];
  if (isResizing.value) classes.push('split--resizing');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const firstPaneStyle = computed(() => ({
  flex: `0 0 ${currentSize.value}%`,
}));

const secondPaneStyle = computed(() => ({
  flex: '1 1 0%',
}));

function clampSize(value: number): number {
  return Math.max(props.min, Math.min(props.max, value));
}

function applySize(value: number) {
  const next = clampSize(value);
  if (next === currentSize.value) return;
  currentSize.value = next;
  emit('update:size', next);
  emit('resize', next);
}

function calculateNewSize(clientX: number, clientY: number): number {
  if (!splitRef.value) return currentSize.value;
  const rect = splitRef.value.getBoundingClientRect();
  if (props.direction === 'horizontal') {
    if (rect.width <= 0) return currentSize.value;
    return ((clientX - rect.left) / rect.width) * 100;
  }
  if (rect.height <= 0) return currentSize.value;
  return ((clientY - rect.top) / rect.height) * 100;
}

function handlePointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  activePointerId.value = e.pointerId;
  isResizing.value = true;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

function handlePointerMove(e: PointerEvent) {
  if (!isResizing.value || e.pointerId !== activePointerId.value) return;
  applySize(calculateNewSize(e.clientX, e.clientY));
}

function handlePointerUp(e: PointerEvent) {
  if (e.pointerId !== activePointerId.value) return;
  const target = e.currentTarget as HTMLElement;
  if (target.hasPointerCapture(e.pointerId)) {
    target.releasePointerCapture(e.pointerId);
  }
  activePointerId.value = null;
  isResizing.value = false;
}

function handleKeydown(e: KeyboardEvent) {
  const step = e.shiftKey ? 5 : 2;
  let delta = 0;
  if (props.direction === 'horizontal') {
    if (e.key === 'ArrowLeft') delta = -step;
    if (e.key === 'ArrowRight') delta = step;
  } else {
    if (e.key === 'ArrowUp') delta = -step;
    if (e.key === 'ArrowDown') delta = step;
  }
  if (e.key === 'Home') {
    e.preventDefault();
    applySize(props.min);
    return;
  }
  if (e.key === 'End') {
    e.preventDefault();
    applySize(props.max);
    return;
  }
  if (!delta) return;
  e.preventDefault();
  applySize(currentSize.value + delta);
}

watch(
  () => props.size,
  (newSize) => {
    if (newSize !== currentSize.value) currentSize.value = newSize;
  },
);
</script>

<style scoped>
.split {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.split--horizontal {
  flex-direction: row;
  align-items: stretch;
}

.split--vertical {
  flex-direction: column;
  align-items: stretch;
}

.split-pane {
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.split-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: var(--z-base);
  background: transparent;
  user-select: none;
  touch-action: none;
  outline: none;
}

.split-trigger:focus-visible {
  box-shadow: inset 0 0 0 2px hsl(var(--primary) / 0.45);
}

.split-trigger--horizontal {
  width: 8px;
  cursor: col-resize;
}

.split-trigger--vertical {
  height: 8px;
  cursor: row-resize;
}

/* 全长发丝线，热区宽于可视线 */
.split-trigger-bar {
  position: absolute;
  background: hsl(var(--border));
  pointer-events: none;
  transition: background 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
    width 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
    height 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.split-trigger--horizontal .split-trigger-bar {
  top: 0;
  bottom: 0;
  width: 1px;
  height: auto;
}

.split-trigger--vertical .split-trigger-bar {
  left: 0;
  right: 0;
  height: 1px;
  width: auto;
}

.split-trigger:hover .split-trigger-bar,
.split-trigger:focus-visible .split-trigger-bar,
.split--resizing .split-trigger-bar {
  background: hsl(var(--primary));
}

.split-trigger--horizontal:hover .split-trigger-bar,
.split-trigger--horizontal:focus-visible .split-trigger-bar,
.split--resizing.split--horizontal .split-trigger-bar {
  width: 2px;
}

.split-trigger--vertical:hover .split-trigger-bar,
.split-trigger--vertical:focus-visible .split-trigger-bar,
.split--resizing.split--vertical .split-trigger-bar {
  height: 2px;
}

.split-trigger-icon {
  position: relative;
  z-index: var(--z-base);
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--text-muted));
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
    color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.split-trigger:hover .split-trigger-icon,
.split-trigger:focus-visible .split-trigger-icon,
.split--resizing .split-trigger-icon {
  opacity: 1;
  color: hsl(var(--primary));
}

.split-trigger-icon svg {
  width: 12px;
  height: 12px;
}

.split-drag-mask {
  position: fixed;
  inset: 0;
  z-index: var(--z-dropdown);
}

.split-drag-mask--horizontal {
  cursor: col-resize;
}

.split-drag-mask--vertical {
  cursor: row-resize;
}

@media (max-width: 767.98px) {
  .split-trigger--horizontal {
    width: 12px;
  }

  .split-trigger--vertical {
    height: 12px;
  }

  .split-trigger-icon svg {
    width: 16px;
    height: 16px;
  }
}
</style>
