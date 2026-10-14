<template>
  <div
    v-if="visible"
    class="doc-reading-progress"
    role="progressbar"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="doc-reading-progress__bar" :style="{ width: `${progress}%` }" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

interface Props {
  /** 显示阈值：滚动超过多少比例才开始显示（0–1） */
  threshold?: number;
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 0.02,
});

const progress = ref(0);
const visible = ref(false);

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) {
    progress.value = 0;
    visible.value = false;
    return;
  }
  const ratio = Math.min(1, Math.max(0, scrollTop / docHeight));
  progress.value = ratio * 100;
  visible.value = ratio > props.threshold;
}

let ticking = false;

function onScroll() {
  if (ticking) {
    return;
  }
  ticking = true;
  requestAnimationFrame(() => {
    updateProgress();
    ticking = false;
  });
}

onMounted(() => {
  updateProgress();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.doc-reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: calc(var(--z-sticky, 100) + 1);
  background: transparent;
  pointer-events: none;
}

.doc-reading-progress__bar {
  height: 100%;
  background: hsl(var(--primary));
  border-radius: 0 1px 1px 0;
  transition: width 80ms linear;
}
</style>
