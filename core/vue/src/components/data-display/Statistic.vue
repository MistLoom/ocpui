<template>
  <div :class="statisticClass" v-bind="$attrs">
    <!-- 标题 -->
    <div v-if="title || $slots.title" class="statistic-title">
      <slot name="title">{{ title }}</slot>
    </div>

    <!-- 数值 -->
    <div class="statistic-content">
      <!-- 前缀 -->
      <span v-if="prefix || $slots.prefix" class="statistic-prefix">
        <slot name="prefix">{{ prefix }}</slot>
      </span>

      <!-- 数字 -->
      <span class="statistic-value" :style="valueStyle">
        <slot name="value" :value="displayValue">
          {{ formattedValue }}
        </slot>
      </span>

      <!-- 后缀 -->
      <span v-if="suffix || $slots.suffix" class="statistic-suffix">
        <slot name="suffix">{{ suffix }}</slot>
      </span>
    </div>

    <!-- 趋势指示器 -->
    <div v-if="trend !== undefined || $slots.trend" class="statistic-trend">
      <slot name="trend" :trend="trend" :trendValue="trendValue">
        <template v-if="trend !== undefined">
          <span :class="trendClass">
            <Icon :name="trendIcon" :size="14" />
            <span>{{ Math.abs(trendValue || 0) }}%</span>
          </span>
          <span v-if="trendLabel" class="statistic-trend-label">{{ trendLabel }}</span>
        </template>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../utility/Icon.vue';
import { useTweenedValue } from '../../composables/useTweenedValue';

interface Props {
  title?: string;
  value?: number | string;
  prefix?: string;
  suffix?: string;
  precision?: number;
  formatter?: (value: number) => string;
  groupSeparator?: string;
  decimalSeparator?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  trendLabel?: string;
  valueStyle?: Record<string, string>;
  customClass?: string;
  // 动画相关
  animation?: boolean;
  animationDuration?: number;
  // 加载状态
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  precision: 0,
  groupSeparator: ',',
  decimalSeparator: '.',
  trend: undefined,
  animation: true,
  animationDuration: 1000,
  loading: false,
});

// 将值转换为数字
const numericValue = computed(() => {
  const val = typeof props.value === 'string' ? parseFloat(props.value) : props.value;
  return isNaN(val) ? 0 : val;
});

// 数值补间：rAF 统一收口（卸载自动取消、SSR 安全、减动效直跳目标值）；
// animation 关闭时补间时长为 0
const { value: displayValue } = useTweenedValue(numericValue, {
  duration: computed(() => (props.animation ? props.animationDuration : 0)),
  easing: 'easeOutQuart',
});

// 格式化数值
const formattedValue = computed(() => {
  if (props.formatter) {
    return props.formatter(displayValue.value);
  }

  const value = displayValue.value;
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  // 分割整数和小数部分
  const [intPart, decPart] = absValue.toFixed(props.precision).split('.');

  // 添加千位分隔符
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, props.groupSeparator);

  // 组合结果
  let result = formattedInt;
  if (props.precision > 0) {
    result += props.decimalSeparator + decPart;
  }

  return isNegative ? '-' + result : result;
});

// 类名计算
const statisticClass = computed(() => {
  const classes = ['statistic'];
  if (props.loading) {
    classes.push('statistic--loading');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

// 趋势图标和类名
const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up': return 'trending-up';
    case 'down': return 'trending-down';
    default: return 'minus';
  }
});

const trendClass = computed(() => {
  const classes = ['statistic-trend-value'];
  switch (props.trend) {
    case 'up':
      classes.push('statistic-trend--up');
      break;
    case 'down':
      classes.push('statistic-trend--down');
      break;
    default:
      classes.push('statistic-trend--neutral');
  }
  return classes;
});

</script>

<style scoped>
.statistic {
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.statistic-title {
  font-size: 14px;
  color: hsl(var(--text-muted));
  font-weight: 500;
}

.statistic-content {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1.2;
}

.statistic-prefix,
.statistic-suffix {
  font-size: 16px;
  color: hsl(var(--text-muted));
  font-weight: 500;
}

.statistic-value {
  font-size: 32px;
  font-weight: 700;
  color: hsl(var(--text));
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  transition: color 0.2s var(--ease-out);
}

.statistic-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.statistic-trend-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.statistic-trend--up {
  color: hsl(var(--success));
  background: hsl(var(--success) / 0.1);
}

.statistic-trend--down {
  color: hsl(var(--error));
  background: hsl(var(--error) / 0.1);
}

.statistic-trend--neutral {
  color: hsl(var(--text-muted));
  background: hsl(var(--border));
}

.statistic-trend-label {
  color: hsl(var(--text-muted));
}

/* 加载状态 */
.statistic--loading {
  pointer-events: none;
}

.statistic--loading .statistic-value {
  background: linear-gradient(
    90deg,
    hsl(var(--border)) 25%,
    hsl(var(--surface-container-high)) 50%,
    hsl(var(--border)) 75%
  );
  background-size: 200% 100%;
  animation: statistic-loading 1.5s infinite;
  color: transparent;
  border-radius: 4px;
}

@keyframes statistic-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 尺寸变体 */
.statistic--small .statistic-value {
  font-size: 24px;
}

.statistic--large .statistic-value {
  font-size: 48px;
}
</style>
