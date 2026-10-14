<!--
InfiniteScroll 组件

功能：实现无限滚动加载功能，当滚动接近底部时触发加载事件

使用方式：
<InfiniteScroll
  :loading="loading"
  :finished="finished"
  :distance="100"
  @load="loadMore"
>
  <div v-for="item in items" :key="item.id">{{ item.name }}</div>
</InfiniteScroll>

公开属性：
- loading: 是否正在加载，默认 false
- finished: 是否已加载完成，默认 false
- distance: 触发加载的距离阈值（像素），默认 50
- immediate: 是否在组件挂载后立即检查，默认 true
- loadingText: 加载中的文本，默认 '加载中...'
- finishedText: 加载完成的文本，默认 '没有更多了'
- showFinished: 是否显示加载完成的文本，默认 true
- customClass: 自定义类名，默认 ''

处理器：
- load: 当滚动接近底部时触发的加载事件

暴露方法：
- check: 手动检查是否需要加载
- scrollRef: 滚动容器的引用
-->
<template>
  <div
    ref="scrollRef"
    :class="infiniteScrollClass"
    @scroll="handleScroll"
  >
    <slot />
    <div
      v-if="native"
      ref="sentinelRef"
      class="infinite-scroll-sentinel"
      :style="{ height: `${distance}px` }"
      aria-hidden="true"
    />
    <div v-if="loading" class="infinite-scroll-loading">
      <span class="infinite-scroll-spinner" />
      <span class="infinite-scroll-text">{{ resolvedLoadingText }}</span>
    </div>
    <div v-if="finished && showFinished" class="infinite-scroll-finished">
      {{ resolvedFinishedText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

interface Props {
  loading?: boolean;
  finished?: boolean;
  distance?: number;
  immediate?: boolean;
  /** 使用窗口滚动 + IntersectionObserver，避免嵌套滚动区域 */
  native?: boolean;
  loadingText?: string;
  finishedText?: string;
  showFinished?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  finished: false,
  distance: 50,
  immediate: true,
  native: false,
  loadingText: '',
  finishedText: '',
  showFinished: true,
  customClass: '',
});

const emit = defineEmits<{
  load: [];
}>();

const { uiT: t } = useUiT();

// 文案优先取 prop 覆盖，未传时回退到 i18n，再回退到兜底
const resolvedLoadingText = computed(() =>
  props.loadingText || t('components.animation.infiniteScroll.loading', '加载中...'),
);
const resolvedFinishedText = computed(() =>
  props.finishedText || t('components.animation.infiniteScroll.finished', '没有更多了'),
);

const scrollRef = ref<HTMLElement>();
const sentinelRef = ref<HTMLElement>();
let debounceTimer: number | null = null;
let observer: IntersectionObserver | null = null;

const infiniteScrollClass = computed(() => {
  const classes = ['infinite-scroll'];
  if (props.native) classes.push('infinite-scroll--native');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const check = () => {
  if (props.loading || props.finished) return;

  const el = scrollRef.value;
  if (!el) return;

  const { scrollTop, scrollHeight, clientHeight } = el;
  const distanceToBottom = scrollHeight - scrollTop - clientHeight;

  if (distanceToBottom <= props.distance) {
    emit('load');
  }
};

const handleScroll = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(() => {
    check();
  }, 100);
};

const handleResize = () => {
  check();
};

const setupNativeObserver = () => {
  if (!props.native || typeof IntersectionObserver === 'undefined') return;
  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        check();
      }
    },
    { root: null, rootMargin: `0px 0px ${props.distance}px 0px`, threshold: 0 },
  );
  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
};

onMounted(() => {
  if (props.immediate) {
    check();
  }
  if (props.native) {
    setupNativeObserver();
  } else {
    window.addEventListener('resize', handleResize);
  }
});

watch(
  () => props.native,
  (native) => {
    observer?.disconnect();
    observer = null;
    if (native) {
      window.removeEventListener('resize', handleResize);
      setupNativeObserver();
    } else {
      window.addEventListener('resize', handleResize);
    }
  },
);

watch(sentinelRef, () => {
  if (props.native) {
    setupNativeObserver();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  observer?.disconnect();
  observer = null;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});

defineExpose({
  check,
  scrollRef,
});
</script>

<style scoped>
.infinite-scroll {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-y: auto;
}

.infinite-scroll--native {
  overflow: visible;
}

.infinite-scroll-sentinel {
  width: 100%;
  pointer-events: none;
}

.infinite-scroll-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: hsl(var(--text-muted));
}

.infinite-scroll-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: infinite-scroll-spin 0.8s linear infinite;
}

@keyframes infinite-scroll-spin {
  to { transform: rotate(360deg); }
}

.infinite-scroll-text {
  font-size: 14px;
}

.infinite-scroll-finished {
  padding: 16px;
  text-align: center;
  font-size: 14px;
  color: hsl(var(--text-muted));
}
</style>
