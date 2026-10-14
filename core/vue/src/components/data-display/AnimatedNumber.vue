&lt;!--
动画数字组件

Props:
- value: number - 目标数值
- duration?: number - 动画时长（毫秒），默认值：800
- format?: (value: number) =&gt; string - 数值格式化函数，默认值：使用 toLocaleString('zh-CN')

Usage:
&lt;AnimatedNumber :value="12345" /&gt;

&lt;AnimatedNumber
  :value="67.89"
  :duration="1000"
  :format="(value) =&gt; value.toFixed(2) + '%'"
/&gt;
--&gt;
<template>
  <span class="animated-number">{{ displayValue }}</span>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useTweenedValue } from '../../composables/useTweenedValue';

interface Props {
  value: number;
  duration?: number;
  format?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 800,
  format: (value: number) => value.toLocaleString('zh-CN')
});

// 数值补间：挂载从 0 动到目标（统一 rAF 生命周期，卸载取消、SSR 安全、减动效直跳）
const { value: currentValue } = useTweenedValue(toRef(props, 'value'), {
  initial: 0,
  duration: toRef(props, 'duration'),
  easing: 'easeOutQuart',
  animateOnMount: true,
});

const displayValue = computed(() => props.format(currentValue.value));
</script>

<style scoped>
.animated-number {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}
</style>
