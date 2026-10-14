&lt;!--
轮播图组件

Props:
- items?: CarouselItem[] - 轮播项数据
- autoplay?: boolean - 是否自动播放，默认值：true
- autoplaySpeed?: number - 自动播放速度（毫秒），默认值：3000
- loop?: boolean - 是否循环播放，默认值：true
- showArrows?: boolean - 是否显示箭头，默认值：true
- showDots?: boolean - 是否显示 dots，默认值：true
- effect?: 'scroll' | 'fade' | 'slide' - 轮播效果，默认值：'scroll'
- height?: string | number - 轮播图高度，默认值：400
- aspectRatio?: string - 宽高比（如 '16/9'），设置后高度由 aspect-ratio 控制
- pauseOnHover?: boolean - 鼠标悬停时是否暂停，默认值：true
- initialIndex?: number - 初始索引，默认值：0
- customClass?: string - 自定义类名

Events:
- change: [currentIndex: number, prevIndex: number] - 轮播项切换事件

Slots:
- default - 默认插槽，用于自定义轮播项内容
- item - 轮播项插槽，接收 item 和 index 参数

Exposed Methods:
- goTo(index: number) - 切换到指定索引的轮播项
- prev() - 切换到上一张
- next() - 切换到下一张
- currentIndex - 当前轮播项索引

Usage:
&lt;Carousel
  :items="[
    { image: 'https://example.com/image1.jpg', title: '轮播图1', description: '描述1' },
    { image: 'https://example.com/image2.jpg', title: '轮播图2', description: '描述2' },
    { image: 'https://example.com/image3.jpg', title: '轮播图3', description: '描述3' }
  ]"
  :autoplay="true"
  :autoplaySpeed="3000"
  :showArrows="true"
  :showDots="true"
  @change="handleChange"
/&gt;

CarouselItem 接口:
- image?: string - 图片地址
- alt?: string - 图片 alt 属性
- title?: string - 标题
- description?: string - 描述
- [key: string]: any - 其他自定义属性
--&gt;
<template>
  <div 
    :class="carouselClass" 
    :style="rootStyle"
    @mouseenter="handleMouseEnter" 
    @mouseleave="handleMouseLeave"
    @keydown.left="handlePrev"
    @keydown.right="handleNext"
    @touchstart.passive="handleTouchStart"
    @touchmove.passive="handleTouchMove"
    @touchend="handleTouchEnd"
    tabindex="0"
  >
    <div class="carousel-track" :style="trackStyle">
      <div 
        v-for="(item, index) in displayItems" 
        :key="index" 
        class="carousel-item"
        :class="{ 'carousel-item--active': index === currentIndex }"
        :style="getItemStyle(index)"
      >
        <slot name="item" :item="item" :index="index">
          <slot :item="item" :index="index">
            <template v-if="'image' in item">
              <img v-if="item.image" :src="item.image" :alt="item.alt || ''" class="carousel-image" />
              <div v-if="item.title || item.description" class="carousel-content">
                <h3 v-if="item.title" class="carousel-title">{{ item.title }}</h3>
                <p v-if="item.description" class="carousel-description">{{ item.description }}</p>
              </div>
            </template>
          </slot>
        </slot>
      </div>
    </div>
    
    <button
      v-if="showArrows && displayItems.length > 1"
      type="button"
      class="carousel-arrow carousel-arrow--prev"
      :class="{ 'carousel-arrow--disabled': currentIndex === 0 && !loop }"
      @click="handlePrev"
      aria-label="上一张"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button
      v-if="showArrows && displayItems.length > 1"
      type="button"
      class="carousel-arrow carousel-arrow--next"
      :class="{ 'carousel-arrow--disabled': currentIndex === displayItems.length - 1 && !loop }"
      @click="handleNext"
      aria-label="下一张"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <div v-if="showDots && displayItems.length > 1" class="carousel-dots">
      <button
        v-for="(_, index) in displayItems"
        :key="index"
        type="button"
        class="carousel-dot"
        :class="{ 'carousel-dot--active': index === currentIndex }"
        @click="handleGoTo(index)"
        :aria-label="`切换到第 ${index + 1} 张`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, useSlots } from 'vue';

type CarouselEffect = 'scroll' | 'fade' | 'slide';

interface CarouselItem {
  image?: string;
  alt?: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

interface Props {
  items?: CarouselItem[];
  autoplay?: boolean;
  autoplaySpeed?: number;
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  effect?: CarouselEffect;
  height?: string | number;
  aspectRatio?: string;
  pauseOnHover?: boolean;
  initialIndex?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: undefined,
  autoplay: true,
  autoplaySpeed: 3000,
  loop: true,
  showArrows: true,
  showDots: true,
  effect: 'scroll',
  height: 400,
  aspectRatio: undefined,
  pauseOnHover: true,
  initialIndex: 0,
  customClass: '',
});

const emit = defineEmits<{
  'change': [currentIndex: number, prevIndex: number];
}>();

defineSlots<{
  item?(scope: { item: CarouselItem; index: number }): unknown;
  default?(scope: { item: CarouselItem; index: number }): unknown;
}>();

const slots = useSlots();
const currentIndex = ref(props.initialIndex);
const isPaused = ref(false);
let timer: number | null = null;

const touchStartX = ref(0);
const touchDeltaX = ref(0);
const SWIPE_THRESHOLD = 50;

const displayItems = computed<CarouselItem[]>(() => {
  if (props.items && props.items.length > 0) {
    return props.items;
  }
  if (slots.default) {
    // 默认插槽模式：以空占位项对齐 CarouselItem 契约，实际内容由插槽渲染
    return slots.default().map(() => ({} as CarouselItem));
  }
  return [];
});

const carouselClass = computed(() => {
  const classes = ['carousel', `carousel--${props.effect}`];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const rootStyle = computed(() => {
  if (!props.aspectRatio) {
    return undefined;
  }
  return {
    aspectRatio: props.aspectRatio,
    height: 'auto',
  };
});

const trackStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.aspectRatio) {
    style.height = '100%';
  } else if (typeof props.height === 'number') {
    style.height = `${props.height}px`;
  } else {
    style.height = props.height;
  }
  
  if (props.effect === 'scroll' || props.effect === 'slide') {
    style.transform = `translateX(-${currentIndex.value * 100}%)`;
  }
  
  return style;
});

const getItemStyle = (index: number) => {
  const style: Record<string, string> = {};
  
  if (props.effect === 'fade') {
    style.opacity = index === currentIndex.value ? '1' : '0';
    style.position = 'absolute';
    style.top = '0';
    style.left = '0';
    style.width = '100%';
    style.height = '100%';
    style.transition = 'opacity 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)';
  }
  
  return style;
};

const handlePrev = () => {
  const prevIndex = currentIndex.value;
  if (props.loop || currentIndex.value > 0) {
    currentIndex.value = currentIndex.value === 0 ? displayItems.value.length - 1 : currentIndex.value - 1;
    emit('change', currentIndex.value, prevIndex);
  }
};

const handleNext = () => {
  const prevIndex = currentIndex.value;
  if (props.loop || currentIndex.value < displayItems.value.length - 1) {
    currentIndex.value = currentIndex.value === displayItems.value.length - 1 ? 0 : currentIndex.value + 1;
    emit('change', currentIndex.value, prevIndex);
  }
};

const handleGoTo = (index: number) => {
  const prevIndex = currentIndex.value;
  currentIndex.value = index;
  emit('change', currentIndex.value, prevIndex);
};

const handleMouseEnter = () => {
  if (props.pauseOnHover) {
    isPaused.value = true;
  }
};

const handleMouseLeave = () => {
  if (props.pauseOnHover) {
    isPaused.value = false;
  }
};

const handleTouchStart = (event: TouchEvent) => {
  if (displayItems.value.length <= 1) {
    return;
  }
  const touch = event.touches[0];
  if (!touch) {
    return;
  }
  touchStartX.value = touch.clientX;
  touchDeltaX.value = 0;
};

const handleTouchMove = (event: TouchEvent) => {
  if (displayItems.value.length <= 1) {
    return;
  }
  const touch = event.touches[0];
  if (!touch) {
    return;
  }
  touchDeltaX.value = touch.clientX - touchStartX.value;
};

const handleTouchEnd = () => {
  if (displayItems.value.length <= 1) {
    return;
  }
  if (Math.abs(touchDeltaX.value) < SWIPE_THRESHOLD) {
    return;
  }
  if (touchDeltaX.value > 0) {
    handlePrev();
  } else {
    handleNext();
  }
  touchDeltaX.value = 0;
};

const startAutoplay = () => {
  if (!props.autoplay) return;
  
  stopAutoplay();
  timer = window.setInterval(() => {
    if (!isPaused.value) {
      handleNext();
    }
  }, props.autoplaySpeed);
};

const stopAutoplay = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

watch(() => props.autoplay, (val) => {
  if (val) {
    startAutoplay();
  } else {
    stopAutoplay();
  }
});

watch(() => props.autoplaySpeed, () => {
  if (props.autoplay) {
    startAutoplay();
  }
});

watch(() => props.items, () => {
  if (currentIndex.value >= displayItems.value.length) {
    currentIndex.value = 0;
  }
});

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  stopAutoplay();
});

const goTo = (index: number) => {
  handleGoTo(index);
};

const prev = () => {
  handlePrev();
};

const next = () => {
  handleNext();
};

defineExpose({
  goTo,
  prev,
  next,
  currentIndex,
});
</script>

<style scoped>
.carousel {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: hsl(var(--surface-inset));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative;
}

.carousel-item {
  flex: 0 0 100%;
  position: relative;
  overflow: hidden;
}

.carousel-item--active {
  z-index: 1;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32px;
  background: linear-gradient(to top, hsl(0 0% 0% / 0.8), transparent);
  color: hsl(var(--primary-foreground));
}

.carousel-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
}

.carousel-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.9;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  padding: 0;
  background: hsl(var(--surface));
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  box-shadow: 0 2px 8px hsl(var(--shadow));
  z-index: 10;
  user-select: none;
}

.carousel-arrow:hover:not(.carousel-arrow--disabled) {
  background: hsl(var(--surface-elevated));
  box-shadow: var(--shadow-sm);
}

.carousel-arrow:active:not(.carousel-arrow--disabled) {
  transform: translateY(-50%) translateY(0) scale(0.95);
}

.carousel-arrow--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-arrow--prev {
  left: 16px;
}

.carousel-arrow--next {
  right: 16px;
}

.carousel-arrow svg {
  width: 20px;
  height: 20px;
  color: hsl(var(--text));
}

.carousel-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  background: hsl(var(--primary-foreground) / 0.5);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.carousel-dot:hover {
  background: hsl(var(--primary-foreground) / 0.8);
}

.carousel-dot--active {
  background: hsl(var(--primary-foreground));
}

@media (hover: none) and (pointer: coarse) {
  .carousel-dot {
    min-width: var(--touch-min-size);
    min-height: var(--touch-min-size);
    padding: 0;
    background: transparent;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel-dot::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: hsl(var(--primary-foreground) / 0.5);
    transition: background var(--transition-normal);
  }

  .carousel-dot--active {
    background: transparent;
  }

  .carousel-dot--active::before {
    background: hsl(var(--primary-foreground));
  }
}

@media (max-width: 768px) {
  .carousel-arrow {
    width: 32px;
    height: 32px;
  }
  
  .carousel-arrow--prev {
    left: 8px;
  }
  
  .carousel-arrow--next {
    right: 8px;
  }
  
  .carousel-arrow svg {
    width: 16px;
    height: 16px;
  }
  
  .carousel-content {
    padding: 20px;
  }
  
  .carousel-title {
    font-size: 18px;
  }
  
  .carousel-description {
    font-size: 13px;
  }
}
</style>
