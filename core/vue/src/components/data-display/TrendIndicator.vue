<template>
  <div :class="trendClass">
    <Icon :name="iconName" :size="iconSize" />
    <span v-if="showValue" class="trend-value">{{ formattedValue }}</span>
    <span v-if="label" class="trend-label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '../utility';

type TrendDirection = 'up' | 'down' | 'stable' | 'neutral';

interface Props {
  /** 趋势方向 (推荐使用) */
  trend?: TrendDirection;
  /** 趋势方向 (兼容旧版本，与trend二选一) */
  direction?: TrendDirection;
  /** 变化百分比值 */
  value?: number;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示数值 */
  showValue?: boolean;
  /** 标签文字 */
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  size: 'md',
  showValue: true,
});

// 计算实际的趋势方向 (兼容 direction 和 trend 两种属性)
const actualTrend = computed<TrendDirection>(() => {
  const dir = props.direction || props.trend || 'stable';
  // 将 neutral 映射为 stable
  return dir === 'neutral' ? 'stable' : dir;
});

const trendClass = computed(() => {
  const classes = ['trend-indicator', `trend-indicator--${actualTrend.value}`, `trend-indicator--${props.size}`];
  return classes;
});

const iconName = computed(() => {
  const iconMap: Record<TrendDirection, string> = {
    up: 'trending-up',
    down: 'trending-down',
    stable: 'minus',
    neutral: 'minus',
  };
  return iconMap[actualTrend.value];
});

const iconSize = computed(() => {
  const sizeMap = { sm: 12, md: 16, lg: 20 };
  return sizeMap[props.size];
});

const formattedValue = computed(() => {
  const prefix = props.value > 0 ? '+' : '';
  return `${prefix}${props.value}%`;
});
</script>

<style scoped>
.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.trend-indicator--up {
  color: hsl(142, 76%, 36%);
}

.trend-indicator--down {
  color: hsl(0, 84%, 60%);
}

.trend-indicator--stable {
  color: hsl(var(--text-muted));
}

.trend-indicator--sm {
  font-size: 12px;
}

.trend-indicator--md {
  font-size: 14px;
}

.trend-indicator--lg {
  font-size: 16px;
}

.trend-value {
  font-variant-numeric: tabular-nums;
}

.trend-label {
  font-size: 0.9em;
  color: hsl(var(--text-muted));
  margin-left: 4px;
}
</style>
