&lt;!--
Scrollbar 组件

功能：自定义滚动条组件，提供美观的滚动条样式和交互

属性：
- horizontal: 是否显示水平滚动条，默认值：true
- vertical: 是否显示垂直滚动条，默认值：true
- trigger: 滚动条触发方式，可选值：hover, always, none，默认值：hover
- customClass: 自定义类名
- thumbColor: 滚动条滑块颜色
- trackColor: 滚动条轨道颜色
- thumbSize: 滚动条滑块大小，默认值：6
- minThumbSize: 最小滑块大小，默认值：20
- ariaLabel: 无障碍标签，默认值：滚动区域

事件：
- scroll: 滚动事件

方法：
- scrollTo(options): 滚动到指定位置
- scrollToElement(element, behavior): 滚动到指定元素
- updateSize(): 更新滚动条尺寸

使用方式：
&lt;Scrollbar style="height: 300px; width: 400px"&gt;
  &lt;!-- 内容 --&gt;
&lt;/Scrollbar&gt;
&lt;Scrollbar vertical trigger="always" thumbColor="#666" trackColor="#f0f0f0"&gt;
  &lt;!-- 内容 --&gt;
&lt;/Scrollbar&gt;
--&gt;

<template>
  <div 
    ref="scrollbarRef" 
    :class="scrollbarClass" 
    v-bind="$attrs"
    role="region"
    :aria-label="ariaLabel"
  >
    <div 
      ref="contentRef" 
      class="scrollbar-content" 
      @scroll="handleScroll"
      @keydown="handleKeydown"
      tabindex="0"
    >
      <slot />
    </div>
    <div
      v-if="showHorizontalBar"
      ref="horizontalBarRef"
      class="scrollbar-bar scrollbar-bar--horizontal"
      @mousedown="handleHorizontalMouseDown"
      @touchstart="handleHorizontalTouchStart"
      aria-hidden="true"
    >
      <div class="scrollbar-thumb" :style="horizontalThumbStyle" />
    </div>
    <div
      v-if="showVerticalBar"
      ref="verticalBarRef"
      class="scrollbar-bar scrollbar-bar--vertical"
      @mousedown="handleVerticalMouseDown"
      @touchstart="handleVerticalTouchStart"
      aria-hidden="true"
    >
      <div class="scrollbar-thumb" :style="verticalThumbStyle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface Props {
  horizontal?: boolean;
  vertical?: boolean;
  trigger?: 'hover' | 'always' | 'none';
  customClass?: string;
  thumbColor?: string;
  trackColor?: string;
  thumbSize?: number;
  minThumbSize?: number;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  horizontal: true,
  vertical: true,
  trigger: 'hover',
  customClass: '',
  thumbColor: '',
  trackColor: '',
  thumbSize: 6,
  minThumbSize: 20,
  ariaLabel: '滚动区域',
});

const emit = defineEmits<{
  'scroll': [event: Event];
}>();

const scrollbarRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const horizontalBarRef = ref<HTMLElement>();
const verticalBarRef = ref<HTMLElement>();

const scrollLeft = ref(0);
const scrollTop = ref(0);
const scrollWidth = ref(0);
const scrollHeight = ref(0);
const clientWidth = ref(0);
const clientHeight = ref(0);

const scrollbarClass = computed(() => {
  const classes = ['scrollbar', `scrollbar--${props.trigger}`];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const showHorizontalBar = computed(() => {
  return props.horizontal && scrollWidth.value > clientWidth.value;
});

const showVerticalBar = computed(() => {
  return props.vertical && scrollHeight.value > clientHeight.value;
});

const horizontalThumbStyle = computed(() => {
  const ratio = clientWidth.value / scrollWidth.value;
  const thumbWidth = Math.max(ratio * (clientWidth.value - props.thumbSize * 2), props.minThumbSize);
  const maxScrollLeft = scrollWidth.value - clientWidth.value;
  const thumbLeft = maxScrollLeft > 0 ? (scrollLeft.value / maxScrollLeft) * (clientWidth.value - props.thumbSize * 2 - thumbWidth) : 0;
  
  return {
    width: `${thumbWidth}px`,
    transform: `translateX(${thumbLeft}px)`,
    backgroundColor: props.thumbColor || 'hsl(var(--text-muted) / 0.3)',
  };
});

const verticalThumbStyle = computed(() => {
  const ratio = clientHeight.value / scrollHeight.value;
  const thumbHeight = Math.max(ratio * (clientHeight.value - props.thumbSize * 2), props.minThumbSize);
  const maxScrollTop = scrollHeight.value - clientHeight.value;
  const thumbTop = maxScrollTop > 0 ? (scrollTop.value / maxScrollTop) * (clientHeight.value - props.thumbSize * 2 - thumbHeight) : 0;
  
  return {
    height: `${thumbHeight}px`,
    transform: `translateY(${thumbTop}px)`,
    backgroundColor: props.thumbColor || 'hsl(var(--text-muted) / 0.3)',
  };
});

const handleScroll = (e: Event) => {
  if (!contentRef.value) return;
  scrollLeft.value = contentRef.value.scrollLeft;
  scrollTop.value = contentRef.value.scrollTop;
  emit('scroll', e);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!contentRef.value) return;
  
  const step = e.shiftKey ? 100 : 20;
  
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      contentRef.value.scrollTop -= step;
      break;
    case 'ArrowDown':
      e.preventDefault();
      contentRef.value.scrollTop += step;
      break;
    case 'ArrowLeft':
      e.preventDefault();
      contentRef.value.scrollLeft -= step;
      break;
    case 'ArrowRight':
      e.preventDefault();
      contentRef.value.scrollLeft += step;
      break;
    case 'PageUp':
      e.preventDefault();
      contentRef.value.scrollTop -= contentRef.value.clientHeight;
      break;
    case 'PageDown':
      e.preventDefault();
      contentRef.value.scrollTop += contentRef.value.clientHeight;
      break;
    case 'Home':
      e.preventDefault();
      contentRef.value.scrollTop = 0;
      contentRef.value.scrollLeft = 0;
      break;
    case 'End':
      e.preventDefault();
      contentRef.value.scrollTop = contentRef.value.scrollHeight;
      contentRef.value.scrollLeft = contentRef.value.scrollWidth;
      break;
  }
};

const updateSize = () => {
  if (!contentRef.value) return;
  scrollWidth.value = contentRef.value.scrollWidth;
  scrollHeight.value = contentRef.value.scrollHeight;
  clientWidth.value = contentRef.value.clientWidth;
  clientHeight.value = contentRef.value.clientHeight;
};

const handleHorizontalMouseDown = (e: MouseEvent) => {
  e.preventDefault();
  const startX = e.clientX;
  const startScrollLeft = scrollLeft.value;
  const ratio = scrollWidth.value / (clientWidth.value - props.thumbSize * 2);
  
  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX;
    if (contentRef.value) {
      contentRef.value.scrollLeft = startScrollLeft + deltaX * ratio;
    }
  };
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleVerticalMouseDown = (e: MouseEvent) => {
  e.preventDefault();
  const startY = e.clientY;
  const startScrollTop = scrollTop.value;
  const ratio = scrollHeight.value / (clientHeight.value - props.thumbSize * 2);
  
  const handleMouseMove = (e: MouseEvent) => {
    const deltaY = e.clientY - startY;
    if (contentRef.value) {
      contentRef.value.scrollTop = startScrollTop + deltaY * ratio;
    }
  };
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleHorizontalTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  const touch = e.touches[0];
  const startX = touch.clientX;
  const startScrollLeft = scrollLeft.value;
  const ratio = scrollWidth.value / (clientWidth.value - props.thumbSize * 2);
  
  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    if (contentRef.value) {
      contentRef.value.scrollLeft = startScrollLeft + deltaX * ratio;
    }
  };
  
  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
  
  document.addEventListener('touchmove', handleTouchMove);
  document.addEventListener('touchend', handleTouchEnd);
};

const handleVerticalTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  const touch = e.touches[0];
  const startY = touch.clientY;
  const startScrollTop = scrollTop.value;
  const ratio = scrollHeight.value / (clientHeight.value - props.thumbSize * 2);
  
  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    if (contentRef.value) {
      contentRef.value.scrollTop = startScrollTop + deltaY * ratio;
    }
  };
  
  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
  
  document.addEventListener('touchmove', handleTouchMove);
  document.addEventListener('touchend', handleTouchEnd);
};

const scrollTo = (options: { left?: number; top?: number; behavior?: ScrollBehavior }) => {
  contentRef.value?.scrollTo(options);
};

const scrollToElement = (element: HTMLElement, behavior: ScrollBehavior = 'smooth') => {
  element.scrollIntoView({ behavior });
};

let observer: MutationObserver | null = null;

onMounted(() => {
  updateSize();
  window.addEventListener('resize', updateSize);
  
  observer = new MutationObserver(updateSize);
  if (contentRef.value) {
    observer.observe(contentRef.value, { childList: true, subtree: true });
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateSize);
  if (observer) {
    observer.disconnect();
  }
});

defineExpose({
  scrollTo,
  scrollToElement,
  updateSize,
});
</script>

<style scoped>
.scrollbar {
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.scrollbar-content {
  width: 100%;
  height: 100%;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  outline: none;
}

.scrollbar-content::-webkit-scrollbar {
  display: none;
}

.scrollbar-bar {
  position: absolute;
  background: v-bind('props.trackColor || "transparent"');
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.scrollbar--hover:hover .scrollbar-bar,
.scrollbar--always .scrollbar-bar {
  opacity: 1;
}

.scrollbar-bar--horizontal {
  bottom: v-bind('props.thumbSize / 2 + "px"');
  left: v-bind('props.thumbSize / 2 + "px"');
  right: v-bind('props.thumbSize / 2 + "px"');
  height: v-bind('props.thumbSize + "px"');
}

.scrollbar-bar--vertical {
  top: v-bind('props.thumbSize / 2 + "px"');
  right: v-bind('props.thumbSize / 2 + "px"');
  bottom: v-bind('props.thumbSize / 2 + "px"');
  width: v-bind('props.thumbSize + "px"');
}

.scrollbar-thumb {
  position: absolute;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.scrollbar-thumb:hover {
  background: v-bind('props.thumbColor ? props.thumbColor + "80" : "hsl(var(--text-muted) / 0.5)"');
}

.scrollbar-bar--horizontal .scrollbar-thumb {
  height: 100%;
}

.scrollbar-bar--vertical .scrollbar-thumb {
  width: 100%;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .scrollbar {
    --scrollbar-thumb-size: 8px;
  }
}
</style>
