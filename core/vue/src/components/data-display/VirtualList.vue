<script setup lang="ts" generic="T">
import { useVirtualizer } from '@tanstack/vue-virtual';
import { ref, computed } from 'vue';

interface Props<T> {
  items: T[];
  itemHeight?: number;
  overscan?: number;
  height?: string;
  width?: string;
}

const props = withDefaults(defineProps<Props<T>>(), {
  itemHeight: 40,
  overscan: 5,
  height: '400px',
  width: '100%',
});

const containerRef = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer({
  get count() {
    return props.items.length;
  },
  getScrollElement: () => containerRef.value,
  estimateSize: () => props.itemHeight,
  overscan: props.overscan,
});

const virtualItems = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

const scrollToIndex = (
  index: number,
  options?: { align?: 'start' | 'center' | 'end' | 'auto' }
) => {
  virtualizer.value.scrollToIndex(index, options);
};

const scrollToOffset = (offset: number) => {
  virtualizer.value.scrollToOffset(offset);
};

defineExpose({
  scrollToIndex,
  scrollToOffset,
  scrollTo: (index: number) => scrollToIndex(index),
  containerRef,
});
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :style="{ height, width }"
  >
    <div
      class="virtual-list-inner"
      :style="{
        height: `${totalSize}px`,
        width: '100%',
        position: 'relative',
      }"
    >
      <div
        v-for="item in virtualItems"
        :key="item.index"
        class="virtual-list-item"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${item.size}px`,
          transform: `translateY(${item.start}px)`,
        }"
        :data-index="item.index"
      >
        <slot :item="items[item.index]" :index="item.index" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-list {
  overflow: auto;
  contain: strict;
  min-height: 0;
}

.virtual-list-inner {
  contain: layout;
}

.virtual-list-item {
  contain: layout;
}
</style>
