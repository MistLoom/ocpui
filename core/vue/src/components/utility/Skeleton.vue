<!--
Skeleton 骨架屏组件

功能：在内容加载完成前显示占位符，提升加载体验

公开属性：
- rows: number - 占位行数，默认值：1
- animated: boolean - 是否显示动画效果，默认值：true
- type: SkeletonType - 占位形状，可选值：text, circle, rect，默认值：text
- width: string - 自定义宽度（CSS 单位），默认：100%
- height: string - 自定义高度（CSS 单位），默认：1em
- gap: number - 多行之间的间距（px），默认值：8
- customClass: string - 自定义类名，默认值：''

使用方式：
  <!-- 文本骨架 -->
  <Skeleton :rows="3" animated />

  <!-- 圆形头像骨架 -->
  <Skeleton type="circle" width="48px" height="48px" />

  <!-- 矩形骨架 -->
  <Skeleton type="rect" width="100%" height="120px" />
-->
<template>
  <div :class="rootClass">
    <span
      v-for="(_, i) in rowList"
      :key="i"
      :class="['skeleton-item', `skeleton-${type}`]"
      :style="itemStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type SkeletonType = 'text' | 'circle' | 'rect';

interface Props {
  rows?: number;
  animated?: boolean;
  type?: SkeletonType;
  width?: string;
  height?: string;
  gap?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 1,
  animated: true,
  type: 'text',
  width: '100%',
  height: '1em',
  gap: 8,
  customClass: '',
});

const rowList = computed(() => Array.from({ length: Math.max(1, props.rows) }, (_, i) => i));

const rootClass = computed(() => [
  'skeleton',
  props.animated ? 'skeleton-animated' : '',
  props.customClass,
]);

const itemStyle = computed(() => ({
  width: props.width,
  height: props.height,
  marginBottom: `${props.gap}px`,
}));
</script>

<style scoped>
.skeleton {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.skeleton-item {
  display: block;
  background: hsl(var(--surface-container));
  border-radius: var(--radius-sm, 4px);
}

.skeleton-text {
  border-radius: var(--radius-sm, 4px);
  height: 1em;
}

.skeleton-circle {
  border-radius: 50%;
}

.skeleton-rect {
  border-radius: var(--radius-md, 6px);
}

.skeleton-animated .skeleton-item {
  position: relative;
  overflow: hidden;
}

.skeleton-animated .skeleton-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    hsl(var(--surface-container-high) / 0.6),
    transparent
  );
  transform: translateX(-100%);
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
