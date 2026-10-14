<template>
  <div class="trend-chart">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-controls">
        <div class="chart-type-toggle">
          <button
            v-for="type in chartTypes"
            :key="type.value"
            type="button"
            class="toggle-btn"
            :class="{ 'toggle-btn--active': chartType === type.value }"
            @click="chartType = type.value"
          >
            <Icon :name="type.icon" :size="14" />
          </button>
        </div>
        <Select
          v-if="granularityOptions.length > 0"
          v-model="selectedGranularity"
          :options="granularityOptions"
          size="sm"
          class="granularity-select"
        />
        <Button variant="icon" size="sm" @click="exportChart">
          <Icon name="download" :size="14" />
        </Button>
      </div>
    </div>
    <div ref="chartContainer" class="chart-container">
      <svg :viewBox="`0 0 ${width} ${height}`" class="chart-svg">
        <!-- 网格线 -->
        <g class="grid-lines">
          <line
            v-for="i in yAxisTicks"
            :key="`grid-${i}`"
            :x1="padding.left"
            :y1="getY(i)"
            :x2="width - padding.right"
            :y2="getY(i)"
            class="grid-line"
          />
        </g>

        <!-- Y轴 -->
        <g class="y-axis">
          <text
            v-for="i in yAxisTicks"
            :key="`y-${i}`"
            :x="padding.left - 8"
            :y="getY(i)"
            class="axis-label"
            text-anchor="end"
            dominant-baseline="middle"
          >
            {{ formatYAxisValue(i) }}
          </text>
        </g>

        <!-- X轴 -->
        <g class="x-axis">
          <text
            v-for="(label, index) in xAxisLabels"
            :key="`x-${index}`"
            :x="getX(index)"
            :y="height - padding.bottom + 20"
            class="axis-label"
            text-anchor="middle"
          >
            {{ label }}
          </text>
        </g>

        <!-- 数据区域 -->
        <g class="data-area">
          <template v-for="(dataset, datasetIndex) in datasets" :key="datasetIndex">
            <!-- 折线图 -->
            <template v-if="chartType === 'line'">
              <path
                :d="getLinePath(dataset.data)"
                class="line-path"
                :style="{ stroke: dataset.color }"
                fill="none"
                stroke-width="2"
              />
              <path
                :d="getAreaPath(dataset.data)"
                class="area-path"
                :style="{ fill: dataset.color, opacity: 0.1 }"
              />
            </template>

            <!-- 柱状图 -->
            <template v-else>
              <rect
                v-for="(value, index) in dataset.data"
                :key="`bar-${index}`"
                :x="getBarX(index, datasetIndex)"
                :y="getBarY(value)"
                :width="barWidth"
                :height="getBarHeight(value)"
                class="bar-rect"
                :style="{ fill: dataset.color }"
                rx="2"
              />
            </template>
          </template>
        </g>

        <!-- 数据点 -->
        <g v-if="chartType === 'line'" class="data-points">
          <template v-for="(dataset, datasetIndex) in datasets" :key="`points-${datasetIndex}`">
            <circle
              v-for="(value, index) in dataset.data"
              :key="`point-${index}`"
              :cx="getX(index)"
              :cy="getY(value)"
              r="4"
              class="data-point"
              :style="{ fill: dataset.color }"
              @mouseenter="showTooltip($event, index, datasetIndex)"
              @mouseleave="hideTooltip"
            />
          </template>
        </g>
      </svg>

      <FloatingHint
        :visible="tooltip.visible"
        :anchor="tooltipAnchor"
        variant="panel"
        placement="top"
        custom-class="trend-chart__hint"
      >
        <div class="trend-chart__hint-title">{{ tooltip.title }}</div>
        <div
          v-for="(item, index) in tooltip.items"
          :key="index"
          class="trend-chart__hint-item"
        >
          <span class="trend-chart__hint-dot" :style="{ background: item.color }"></span>
          <span class="trend-chart__hint-label">{{ item.label }}</span>
          <span class="trend-chart__hint-value">{{ item.value }}</span>
        </div>
      </FloatingHint>
    </div>

    <!-- 图例 -->
    <div class="chart-legend">
      <div
        v-for="(dataset, index) in datasets"
        :key="index"
        class="legend-item"
        :class="{ 'legend-item--hidden': hiddenDatasets.has(index) }"
        @click="toggleDataset(index)"
      >
        <span class="legend-dot" :style="{ background: dataset.color }"></span>
        <span class="legend-label">{{ dataset.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Icon, Button } from '../utility';
import { Select } from '../data-entry';
import FloatingHint from '../feedback/FloatingHint.vue';
import type { VirtualAnchor } from '../composables/useFloatingPosition';

interface Dataset {
  label: string;
  data: number[];
  color: string;
}

interface Props {
  title?: string;
  labels: string[];
  datasets: Dataset[];
  height?: number;
  granularityOptions?: { label: string; value: string }[];
  defaultGranularity?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '趋势图',
  height: 300,
  granularityOptions: () => [],
  defaultGranularity: ''
});

defineEmits<{
  'granularity-change': [value: string];
}>();

const chartType = ref<'line' | 'bar'>('line');
const selectedGranularity = ref(props.defaultGranularity);
const chartContainer = ref<HTMLElement | null>(null);
const width = ref(800);
const hiddenDatasets = ref<Set<number>>(new Set());

const chartTypes = [
  { value: 'line' as const, icon: 'trending-up', label: '折线图' },
  { value: 'bar' as const, icon: 'bar-chart', label: '柱状图' }
];

const padding = { top: 20, right: 20, bottom: 40, left: 50 };

const visibleDatasets = computed(() => {
  return props.datasets.filter((_, index) => !hiddenDatasets.value.has(index));
});

const xAxisLabels = computed(() => props.labels);

const yAxisTicks = computed(() => {
  const maxValue = Math.max(...visibleDatasets.value.flatMap(d => d.data), 1);
  const tickCount = 5;
  const step = Math.ceil(maxValue / tickCount);
  return Array.from({ length: tickCount + 1 }, (_, i) => i * step);
});

const maxValue = computed(() => {
  return Math.max(...visibleDatasets.value.flatMap(d => d.data), 1);
});

const barWidth = computed(() => {
  const chartWidth = width.value - padding.left - padding.right;
  const dataCount = props.labels.length;
  const datasetCount = visibleDatasets.value.length;
  return (chartWidth / dataCount) * 0.6 / datasetCount;
});

const getX = (index: number) => {
  const chartWidth = width.value - padding.left - padding.right;
  return padding.left + (index * chartWidth) / (props.labels.length - 1 || 1);
};

const getY = (value: number) => {
  const chartHeight = props.height - padding.top - padding.bottom;
  return padding.top + chartHeight - (value / maxValue.value) * chartHeight;
};

const getBarX = (index: number, datasetIndex: number) => {
  const chartWidth = width.value - padding.left - padding.right;
  const slotWidth = chartWidth / props.labels.length;
  const startX = padding.left + index * slotWidth + slotWidth * 0.2;
  const offset = datasetIndex * (barWidth.value + 2);
  return startX + offset;
};

const getBarY = (value: number) => getY(value);

const getBarHeight = (value: number) => {
  const chartHeight = props.height - padding.top - padding.bottom;
  return (value / maxValue.value) * chartHeight;
};

const getLinePath = (data: number[]) => {
  if (data.length === 0) return '';
  return data
    .map((value, index) => {
      const x = getX(index);
      const y = getY(value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

const getAreaPath = (data: number[]) => {
  if (data.length === 0) return '';
  const linePath = getLinePath(data);
  const lastX = getX(data.length - 1);
  const firstX = getX(0);
  const bottomY = props.height - padding.bottom;
  return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
};

const formatYAxisValue = (value: number) => {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + 'w';
  }
  return value.toString();
};

const tooltip = ref({
  visible: false,
  title: '',
  items: [] as { label: string; value: number; color: string }[]
});
const tooltipAnchor = ref<VirtualAnchor | null>(null);

const showTooltip = (event: MouseEvent, index: number, _datasetIndex: number) => {
  tooltipAnchor.value = { x: event.clientX, y: event.clientY };
  tooltip.value = {
    visible: true,
    title: props.labels[index],
    items: visibleDatasets.value.map((dataset) => ({
      label: dataset.label,
      value: dataset.data[index],
      color: dataset.color
    }))
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
  tooltipAnchor.value = null;
};

const toggleDataset = (index: number) => {
  if (hiddenDatasets.value.has(index)) {
    hiddenDatasets.value.delete(index);
  } else {
    hiddenDatasets.value.add(index);
  }
};

const exportChart = () => {
  // 导出图表为图片
  const svg = chartContainer.value?.querySelector('svg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = width.value;
  canvas.height = props.height;

  const img = new Image();
  img.onload = () => {
    const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
    ctx.fillStyle = surfaceColor ? `hsl(${surfaceColor})` : 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const link = document.createElement('a');
    link.download = `chart_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
};

const updateWidth = () => {
  if (!chartContainer.value) return;
  const nextWidth = chartContainer.value.clientWidth;
  // Tab 隐藏或布局未完成时 clientWidth 为 0，保留上次有效宽度
  if (nextWidth > 0) {
    width.value = nextWidth;
  }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(() => {
    updateWidth();

    if (typeof ResizeObserver !== 'undefined' && chartContainer.value) {
      resizeObserver = new ResizeObserver(() => {
        updateWidth();
      });
      resizeObserver.observe(chartContainer.value);
    }
  });
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<style scoped>
.trend-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--text));
  margin: 0;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-type-toggle {
  display: flex;
  gap: 4px;
  padding: 2px;
  background: hsl(var(--surface-container-high));
  border-radius: 6px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: hsl(var(--text-secondary));
  border-radius: 4px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.toggle-btn:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-hover));
}

.toggle-btn--active {
  color: hsl(var(--primary));
  background: hsl(var(--surface));
  box-shadow: var(--shadow-sm);
}

.granularity-select {
  width: 100px;
}

.chart-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.grid-line {
  stroke: hsl(var(--border));
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.axis-label {
  font-size: 11px;
  fill: hsl(var(--text-muted));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.line-path {
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.area-path {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.bar-rect {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.bar-rect:hover {
  opacity: 0.8;
}

.data-point {
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.data-point:hover {
  r: 6;
}

:global(.trend-chart__hint-title) {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid hsl(var(--border));
}

:global(.trend-chart__hint-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 4px;
}

:global(.trend-chart__hint-dot) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

:global(.trend-chart__hint-label) {
  color: hsl(var(--muted-foreground));
  flex: 1;
}

:global(.trend-chart__hint-value) {
  color: hsl(var(--foreground));
  font-weight: 500;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.legend-item:hover {
  opacity: 0.8;
}

.legend-item--hidden {
  opacity: 0.4;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-label {
  font-size: 12px;
  color: hsl(var(--text-secondary));
}

.legend-item--hidden .legend-label {
  text-decoration: line-through;
}
</style>
