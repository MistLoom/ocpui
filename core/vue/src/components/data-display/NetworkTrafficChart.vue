<!--
NetworkTrafficChart 网络流量图表组件

## 组件说明
网络流量图表组件，用于显示上传和下载流量的变化趋势

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | TrafficDataPoint[] | - | 流量数据数组 |
| width | number | 120 | 图表宽度 |
| height | number | 80 | 图表高度 |
| lineWidth | number | 2 | 线条宽度 |
| showPoints | boolean | true | 是否显示数据点 |
| pointRadius | number | 3 | 点半径 |
| uploadColor | string | 'hsl(217, 91%, 60%)' | 上传线颜色 |
| downloadColor | string | 'hsl(270, 70%, 60%)' | 下载线颜色 |
| showTooltip | boolean | true | 是否显示tooltip |

## 事件
无

## 使用示例
```vue
<template>
  <NetworkTrafficChart
    :data="trafficData"
    :width="300"
    :height="100"
    :showPoints="true"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NetworkTrafficChart from './NetworkTrafficChart.vue';

const trafficData = ref([
  { time: '00:00', upload: 100, download: 200 },
  { time: '02:00', upload: 150, download: 250 },
  { time: '04:00', upload: 80, download: 180 },
  { time: '06:00', upload: 120, download: 220 },
  { time: '08:00', upload: 200, download: 300 },
  { time: '10:00', upload: 180, download: 280 },
  { time: '12:00', upload: 150, download: 250 },
]);
</script>
```
-->
<template>
  <div class="network-traffic-chart">
    <svg
      :width="width"
      :height="height"
      class="traffic-svg"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <!-- 网格线 -->
      <g class="grid-lines">
        <line
          v-for="n in 4"
          :key="`grid-${n}`"
          :x1="0"
          :y1="(height / 4) * n"
          :x2="width"
          :y2="(height / 4) * n"
          stroke="hsl(var(--border))"
          stroke-width="1"
          stroke-dasharray="2,2"
          opacity="0.3"
        />
      </g>

      <!-- 上传流量线 -->
      <path
        :d="uploadPath"
        fill="none"
        :stroke="uploadColor"
        :stroke-width="lineWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="traffic-line traffic-line--upload"
      />

      <!-- 下载流量线 -->
      <path
        :d="downloadPath"
        fill="none"
        :stroke="downloadColor"
        :stroke-width="lineWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="traffic-line traffic-line--download"
      />

      <!-- 悬停指示线 -->
      <line
        v-if="hoveredIndex !== null"
        :x1="getX(hoveredIndex)"
        :y1="0"
        :x2="getX(hoveredIndex)"
        :y2="height"
        stroke="hsl(var(--border))"
        stroke-width="1"
        stroke-dasharray="3,3"
        class="hover-line"
      />

      <!-- 数据点 -->
      <g v-if="showPoints && hoveredIndex !== null">
        <circle
          :cx="getX(hoveredIndex)"
          :cy="getY(uploadData[hoveredIndex], maxValue)"
          :r="pointRadius"
          :fill="uploadColor"
          class="data-point"
        />
        <circle
          :cx="getX(hoveredIndex)"
          :cy="getY(downloadData[hoveredIndex], maxValue)"
          :r="pointRadius"
          :fill="downloadColor"
          class="data-point"
        />
      </g>
    </svg>

    <FloatingHint
      :visible="showTooltipEnabled && hoveredIndex !== null"
      :anchor="tooltipAnchor"
      variant="panel"
      placement="top"
    >
      <div class="network-traffic__hint-time">{{ data[hoveredIndex ?? 0]?.time }}</div>
      <div class="network-traffic__hint-row">
        <span class="network-traffic__hint-dot" :style="{ backgroundColor: uploadColor }"></span>
        <span class="network-traffic__hint-label">{{ t('components.dataDisplay.networkTrafficChart.upload') }}</span>
        <span class="network-traffic__hint-value">{{ formatSpeed(data[hoveredIndex ?? 0]?.upload || 0) }}</span>
      </div>
      <div class="network-traffic__hint-row">
        <span class="network-traffic__hint-dot" :style="{ backgroundColor: downloadColor }"></span>
        <span class="network-traffic__hint-label">{{ t('components.dataDisplay.networkTrafficChart.download') }}</span>
        <span class="network-traffic__hint-value">{{ formatSpeed(data[hoveredIndex ?? 0]?.download || 0) }}</span>
      </div>
    </FloatingHint>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import FloatingHint from '../feedback/FloatingHint.vue';
import type { VirtualAnchor } from '../composables/useFloatingPosition';

const { uiT: t } = useUiT();

export interface TrafficDataPoint {
  time: string;
  upload: number;
  download: number;
}

export interface NetworkTrafficChartProps {
  /** 流量数据数组 */
  data: TrafficDataPoint[];
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 线条宽度 */
  lineWidth?: number;
  /** 是否显示数据点 */
  showPoints?: boolean;
  /** 点半径 */
  pointRadius?: number;
  /** 上传线颜色 */
  uploadColor?: string;
  /** 下载线颜色 */
  downloadColor?: string;
  /** 是否显示tooltip */
  showTooltip?: boolean;
}

const props = withDefaults(defineProps<NetworkTrafficChartProps>(), {
  width: 120,
  height: 80,
  lineWidth: 2,
  showPoints: true,
  pointRadius: 3,
  uploadColor: 'hsl(217, 91%, 60%)',
  downloadColor: 'hsl(270, 70%, 60%)',
  showTooltip: true
});

// 悬停状态
const hoveredIndex = ref<number | null>(null);
const tooltipAnchor = ref<VirtualAnchor | null>(null);
const showTooltipEnabled = computed(() => props.showTooltip);

// 计算上传数据数组
const uploadData = computed(() => props.data.map(d => d.upload));

// 计算下载数据数组
const downloadData = computed(() => props.data.map(d => d.download));

// 计算最大值（用于归一化）
const maxValue = computed(() => {
  const allValues = [...uploadData.value, ...downloadData.value];
  if (allValues.length === 0) return 1;
  const max = Math.max(...allValues);
  return max > 0 ? max * 1.1 : 1; // 增加10%边距
});

// 计算X坐标
const getX = (index: number): number => {
  if (props.data.length <= 1) return props.width / 2;
  return (index / (props.data.length - 1)) * props.width;
};

// 计算Y坐标
const getY = (value: number, max: number): number => {
  return props.height - (value / max) * props.height;
};

// 生成路径
const generatePath = (data: number[]): string => {
  if (data.length === 0) return '';
  if (data.length === 1) {
    const x = props.width / 2;
    const y = getY(data[0], maxValue.value);
    return `M ${x} ${y}`;
  }

  return data
    .map((value, index) => {
      const x = getX(index);
      const y = getY(value, maxValue.value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

// 上传路径
const uploadPath = computed(() => generatePath(uploadData.value));

// 下载路径
const downloadPath = computed(() => generatePath(downloadData.value));

// 格式化速度
const formatSpeed = (kbps: number): string => {
  if (kbps >= 1024) {
    return `${(kbps / 1024).toFixed(1)} MB/s`;
  }
  return `${Math.round(kbps)} KB/s`;
};

// 鼠标移动处理
const handleMouseMove = (event: MouseEvent) => {
  if (!props.showTooltip || props.data.length === 0) return;

  const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const index = Math.round((x / props.width) * (props.data.length - 1));

  hoveredIndex.value = Math.max(0, Math.min(props.data.length - 1, index));
  tooltipAnchor.value = { x: event.clientX, y: event.clientY };
};

// 鼠标离开处理
const handleMouseLeave = () => {
  hoveredIndex.value = null;
  tooltipAnchor.value = null;
};
</script>

<style scoped>
.network-traffic-chart {
  position: relative;
  display: inline-block;
}

.traffic-svg {
  overflow: visible;
}

.traffic-line {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.traffic-line--upload {
  opacity: 0.9;
}

.traffic-line--download {
  opacity: 0.9;
}

.data-point {
  stroke: hsl(var(--surface));
  stroke-width: 2;
}

.hover-line {
  pointer-events: none;
}

.network-traffic__hint-time {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid hsl(var(--border));
}

.network-traffic__hint-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.network-traffic__hint-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.network-traffic__hint-label {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.network-traffic__hint-value {
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}
</style>
