<!--
GaugeChart 仪表盘组件

## 组件说明
仪表盘组件，用于展示数值，支持颜色渐变和动画效果

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | number | - | 当前值 |
| min | number | 0 | 最小值 |
| max | number | 10 | 最大值 |
| size | number | 160 | 尺寸 |
| strokeWidth | number | 12 | 线宽 |
| decimals | number | 1 | 小数位数 |
| unit | string | '' | 单位 |
| label | string | '' | 标签 |
| showTicks | boolean | true | 是否显示刻度 |
| tickCount | number | 6 | 刻度数量 |
| tickWidth | number | 2 | 刻度宽度 |
| showTooltip | boolean | true | 是否显示tooltip |
| tooltipLabel | string | '' | tooltip标签 |
| needleColor | string | 'hsl(var(--text))' | 指针颜色 |
| needleCenterColor | string | 'hsl(var(--primary))' | 指针中心颜色 |
| needleWidth | number | 3 | 指针宽度 |
| needleCenterRadius | number | 6 | 指针中心半径 |
| trackColor | string | 'hsl(var(--surface-inset))' | 轨道颜色 |
| colorFn | (value: number, min: number, max: number) => string | undefined | 自定义颜色函数 |

## 事件
无

## 使用示例
```vue
<template>
  <GaugeChart
    :value="score"
    :min="0"
    :max="100"
    :size="200"
    unit="%"
    label="完成率"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GaugeChart from './GaugeChart.vue';

const score = ref(85);
</script>
```
-->
<template>
  <div class="gauge-chart" :style="{ width: `${size}px` }">
    <div class="gauge-chart__plot" :style="{ height: `${plotHeight}px` }">
      <svg
        :width="size"
        :height="plotHeight"
        :viewBox="`0 0 ${size} ${plotHeight}`"
        class="gauge-svg"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <!-- 背景弧 -->
        <path
          :d="backgroundArcPath"
          fill="none"
          :stroke="trackColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
        />

        <!-- 进度弧 -->
        <path
          :d="progressArcPath"
          fill="none"
          :stroke="progressColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          class="progress-arc"
        />

        <!-- 刻度线 -->
        <g v-if="showTicks">
          <line
            v-for="tick in ticks"
            :key="tick.angle"
            :x1="tick.x1"
            :y1="tick.y1"
            :x2="tick.x2"
            :y2="tick.y2"
            stroke="hsl(var(--border))"
            :stroke-width="tickWidth"
          />
        </g>

        <!-- 指针 -->
        <g :transform="`rotate(${needleAngle}, ${centerX}, ${centerY})`">
          <line
            :x1="centerX"
            :y1="centerY"
            :x2="needleX"
            :y2="needleY"
            :stroke="needleColor"
            :stroke-width="needleWidth"
            stroke-linecap="round"
          />
          <circle
            :cx="centerX"
            :cy="centerY"
            :r="needleCenterRadius"
            :fill="needleCenterColor"
          />
        </g>
      </svg>

      <!-- 数值：置于半圆中部，避免与轴心重叠 -->
      <div class="gauge-value" :style="valueStyle">
        <span
          class="value-number"
          :style="{ color: progressColor, fontSize: `${valueFontSize}px` }"
        >
          {{ displayValue.toFixed(decimals) }}
        </span>
        <span v-if="unit" class="value-unit">{{ unit }}</span>
      </div>
    </div>

    <FloatingHint
      :visible="showTooltip && isHovered"
      :anchor="tooltipAnchor"
      variant="panel"
      placement="top"
    >
      <div class="gauge-hint__label">{{ tooltipLabel || label }}</div>
      <div class="gauge-hint__value" :style="{ color: progressColor }">
        {{ value.toFixed(decimals) }}{{ unit }}
      </div>
      <div v-if="max > min" class="gauge-hint__range">
        {{ t('components.dataDisplay.gaugeChart.range', { min, max, unit }) }}
      </div>
    </FloatingHint>

    <div v-if="label" class="gauge-label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import FloatingHint from '../feedback/FloatingHint.vue';
import { useTweenedValue } from '../../composables/useTweenedValue';
import type { VirtualAnchor } from '../composables/useFloatingPosition';

const { uiT: t } = useUiT();

export interface GaugeChartProps {
  /** 当前值 */
  value: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 尺寸 */
  size?: number;
  /** 线宽 */
  strokeWidth?: number;
  /** 小数位数 */
  decimals?: number;
  /** 单位 */
  unit?: string;
  /** 标签 */
  label?: string;
  /** 是否显示刻度 */
  showTicks?: boolean;
  /** 刻度数量 */
  tickCount?: number;
  /** 刻度宽度 */
  tickWidth?: number;
  /** 是否显示tooltip */
  showTooltip?: boolean;
  /** tooltip标签 */
  tooltipLabel?: string;
  /** 指针颜色 */
  needleColor?: string;
  /** 指针中心颜色 */
  needleCenterColor?: string;
  /** 指针宽度 */
  needleWidth?: number;
  /** 指针中心半径 */
  needleCenterRadius?: number;
  /** 轨道颜色 */
  trackColor?: string;
  /** 自定义颜色函数 */
  colorFn?: (value: number, min: number, max: number) => string;
}

const props = withDefaults(defineProps<GaugeChartProps>(), {
  min: 0,
  max: 10,
  size: 160,
  strokeWidth: 12,
  decimals: 1,
  unit: '',
  label: '',
  showTicks: true,
  tickCount: 4,
  tickWidth: 2,
  showTooltip: true,
  tooltipLabel: '',
  needleColor: 'hsl(var(--text))',
  needleCenterColor: 'hsl(var(--primary))',
  needleWidth: 3,
  needleCenterRadius: 6,
  trackColor: 'hsl(var(--surface-inset))',
  colorFn: undefined,
});

// 数值补间：挂载即显目标值，value 变化时 800ms 过渡（统一 rAF 生命周期）
const { value: animatedValue } = useTweenedValue(() => props.value, {
  duration: 800,
  easing: 'easeOutQuart',
});
const isHovered = ref(false);
const tooltipAnchor = ref<VirtualAnchor | null>(null);

// 顶部留白：round stroke 与刻度不被裁切
const topPad = computed(() => Math.ceil(props.strokeWidth / 2) + 4);
const plotHeight = computed(() => props.size / 2 + topPad.value);

// 半圆轴心：底边中点
const centerX = computed(() => props.size / 2);
const centerY = computed(() => props.size / 2 + topPad.value - Math.ceil(props.strokeWidth / 2));
const radius = computed(() => props.size / 2 - props.strokeWidth);

// 计算显示值
const displayValue = computed(() => animatedValue.value);

// 动画同步的百分比（指针/进度弧跟随 animatedValue）
const animatedPercentage = computed(() => {
  const range = props.max - props.min;
  if (range === 0) return 0;
  return Math.max(0, Math.min(1, (animatedValue.value - props.min) / range));
});

// 计算颜色（默认按百分比分档，兼容 0–100 与任意 min/max）
const progressColor = computed(() => {
  if (props.colorFn) {
    return props.colorFn(props.value, props.min, props.max);
  }
  const pct = animatedPercentage.value * 100;
  if (pct < 40) return 'hsl(0, 84%, 60%)';
  if (pct < 60) return 'hsl(38, 92%, 50%)';
  if (pct < 80) return 'hsl(217, 91%, 60%)';
  return 'hsl(142, 76%, 36%)';
});

// 计算角度（从左侧180度到右侧0度）
const startAngle = Math.PI;
const endAngle = 0;

// 计算指针角度
const needleAngle = computed(() => {
  const angle = startAngle - animatedPercentage.value * Math.PI;
  return (angle * 180) / Math.PI;
});

// 计算指针终点
const needleLength = computed(() => radius.value * 0.85);
const needleX = computed(() => {
  const angle = startAngle - animatedPercentage.value * Math.PI;
  return centerX.value + needleLength.value * Math.cos(angle);
});
const needleY = computed(() => {
  const angle = startAngle - animatedPercentage.value * Math.PI;
  return centerY.value - needleLength.value * Math.sin(angle);
});

// 生成弧线路径
function arcPath(startAngle: number, endAngle: number, radius: number): string {
  const x1 = centerX.value + radius * Math.cos(startAngle);
  const y1 = centerY.value - radius * Math.sin(startAngle);
  const x2 = centerX.value + radius * Math.cos(endAngle);
  const y2 = centerY.value - radius * Math.sin(endAngle);
  
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
  
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
}

// 背景弧路径
const backgroundArcPath = computed(() => arcPath(startAngle, endAngle, radius.value));

// 进度弧路径
const progressArcPath = computed(() => {
  const currentAngle = startAngle - animatedPercentage.value * Math.PI;
  return arcPath(startAngle, currentAngle, radius.value);
});

// 生成刻度
const ticks = computed(() => {
  const ticksList = [];
  const tickLength = 6;
  
  for (let i = 0; i <= props.tickCount; i++) {
    const tickPercentage = i / props.tickCount;
    const angle = startAngle - tickPercentage * Math.PI;
    
    const innerRadius = radius.value - tickLength;
    const outerRadius = radius.value + 2;
    
    ticksList.push({
      angle,
      x1: centerX.value + innerRadius * Math.cos(angle),
      y1: centerY.value - innerRadius * Math.sin(angle),
      x2: centerX.value + outerRadius * Math.cos(angle),
      y2: centerY.value - outerRadius * Math.sin(angle),
    });
  }
  
  return ticksList;
});

// 数值区：半圆中部
const valueStyle = computed(() => ({
  top: `${centerY.value - radius.value * 0.45}px`,
  left: '50%',
  transform: 'translate(-50%, -50%)',
}));

const valueFontSize = computed(() =>
  Math.max(15, Math.min(20, Math.round(props.size * 0.17))),
);

// 鼠标移动处理
const handleMouseMove = (event: MouseEvent) => {
  tooltipAnchor.value = { x: event.clientX, y: event.clientY };
  isHovered.value = true;
};

// 鼠标离开处理
const handleMouseLeave = () => {
  isHovered.value = false;
  tooltipAnchor.value = null;
};

</script>

<style scoped>
.gauge-chart {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.gauge-chart__plot {
  position: relative;
  width: 100%;
}

.gauge-svg {
  display: block;
  overflow: visible;
}

.progress-arc {
  transition: stroke 0.3s ease;
}

.gauge-value {
  position: absolute;
  display: flex;
  align-items: baseline;
  gap: 4px;
  pointer-events: none;
  white-space: nowrap;
}

.gauge-label {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  text-align: center;
  line-height: 1.2;
}

.value-number {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: color 0.3s ease;
}

.value-unit {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}

.gauge-hint__label {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 4px;
}

.gauge-hint__value {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.gauge-hint__range {
  font-size: 10px;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid hsl(var(--border));
}
</style>
