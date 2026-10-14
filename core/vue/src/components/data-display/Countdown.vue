&lt;!--
倒计时组件

Props:
- value?: number - 倒计时秒数，默认值：0
- format?: string - 时间格式，默认值：'HH:mm:ss'
- prefix?: string - 前缀
- suffix?: string - 后缀
- showZero?: boolean - 是否显示前导零，默认值：true
- customClass?: string - 自定义类名

Events:
- update:value: (value: number) - 剩余时间变化事件
- finish: [] - 倒计时结束事件

Exposed Methods:
- start() - 开始倒计时
- pause() - 暂停倒计时
- reset(value?: number) - 重置倒计时

Usage:
&lt;Countdown
  v-model="countdownValue"
  format="HH:mm:ss"
  @finish="handleFinish"
/&gt;
--&gt;
<template>
  <div :class="countdownClass" v-bind="$attrs" role="timer" aria-live="polite">
    <span v-if="prefix" class="countdown-prefix">{{ prefix }}</span>
    <div class="countdown-inner">
      <div
        v-for="(item, index) in timeData"
        :key="index"
        class="countdown-item"
        role="group"
        :aria-label="`${item.label}: ${item.value}`"
      >
        <div class="countdown-item-value">{{ item.value }}</div>
        <div v-if="item.label" class="countdown-item-label">{{ item.label }}</div>
      </div>
    </div>
    <span v-if="suffix" class="countdown-suffix">{{ suffix }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  value?: number;
  format?: string;
  prefix?: string;
  suffix?: string;
  showZero?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  format: 'HH:mm:ss',
  prefix: '',
  suffix: '',
  showZero: true,
  customClass: '',
});

const emit = defineEmits<{
  'update:value': [value: number];
  'finish': [];
}>();

const remainingTime = ref(Math.max(0, props.value));
const timer = ref<number | null>(null);
const isPaused = ref(false);

const countdownClass = computed(() => {
  const classes = ['countdown'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const timeData = computed(() => {
  const data: Array<{ value: string; label?: string }> = [];
  let time = remainingTime.value;
  
  const format = props.format;
  const hasHour = format.includes('HH') || format.includes('hh');
  const hasMinute = format.includes('mm');
  const hasSecond = format.includes('ss');
  
  if (hasHour) {
    const hours = Math.floor(time / 3600);
    data.push({
      value: props.showZero ? String(hours).padStart(2, '0') : String(hours),
      label: '时'
    });
    time %= 3600;
  }
  
  if (hasMinute) {
    const minutes = Math.floor(time / 60);
    data.push({
      value: props.showZero ? String(minutes).padStart(2, '0') : String(minutes),
      label: '分'
    });
    time %= 60;
  }
  
  if (hasSecond) {
    const seconds = Math.floor(time);
    data.push({
      value: props.showZero ? String(seconds).padStart(2, '0') : String(seconds),
      label: '秒'
    });
  }
  
  return data;
});

const startTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  
  isPaused.value = false;
  timer.value = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
      emit('update:value', remainingTime.value);
    } else {
      clearInterval(timer.value!);
      timer.value = null;
      emit('finish');
    }
  }, 1000);
};

const pauseTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
    isPaused.value = true;
  }
};

const resetTimer = (value?: number) => {
  const newTime = value !== undefined ? Math.max(0, value) : Math.max(0, props.value);
  remainingTime.value = newTime;
  emit('update:value', remainingTime.value);
  
  if (newTime > 0 && !isPaused.value) {
    startTimer();
  } else {
    pauseTimer();
  }
};

watch(() => props.value, (newValue) => {
  const newTime = Math.max(0, newValue);
  remainingTime.value = newTime;
  if (newTime > 0 && !isPaused.value) {
    startTimer();
  } else {
    pauseTimer();
  }
}, { immediate: true });

onMounted(() => {
  if (remainingTime.value > 0 && !isPaused.value) {
    startTimer();
  }
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
});

defineExpose({
  start: startTimer,
  pause: pauseTimer,
  reset: resetTimer,
  remainingTime
});
</script>

<style scoped>
.countdown {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  display: inline-flex;
  align-items: center;
}

.countdown-inner {
  display: flex;
  align-items: center;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 4px;
}

.countdown-item-value {
  font-size: 20px;
  font-weight: 700;
  color: hsl(var(--text));
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 48px;
  text-align: center;
}

.countdown-item-label {
  font-size: 12px;
  color: hsl(var(--text-muted));
  margin-top: 4px;
}

.countdown-item:first-child {
  margin-left: 0;
}

.countdown-item:last-child {
  margin-right: 0;
}

.countdown-prefix,
.countdown-suffix {
  font-size: 16px;
  color: hsl(var(--text));
  margin: 0 8px;
}

.countdown-prefix {
  margin-left: 0;
}

.countdown-suffix {
  margin-right: 0;
}
</style>