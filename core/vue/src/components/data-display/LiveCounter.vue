<!--
LiveCounter 实时计数器组件

## 组件说明
实时计数器组件，用于显示系统运行时间或其他实时计数

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| bootTime | string \| number | - | 启动时间 (ISO字符串或时间戳) |
| showBootTime | boolean | true | 是否显示启动时间 |
| bootLabel | string | '启动于:' | 启动时间标签 |
| dateFormat | 'locale' \| 'iso' \| 'custom' | 'locale' | 日期时间格式 |
| customDateFormat | string | '' | 自定义日期格式 |

## 事件
无

## 使用示例
```vue
<template>
  <LiveCounter
    :bootTime="serverBootTime"
    :showBootTime="true"
    dateFormat="locale"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LiveCounter from './LiveCounter.vue';

// 假设服务器启动时间
const serverBootTime = ref('2023-01-01T00:00:00Z');
</script>
```
-->
<template>
  <div class="live-counter">
    <div class="time-display">
      <template v-for="(part, index) in timeParts" :key="index">
        <span class="time-unit">
          <span class="time-value" :class="{ 'time-value--changed': changedIndex === index }">
            {{ part.value.toString().padStart(2, '0') }}
          </span>
          <span class="time-label">{{ part.label }}</span>
        </span>
        <span v-if="index < timeParts.length - 1" class="time-separator">:</span>
      </template>
    </div>
    <div v-if="showBootTime && bootTime" class="boot-time">
      <span class="boot-label">{{ bootLabel }}</span>
      <span class="boot-value">{{ formattedBootTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface LiveCounterProps {
  /** 启动时间 (ISO字符串或时间戳) */
  bootTime: string | number;
  /** 是否显示启动时间 */
  showBootTime?: boolean;
  /** 启动时间标签 */
  bootLabel?: string;
  /** 日期时间格式 */
  dateFormat?: 'locale' | 'iso' | 'custom';
  /** 自定义日期格式 */
  customDateFormat?: string;
}

const props = withDefaults(defineProps<LiveCounterProps>(), {
  showBootTime: true,
  bootLabel: '启动于:',
  dateFormat: 'locale'
});

// 当前时间
const now = ref(Date.now());
const changedIndex = ref<number | null>(null);
let intervalId: ReturnType<typeof setInterval> | null = null;

// 计算运行时间（秒）
const uptimeSeconds = computed(() => {
  const bootTime = typeof props.bootTime === 'string'
    ? new Date(props.bootTime).getTime()
    : props.bootTime;
  return Math.max(0, Math.floor((now.value - bootTime) / 1000));
});

// 计算时间各部分
const timeParts = computed(() => {
  const seconds = uptimeSeconds.value;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];

  if (days > 0 || props.showBootTime) {
    parts.push({ value: days, label: '天' });
  }
  parts.push(
    { value: hours, label: '时' },
    { value: minutes, label: '分' },
    { value: secs, label: '秒' }
  );

  return parts;
});

// 格式化启动时间
const formattedBootTime = computed(() => {
  const bootTime = typeof props.bootTime === 'string'
    ? new Date(props.bootTime)
    : new Date(props.bootTime);

  switch (props.dateFormat) {
    case 'iso':
      return bootTime.toISOString();
    case 'custom':
      // 简单的自定义格式支持
      return formatCustomDate(bootTime, props.customDateFormat || 'YYYY-MM-DD HH:mm:ss');
    case 'locale':
    default:
      return bootTime.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
  }
});

// 简单的自定义日期格式化
const formatCustomDate = (date: Date, format: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
};

// 启动定时器
onMounted(() => {
  let lastSeconds = uptimeSeconds.value;

  intervalId = setInterval(() => {
    now.value = Date.now();
    const currentSeconds = uptimeSeconds.value;

    // 检测哪个部分发生了变化
    if (currentSeconds !== lastSeconds) {
      const lastSecs = lastSeconds % 60;
      const currentSecs = currentSeconds % 60;
      const lastMins = Math.floor((lastSeconds % 3600) / 60);
      const currentMins = Math.floor((currentSeconds % 3600) / 60);
      const lastHours = Math.floor((lastSeconds % 86400) / 3600);
      const currentHours = Math.floor((currentSeconds % 86400) / 3600);

      if (currentSecs !== lastSecs) {
        changedIndex.value = timeParts.value.length - 1; // 秒
      } else if (currentMins !== lastMins) {
        changedIndex.value = timeParts.value.length - 2; // 分
      } else if (currentHours !== lastHours) {
        changedIndex.value = timeParts.value.length - 3; // 时
      }

      // 清除变化标记
      setTimeout(() => {
        changedIndex.value = null;
      }, 300);

      lastSeconds = currentSeconds;
    }
  }, 1000);
});

// 清理定时器
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.live-counter {
  font-family: var(--font-mono, 'SF Mono', Monaco, monospace);
}

.time-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 32px;
  font-weight: 700;
  color: hsl(var(--text));
  line-height: 1.2;
}

.time-unit {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.time-value {
  font-variant-numeric: tabular-nums;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.time-value--changed {
  color: hsl(var(--primary));
  transform: scale(1.05);
}

.time-label {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
}

.time-separator {
  color: hsl(var(--text-muted));
  margin: 0 2px;
}

.boot-time {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
}

.boot-label {
  color: hsl(var(--text-secondary));
}

.boot-value {
  color: hsl(var(--text-muted));
  font-family: var(--font-mono, 'SF Mono', Monaco, monospace);
}

/* 响应式 */
@media (max-width: 639.98px) {
  .time-display {
    font-size: 24px;
  }

  .time-label {
    font-size: 12px;
  }

  .boot-time {
    font-size: 11px;
  }
}
</style>
