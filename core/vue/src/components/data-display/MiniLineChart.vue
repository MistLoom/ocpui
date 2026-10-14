<!--
MiniLineChart 迷你折线图组件

## 组件说明
迷你折线图组件，用于在卡片中显示简单的趋势数据

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | DataPoint[] | - | 图表数据 |
| height | number | 50 | 图表高度 |
| lineColor | string | 'hsl(var(--primary))' | 线条颜色 |
| lineWidth | number | 2 | 线条宽度 |
| showArea | boolean | true | 是否显示填充区域 |
| showPoints | boolean | false | 是否显示数据点 |
| showHoverLine | boolean | true | 是否显示悬停指示线 |
| pointRadius | number | 3 | 数据点半径 |
| activePointRadius | number | 5 | 激活数据点半径 |
| padding | number | 4 | 内边距 |
| valueFormatter | (value: number) => string | (value: number) => value.toString() | 值格式化函数 |

## 事件
无

## 使用示例
```vue
<template>
  <MiniLineChart
    :data="chartData"
    :height="40"
    :line-color="'hsl(var(--primary))'"
    :show-points="false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MiniLineChart from './MiniLineChart.vue';

const chartData = ref([
  { label: '1月', value: 10 },
  { label: '2月', value: 15 },
  { label: '3月', value: 12 },
  { label: '4月', value: 18 },
  { label: '5月', value: 14 },
  { label: '6月', value: 20 },
]);
</script>
```
-->
<template>
  <div ref="containerRef" class="mini-line-chart" :style="containerStyle">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      class="chart-svg"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <!-- 渐变定义 -->
      <defs>
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="lineColor" stop-opacity="0.3" />
          <stop offset="100%" :stop-color="lineColor" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- 填充区域 -->
      <path
        v-if="showArea"
        :d="areaPath"
        :fill="`url(#${gradientId})`"
        class="chart-area"
      />

      <!-- 折线 -->
      <path
        :d="linePath"
        :stroke="lineColor"
        :stroke-width="lineWidth"
        fill="none"
        class="chart-line"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- 数据点 -->
      <g v-if="showPoints">
        <circle
          v-for="(point, index) in dataPoints"
          :key="`point-${index}`"
          :cx="point.x"
          :cy="point.y"
          :r="hoveredIndex === index ? activePointRadius : pointRadius"
          :fill="lineColor"
          class="chart-point"
          :class="{ 'chart-point--active': hoveredIndex === index }"
        />
      </g>

      <!-- 悬停指示线 -->
      <line
        v-if="hoveredIndex !== null && showHoverLine"
        :x1="dataPoints[hoveredIndex]?.x"
        :y1="padding"
        :x2="dataPoints[hoveredIndex]?.x"
        :y2="svgHeight - padding"
        stroke="hsl(var(--border))"
        stroke-width="1"
        stroke-dasharray="4,4"
        class="hover-line"
      />
    </svg>

    <FloatingHint
      :visible="showTooltip && hoveredIndex !== null"
      :anchor="tooltipAnchor"
      placement="top"
    >
      <div class="mini-line-chart__hint-label">{{ data[hoveredIndex ?? 0]?.label }}</div>
      <div class="mini-line-chart__hint-value">{{ formatValue(data[hoveredIndex ?? 0]?.value) }}</div>
    </FloatingHint>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import FloatingHint from '../feedback/FloatingHint.vue';
import type { VirtualAnchor } from '../composables/useFloatingPosition';

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
  lineColor?: string;
  lineWidth?: number;
  showArea?: boolean;
  showPoints?: boolean;
  showHoverLine?: boolean;
  pointRadius?: number;
  activePointRadius?: number;
  padding?: number;
  valueFormatter?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  height: 50,
  lineColor: 'hsl(var(--primary))',
  lineWidth: 2,
  showArea: true,
  showPoints: false,
  showHoverLine: true,
  pointRadius: 3,
  activePointRadius: 5,
  padding: 4,
  valueFormatter: (value: number) => value.toString(),
});

const containerRef = ref<HTMLElement | null>(null);
const svgWidth = ref(100);
const svgHeight = computed(() => props.height);
const hoveredIndex = ref<number | null>(null);
const showTooltip = ref(false);
const tooltipAnchor = ref<VirtualAnchor | null>(null);
// 稳定 id：原 computed(genId) 每次求值都换新值，导致 gradient 引用失效
const gradientId = useComponentId('mini-line-gradient');

const containerStyle = computed(() => ({
  height: `${props.height}px`,
}));

// 计算数据点坐标
const dataPoints = computed(() => {
  if (!props.data.length) return [];

  const values = props.data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const chartWidth = svgWidth.value - props.padding * 2;
  const chartHeight = svgHeight.value - props.padding * 2;

  return props.data.map((item, index) => {
    const x = props.padding + (index / (props.data.length - 1)) * chartWidth;
    const y = props.padding + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
    return { x, y, value: item.value, label: item.label };
  });
});

// 生成折线路径
const linePath = computed(() => {
  if (!dataPoints.value.length) return '';

  return dataPoints.value.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    return `${path} L ${point.x} ${point.y}`;
  }, '');
});

// 生成填充区域路径
const areaPath = computed(() => {
  if (!dataPoints.value.length) return '';

  const bottomY = svgHeight.value - props.padding;
  const firstPoint = dataPoints.value[0];
  const lastPoint = dataPoints.value[dataPoints.value.length - 1];

  let path = `M ${firstPoint.x} ${bottomY}`;
  path += ` L ${firstPoint.x} ${firstPoint.y}`;

  for (let i = 1; i < dataPoints.value.length; i++) {
    path += ` L ${dataPoints.value[i].x} ${dataPoints.value[i].y}`;
  }

  path += ` L ${lastPoint.x} ${bottomY}`;
  path += ' Z';

  return path;
});

const formatValue = (value: number | undefined) => {
  if (value === undefined) return '-';
  return props.valueFormatter(value);
};

// 鼠标移动处理
const handleMouseMove = (event: MouseEvent) => {
  if (!containerRef.value || !dataPoints.value.length) return;

  const rect = containerRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;

  // 找到最近的数据点
  let closestIndex = 0;
  let closestDistance = Infinity;

  dataPoints.value.forEach((point, index) => {
    const distance = Math.abs(point.x - x);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  // 只有当距离足够近时才显示
  const threshold = svgWidth.value / props.data.length / 2;
  if (closestDistance <= threshold) {
    hoveredIndex.value = closestIndex;
    showTooltip.value = true;
    const point = dataPoints.value[closestIndex];
    tooltipAnchor.value = {
      x: rect.left + point.x,
      y: rect.top + point.y,
    };
  } else {
    hoveredIndex.value = null;
    showTooltip.value = false;
    tooltipAnchor.value = null;
  }
};

const handleMouseLeave = () => {
  hoveredIndex.value = null;
  showTooltip.value = false;
  tooltipAnchor.value = null;
};

// 更新容器宽度
const updateWidth = () => {
  if (containerRef.value) {
    svgWidth.value = containerRef.value.clientWidth;
  }
};

// 监听尺寸变化
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(() => {
    updateWidth();

    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateWidth();
      });
      if (containerRef.value) {
        resizeObserver.observe(containerRef.value);
      }
    }
  });
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.mini-line-chart {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.chart-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.chart-line {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.chart-area {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.chart-point {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  cursor: pointer;
}

.chart-point--active {
  filter: drop-shadow(0 2px 4px hsl(0 0% 0% / 0.12));
}

.hover-line {
  pointer-events: none;
  opacity: 0.6;
}

.mini-line-chart__hint-label {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 2px;
}

.mini-line-chart__hint-value {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
}
</style>
