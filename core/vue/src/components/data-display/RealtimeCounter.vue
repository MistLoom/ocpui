&lt;!--
实时计数器组件

Props:
- startTime?: Date | number - 开始时间，默认值：当前时间
- size?: 'sm' | 'md' | 'lg' - 尺寸，默认值：'md'
- format?: 'short' | 'long' | 'compact' - 时间格式，默认值：'long'
- autoUpdate?: boolean - 是否自动更新，默认值：true
- updateInterval?: number - 更新间隔（毫秒），默认值：1000

Exposed Methods:
- getElapsedSeconds(): number - 获取已过秒数
- getFormattedTime(): string - 获取格式化的时间
- refresh(): void - 手动刷新时间

Usage:
&lt;RealtimeCounter
  :startTime="startTime"
  :size="'lg'"
  :format="'long'"
/&gt;

&lt;RealtimeCounter
  :startTime="Date.now() - 3600000" // 1小时前
  :format="'compact'"
  :updateInterval="500"
/&gt;
--&gt;
<template>
  <span class="realtime-counter" :class="[`realtime-counter--${size}`]">
    {{ formattedTime }}
  </span>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

export interface RealtimeCounterProps {
  startTime?: Date | number;
  size?: 'sm' | 'md' | 'lg';
  format?: 'short' | 'long' | 'compact';
  autoUpdate?: boolean;
  updateInterval?: number;
}

const props = withDefaults(defineProps<RealtimeCounterProps>(), {
  startTime: () => new Date(),
  size: 'md',
  format: 'long',
  autoUpdate: true,
  updateInterval: 1000,
});

const now = ref(Date.now());
let intervalId: number | null = null;

const startTimestamp = computed(() => {
  if (props.startTime instanceof Date) {
    return props.startTime.getTime();
  }
  return props.startTime;
});

const elapsedSeconds = computed(() => {
  return Math.floor((now.value - startTimestamp.value) / 1000);
});

const timeParts = computed(() => {
  const totalSeconds = elapsedSeconds.value;
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
});

const formattedTime = computed(() => {
  const { days, hours, minutes, seconds } = timeParts.value;
  
  switch (props.format) {
    case 'short':
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m ${seconds}s`;
      
    case 'compact':
      if (days > 0) return `${days}天`;
      if (hours > 0) return `${hours}小时`;
      if (minutes > 0) return `${minutes}分钟`;
      return `${seconds}秒`;
      
    case 'long':
    default:
      const parts: string[] = [];
      if (days > 0) parts.push(`${days}天`);
      if (hours > 0 || days > 0) parts.push(`${String(hours).padStart(2, '0')}时`);
      parts.push(`${String(minutes).padStart(2, '0')}分`);
      parts.push(`${String(seconds).padStart(2, '0')}秒`);
      return parts.join(' ');
  }
});

onMounted(() => {
  if (props.autoUpdate) {
    intervalId = window.setInterval(() => {
      now.value = Date.now();
    }, props.updateInterval);
  }
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});

// 暴露方法供父组件使用
defineExpose({
  getElapsedSeconds: () => elapsedSeconds.value,
  getFormattedTime: () => formattedTime.value,
  refresh: () => { now.value = Date.now(); },
});
</script>

<script lang="ts">
export default { name: 'RealtimeCounter' };
</script>

<style scoped>
.realtime-counter {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: hsl(var(--text));
}

.realtime-counter--sm {
  font-size: 12px;
  font-weight: 500;
}

.realtime-counter--md {
  font-size: 14px;
  font-weight: 600;
}

.realtime-counter--lg {
  font-size: 18px;
  font-weight: 700;
}
</style>
