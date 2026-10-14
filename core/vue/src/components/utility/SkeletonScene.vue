<!--
SkeletonScene 场景骨架（块面渗入，可关动画）

preset: list | reader | hub | rows
-->
<template>
  <Flex
    vertical
    :gap="gap"
    class="skeleton-scene"
    data-part="skeleton-scene"
    role="status"
    aria-busy="true"
    aria-live="polite"
  >
    <span
      v-for="(b, i) in blocks"
      :key="i"
      class="skeleton-scene__block"
      :class="{ 'skeleton-scene__block--round': b.round }"
      :style="{
        height: b.h,
        width: b.w,
        animationDelay: animated ? `${Math.min(i, 6) * 40}ms` : undefined,
      }"
    />
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Flex } from '../layout';

export type SkeletonScenePreset = 'list' | 'reader' | 'hub' | 'rows';

type BlockSpec = { h: string; w: string; round?: boolean };

const props = withDefaults(
  defineProps<{
    preset?: SkeletonScenePreset;
    rows?: number;
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    animated?: boolean;
  }>(),
  {
    preset: 'rows',
    rows: 4,
    gap: 'md',
    animated: true,
  },
);

const blocks = computed((): BlockSpec[] => {
  switch (props.preset) {
    case 'hub':
      return [
        { h: '4rem', w: '100%' },
        { h: '2.5rem', w: '72%' },
        { h: '8rem', w: '100%' },
        { h: '8rem', w: '100%' },
      ];
    case 'reader':
      return [
        { h: '2.75rem', w: '2.75rem', round: true },
        { h: '1.75rem', w: '55%' },
        { h: '1rem', w: '40%' },
        { h: '6rem', w: '100%' },
        { h: '4rem', w: '100%' },
        { h: '10rem', w: '100%' },
      ];
    case 'list':
      return Array.from({ length: Math.max(3, props.rows) }, () => ({
        h: '3.25rem',
        w: '100%',
      }));
    default:
      return Array.from({ length: Math.max(1, props.rows) }, (_, i) => ({
        h: i === 0 ? '1.25rem' : '1rem',
        w: i % 3 === 2 ? '68%' : '100%',
      }));
  }
});
</script>
