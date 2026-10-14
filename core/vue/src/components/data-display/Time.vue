<template>
  <div :class="timeClass">
    <span class="time-value">{{ displayTime }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

type TimeType = 'relative' | 'datetime' | 'date' | 'time';

interface Props {
  time?: Date | number | string;
  type?: TimeType;
  format?: string;
  interval?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  time: undefined,
  type: 'relative',
  format: 'YYYY-MM-DD HH:mm:ss',
  interval: 60000,
  customClass: '',
});

const now = ref(Date.now());
let timer: number | null = null;

const timeClass = computed(() => {
  const classes = ['time'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const timeValue = computed(() => {
  if (!props.time) return null;
  
  if (typeof props.time === 'string') {
    return new Date(props.time).getTime();
  }
  
  if (props.time instanceof Date) {
    return props.time.getTime();
  }
  
  return props.time;
});

const displayTime = computed(() => {
  if (!timeValue.value) return '-';
  
  switch (props.type) {
    case 'relative':
      return formatRelative(timeValue.value, now.value);
    case 'datetime':
      return formatDateTime(timeValue.value, props.format);
    case 'date':
      return formatDate(timeValue.value);
    case 'time':
      return formatTime(timeValue.value);
    default:
      return formatDateTime(timeValue.value, props.format);
  }
});

const formatRelative = (time: number, now: number): string => {
  const diff = now - time;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 30) {
    return `${days}天前`;
  } else if (months < 12) {
    return `${months}个月前`;
  } else {
    return `${years}年前`;
  }
};

const formatDateTime = (time: number, format: string): string => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

const formatDate = (time: number): string => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = (time: number): string => {
  const date = new Date(time);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const updateNow = () => {
  now.value = Date.now();
};

onMounted(() => {
  if (props.type === 'relative') {
    timer = window.setInterval(updateNow, props.interval);
  }
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

watch(() => props.type, (newType) => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  
  if (newType === 'relative') {
    timer = window.setInterval(updateNow, props.interval);
  }
});
</script>

<style scoped>
.time {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-variant-numeric: tabular-nums;
}

.time-value {
  font-size: inherit;
  color: hsl(var(--text));
}
</style>
