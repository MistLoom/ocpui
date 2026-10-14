<template>
  <span :class="spinnerClass" :style="spinnerStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  thickness?: number;
  speed?: 'fast' | 'normal' | 'slow';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'currentColor',
  thickness: 2,
  speed: 'normal',
  customClass: '',
});

const sizeMap: Record<string, string> = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '28px',
  xl: '40px',
};

const speedMap: Record<string, string> = {
  fast: '0.5s',
  normal: '0.8s',
  slow: '1.2s',
};

const spinnerClass = computed(() => {
  return ['loading-spinner', props.customClass].filter(Boolean).join(' ');
});

const spinnerStyle = computed(() => {
  return {
    width: sizeMap[props.size],
    height: sizeMap[props.size],
    borderWidth: `${props.thickness}px`,
    borderColor: `${props.color} transparent transparent transparent`,
    animationDuration: speedMap[props.speed],
  };
});
</script>

<style scoped>
.loading-spinner {
  display: inline-block;
  border-style: solid;
  border-radius: 50%;
  animation: loading-spin 0.8s linear infinite;
  box-sizing: border-box;
}

@keyframes loading-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
