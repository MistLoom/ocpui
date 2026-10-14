&lt;!--
LoadingBar 加载条组件

属性：
- loading: 是否显示，默认值：false
- color: 加载条颜色，默认值：''
- height: 加载条高度，默认值：3
- customClass: 自定义类名，默认值：''

方法：
- start: 开始加载
- finish: 结束加载
- progress: 进度值（0-100）

使用方式：
&lt;LoadingBar
  v-model:loading="loading"
  color="hsl(var(--primary))"
  :height="2"
/&gt;
--&gt;
<template>
  <Teleport to="body">
    <Transition name="loading-bar">
      <div v-if="isLoading" class="loading-bar" :class="props.customClass" :style="loadingBarStyle">
        <div class="loading-bar-inner" :style="innerStyle"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
  loading?: boolean;
  color?: string;
  height?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  color: '',
  height: 3,
  customClass: '',
});

const progress = ref(0);
const isLoading = ref(false);

const loadingBarStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.color) {
    style['--loading-bar-color'] = props.color;
  }
  return style;
});

const innerStyle = computed(() => ({
  width: `${progress.value}%`,
  height: `${props.height}px`,
}));

const start = () => {
  isLoading.value = true;
  progress.value = 0;
  
  const timer = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 10;
    } else {
      clearInterval(timer);
    }
  }, 200);
};

const finish = () => {
  progress.value = 100;
  setTimeout(() => {
    isLoading.value = false;
    progress.value = 0;
  }, 300);
};

watch(() => props.loading, (val) => {
  if (val) {
    start();
  } else {
    finish();
  }
}, { immediate: true });

defineExpose({
  start,
  finish,
  progress,
});
</script>

<style scoped>
.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-toast);
  background: transparent;
}

.loading-bar-inner {
  background: var(--loading-bar-color, hsl(var(--primary)));
  transition: width 0.2s ease-out;
  box-shadow: 0 0 10px var(--loading-bar-color, hsl(var(--primary)));
}

.loading-bar-enter-active,
.loading-bar-leave-active {
  transition: opacity 0.3s;
}

.loading-bar-enter-from,
.loading-bar-leave-to {
  opacity: 0;
}
</style>
