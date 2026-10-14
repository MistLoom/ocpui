<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
  items: any[];
  itemHeight: number;
  buffer?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  itemHeight: 40,
  buffer: 5,
  customClass: '',
});

const emit = defineEmits<{
  'scroll': [event: Event];
}>();

const containerRef = ref<HTMLElement>();
const scrollTop = ref(0);
const containerHeight = ref(0);

const virtualListClass = computed(() => {
  const classes = ['virtual-list'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const totalHeight = computed(() => {
  return props.items.length * props.itemHeight;
});

const phantomStyle = computed(() => {
  return {
    height: `${totalHeight.value}px`,
  };
});

const contentStyle = computed(() => {
  const startIndex = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer);
  const offset = startIndex * props.itemHeight;

  return {
    transform: `translateY(${offset}px)`,
  };
});

const visibleItems = computed(() => {
  const startIndex = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer);
  const visibleCount = Math.ceil(containerHeight.value / props.itemHeight) + props.buffer * 2;
  const endIndex = Math.min(props.items.length, startIndex + visibleCount);

  return props.items.slice(startIndex, endIndex).map((item, index) => ({
    data: item,
    index: startIndex + index,
    key: item.key || item.id || startIndex + index,
  }));
});

const handleScroll = (e: Event) => {
  if (!containerRef.value) return;
  scrollTop.value = containerRef.value.scrollTop;
  emit('scroll', e);
};

const scrollTo = (index: number) => {
  if (!containerRef.value) return;
  containerRef.value.scrollTop = index * props.itemHeight;
};

const scrollToTop = () => {
  scrollTo(0);
};

const scrollToBottom = () => {
  scrollTo(props.items.length - 1);
};

watch(() => props.items, () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight;
  }
}, { immediate: true });

defineExpose({
  scrollTo,
  scrollToTop,
  scrollToBottom,
});
</script>

<template>
  <div ref="containerRef" :class="virtualListClass" @scroll="handleScroll" v-bind="$attrs">
    <div class="virtual-list-phantom" :style="phantomStyle" />
    <div class="virtual-list-content" :style="contentStyle">
      <div
        v-for="item in visibleItems"
        :key="item.key"
        class="virtual-list-item"
        :style="{ height: `${itemHeight}px` }"
      >
        <slot :item="item.data" :index="item.index" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-list {
  position: relative;
  overflow: auto;
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.virtual-list-phantom {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-list-item {
  box-sizing: border-box;
}
</style>
