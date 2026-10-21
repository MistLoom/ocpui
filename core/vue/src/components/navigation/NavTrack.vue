<!--
NavTrack：滑动指示导航轨道（胶囊 / 底线）
子项标记 data-ocp-nav-item（兼容 data-flow-nav-item）；激活项 .is-active 或 data-active="true"
-->
<template>
  <div
    ref="trackRef"
    class="ocp-nav-track flow-nav-track"
    :class="[`ocp-nav-track--${indicator}`]"
    data-part="nav-track"
  >
    <div
      class="ocp-nav-track__ink flow-nav-ink"
      data-part="nav-ink"
      :style="indicatorStyle"
      aria-hidden="true"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
  useTemplateRef,
} from 'vue';
import { useSlidingIndicator } from '../../composables/useSlidingIndicator';
import type { NavTrackIndicator } from './types';

const props = withDefaults(
  defineProps<{
    /** 路由或列表变化时触发重测 */
    watchKey?: string | number | null;
    /** pill：顶栏胶囊；underline：底线（筛选条 ink 模式可覆写样式） */
    indicator?: NavTrackIndicator;
  }>(),
  {
    watchKey: null,
    indicator: 'pill',
  },
);

const trackRef = useTemplateRef<HTMLElement>('trackRef');
const activeEl = ref<HTMLElement | null>(null);
let mo: MutationObserver | null = null;

const ITEM_SELECTOR =
  '[data-ocp-nav-item][data-active="true"], [data-ocp-nav-item].is-active, ' +
  '[data-flow-nav-item][data-active="true"], [data-flow-nav-item].is-active';

function resolveActive() {
  const track = trackRef.value;
  if (!track) {
    activeEl.value = null;
    return;
  }
  activeEl.value = track.querySelector(ITEM_SELECTOR) as HTMLElement | null;
}

const { indicatorStyle, update } = useSlidingIndicator(trackRef, activeEl);

function refresh() {
  resolveActive();
  update();
}

function refreshAfterPaint() {
  nextTick(() => {
    refresh();
    requestAnimationFrame(refresh);
  });
}

function bindMutationObserver() {
  mo?.disconnect();
  mo = null;
  const track = trackRef.value;
  if (!track || typeof MutationObserver === 'undefined') return;
  mo = new MutationObserver(() => refreshAfterPaint());
  mo.observe(track, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'data-active', 'aria-selected', 'aria-current'],
  });
}

onMounted(() => {
  refreshAfterPaint();
  bindMutationObserver();
});

onBeforeUnmount(() => {
  mo?.disconnect();
  mo = null;
});

watch(
  () => props.watchKey,
  () => refreshAfterPaint(),
  { flush: 'post' },
);

defineExpose({ refresh: refreshAfterPaint });
</script>
