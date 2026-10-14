<!--
NumberAnimation 组件

功能：实现数字从一个值到另一个值的平滑过渡动画

使用方式：
<NumberAnimation
  :from="0"
  :to="1000"
  :duration="1500"
  :decimals="2"
  prefix="$"
  suffix="元"
  separator=","
  @started="handleStarted"
  @finished="handleFinished"
/>

公开属性：
- from: 起始值，默认 0
- to: 目标值，必填
- duration: 动画持续时间（毫秒），默认 2000
- decimals: 小数位数，默认 0
- prefix: 前缀，默认 ''
- suffix: 后缀，默认 ''
- separator: 千位分隔符，默认 ','
- customClass: 自定义类名，默认 ''

处理器：
- started: 动画开始时触发
- finished: 动画结束时触发

暴露方法：
- animate: 开始动画
- reset: 重置动画
- currentValue: 当前动画值
-->
<template>
  <span :class="numberAnimationClass">{{ displayValue }}</span>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useTweenedValue } from '../../composables/useTweenedValue';

interface Props {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  from: 0,
  to: 0,
  duration: 2000,
  decimals: 0,
  prefix: '',
  suffix: '',
  separator: ',',
  customClass: '',
});

const emit = defineEmits<{
  started: [];
  finished: [];
}>();

const numberAnimationClass = computed(() => {
  const classes = ['number-animation'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

// 千位分隔：按整数段每 3 位插入 separator
const applyThousandSeparator = (intStr: string, separator: string): string =>
  intStr.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

const displayValue = computed(() => {
  const value = currentValue.value.toFixed(props.decimals);
  const parts = value.split('.');
  const integerPart = applyThousandSeparator(parts[0], props.separator);
  const formattedValue = parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  return `${props.prefix}${formattedValue}${props.suffix}`;
});

// 数值补间：统一 rAF 生命周期（卸载取消、SSR 安全、减动效直跳）
const {
  value: currentValue,
  play,
  snapTo,
  isAnimating,
} = useTweenedValue(toRef(props, 'to'), {
  initial: props.from,
  duration: toRef(props, 'duration'),
  easing: 'easeOutQuad',
  animateOnMount: true,
  onStart: () => emit('started'),
  onFinish: () => emit('finished'),
});

const animate = () => {
  if (isAnimating.value) return;
  play();
};

const reset = () => {
  snapTo(props.from);
};

defineExpose({
  animate,
  reset,
  currentValue,
});
</script>

<style scoped>
.number-animation {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-variant-numeric: tabular-nums;
}
</style>
