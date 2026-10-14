<!--
HeatmapChart 热图图表组件

## 组件说明
热图图表组件，用于展示二维数据的密度分布

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | HeatmapCell[] | - | 热图数据 |
| width | number | 600 | 图表宽度 |
| height | number | 300 | 图表高度 |
| cellWidth | number | 24 | 单元格宽度 |
| cellHeight | number | 24 | 单元格高度 |
| cellGap | number | 2 | 单元格间距 |
| colorRange | HeatmapColorRange | { min: 0, max: 100, colors: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'] } | 颜色范围 |
| showXAxis | boolean | true | 是否显示X轴 |
| showYAxis | boolean | true | 是否显示Y轴 |
| showLegend | boolean | true | 是否显示图例 |
| yAxisWidth | number | 120 | Y轴宽度 |
| yLabelMaxLength | number | 15 | Y轴标签最大长度 |
| valueFormatter | (value: number) => string | (value: number) => `${value}ms` | 值格式化函数 |
| emptyColor | string | '#e5e7eb' | 空值颜色 |

## 事件
| 事件名 | 参数 | 说明 |
|-------|------|------|
| cell-click | cell: HeatmapCell | 单元格点击事件 |
| cell-hover | cell: HeatmapCell | 单元格悬停事件 |

## 使用示例
```vue
<template>
  <HeatmapChart
    :data="heatmapData"
    :width="800"
    :height="400"
    @cell-click="handleCellClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HeatmapChart from './HeatmapChart.vue';

const heatmapData = ref([
  { x: 0, y: 0, value: 10, xLabel: 'Mon', yLabel: 'Server 1' },
  { x: 1, y: 0, value: 20, xLabel: 'Tue', yLabel: 'Server 1' },
  { x: 2, y: 0, value: 30, xLabel: 'Wed', yLabel: 'Server 1' },
  { x: 0, y: 1, value: 15, xLabel: 'Mon', yLabel: 'Server 2' },
  { x: 1, y: 1, value: 25, xLabel: 'Tue', yLabel: 'Server 2' },
  { x: 2, y: 1, value: 35, xLabel: 'Wed', yLabel: 'Server 2' },
]);

const handleCellClick = (cell) => {
};
</script>
```
-->
<template>
  <div class="heatmap-chart" :style="{ width: width + 'px', height: height + 'px' }">
    <div class="heatmap-container">
      <!-- Y轴标签 -->
      <div v-if="showYAxis" class="heatmap-y-axis">
        <div
          v-for="(label, index) in yLabels"
          :key="index"
          class="heatmap-y-label"
          :style="{ height: cellHeight + 'px' }"
        >
          <Tooltip :content="label" placement="left" :delay="300">
            <span class="heatmap-label-text">{{ truncateLabel(label, yLabelMaxLength) }}</span>
          </Tooltip>
        </div>
      </div>
      
      <!-- 热力图网格 -->
      <div class="heatmap-grid" :style="gridStyle">
        <div
          v-for="(cell, index) in cells"
          :key="index"
          class="heatmap-cell"
          :class="{ 'heatmap-cell--empty': cell.value === null || cell.value === undefined }"
          :style="getCellStyle(cell)"
          @mouseenter="handleCellEnter(cell, $event)"
          @mouseleave="handleCellLeave"
          @click="handleCellClick(cell)"
        />
      </div>
    </div>
    
    <!-- X轴标签 -->
    <div v-if="showXAxis" class="heatmap-x-axis" :style="{ marginLeft: showYAxis ? yAxisWidth + 'px' : '0' }">
      <div
        v-for="(label, index) in xLabels"
        :key="index"
        class="heatmap-x-label"
        :style="{ width: cellWidth + 'px' }"
      >
        {{ label }}
      </div>
    </div>
    
    <!-- 图例 -->
    <div v-if="showLegend" class="heatmap-legend">
      <span class="heatmap-legend-label">{{ legendMin }}</span>
      <div class="heatmap-legend-gradient" :style="gradientStyle" />
      <span class="heatmap-legend-label">{{ legendMax }}</span>
    </div>
    
    <!-- Tooltip -->
    <Teleport to="body">
      <Transition name="heatmap-tooltip">
        <div
          v-if="tooltipVisible && hoveredCell"
          class="heatmap-tooltip"
          :style="tooltipStyle"
        >
          <div class="heatmap-tooltip-title">{{ hoveredCell!.yLabel }}</div>
          <div class="heatmap-tooltip-content">
            <span class="heatmap-tooltip-label">{{ hoveredCell!.xLabel }}:</span>
            <span class="heatmap-tooltip-value" :style="{ color: getTooltipValueColor(hoveredCell!.value) }">
              {{ formatValue(hoveredCell!.value) }}
            </span>
          </div>
          <div v-if="hoveredCell!.extra" class="heatmap-tooltip-extra">
            {{ hoveredCell!.extra }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Tooltip from '../feedback/Tooltip.vue';

export interface HeatmapCell {
  x: number;
  y: number;
  value: number | null;
  xLabel: string;
  yLabel: string;
  extra?: string;
}

export interface HeatmapColorRange {
  min: number;
  max: number;
  colors: string[];
}

export interface HeatmapChartProps {
  data: HeatmapCell[];
  width?: number;
  height?: number;
  cellWidth?: number;
  cellHeight?: number;
  cellGap?: number;
  colorRange?: HeatmapColorRange;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  yAxisWidth?: number;
  yLabelMaxLength?: number;
  valueFormatter?: (value: number) => string;
  emptyColor?: string;
}

const props = withDefaults(defineProps<HeatmapChartProps>(), {
  width: 600,
  height: 300,
  cellWidth: 24,
  cellHeight: 24,
  cellGap: 2,
  colorRange: () => ({
    min: 0,
    max: 100,
    colors: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'],
  }),
  showXAxis: true,
  showYAxis: true,
  showLegend: true,
  yAxisWidth: 120,
  yLabelMaxLength: 15,
  valueFormatter: (value: number) => `${value}ms`,
  emptyColor: '#e5e7eb',
});

const emit = defineEmits<{
  'cell-click': [cell: HeatmapCell];
  'cell-hover': [cell: HeatmapCell];
}>();

// 计算唯一的X和Y标签
const xLabels = computed(() => {
  const labels = [...new Set(props.data.map(d => d.xLabel))];
  return labels.sort((a, b) => props.data.find(d => d.xLabel === a)!.x - props.data.find(d => d.xLabel === b)!.x);
});

const yLabels = computed(() => {
  const labels = [...new Set(props.data.map(d => d.yLabel))];
  return labels.sort((a, b) => props.data.find(d => d.yLabel === a)!.y - props.data.find(d => d.yLabel === b)!.y);
});

const cells = computed(() => props.data);

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${xLabels.value.length}, ${props.cellWidth}px)`,
  gridTemplateRows: `repeat(${yLabels.value.length}, ${props.cellHeight}px)`,
  gap: `${props.cellGap}px`,
}));

const gradientStyle = computed(() => ({
  background: `linear-gradient(to right, ${props.colorRange.colors.join(', ')})`,
}));

const legendMin = computed(() => props.valueFormatter(props.colorRange.min));
const legendMax = computed(() => props.valueFormatter(props.colorRange.max));

// Tooltip状态
const tooltipVisible = ref(false);
const hoveredCell = ref<HeatmapCell | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });

const tooltipStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`,
  zIndex: 'var(--z-tooltip)',
}));

// 获取单元格颜色
function getCellColor(value: number | null): string {
  if (value === null || value === undefined) {
    return props.emptyColor;
  }
  
  const { min, max, colors } = props.colorRange;
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const index = Math.floor(ratio * (colors.length - 1));
  return colors[Math.min(index, colors.length - 1)];
}

// 获取单元格样式
function getCellStyle(cell: HeatmapCell) {
  return {
    backgroundColor: getCellColor(cell.value),
    width: `${props.cellWidth}px`,
    height: `${props.cellHeight}px`,
    borderRadius: '4px',
    cursor: cell.value !== null ? 'pointer' : 'default',
  };
}

// 截断标签
function truncateLabel(label: string, maxLength: number): string {
  if (label.length <= maxLength) return label;
  return label.slice(0, maxLength) + '...';
}

// 格式化值
function formatValue(value: number | null): string {
  if (value === null || value === undefined) return '-';
  return props.valueFormatter(value);
}

// 获取tooltip值颜色
function getTooltipValueColor(value: number | null): string {
  if (value === null) return '#9ca3af';
  return getCellColor(value);
}

// 处理单元格hover
function handleCellEnter(cell: HeatmapCell, event: MouseEvent) {
  if (cell.value === null) return;
  
  hoveredCell.value = cell;
  tooltipVisible.value = true;
  
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  tooltipPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10,
  };
  
  emit('cell-hover', cell);
}

// 处理单元格leave
function handleCellLeave() {
  tooltipVisible.value = false;
  hoveredCell.value = null;
}

// 处理单元格点击
function handleCellClick(cell: HeatmapCell) {
  if (cell.value !== null) {
    emit('cell-click', cell);
  }
}
</script>

<script lang="ts">
export default { name: 'HeatmapChart' };
</script>

<style scoped>
.heatmap-chart {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.heatmap-container {
  display: flex;
  gap: 8px;
}

.heatmap-y-axis {
  display: flex;
  flex-direction: column;
  gap: v-bind('cellGap + "px"');
  flex-shrink: 0;
}

.heatmap-y-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  font-size: 12px;
  color: hsl(var(--text-secondary));
}

.heatmap-label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.heatmap-grid {
  flex: 1;
}

.heatmap-cell {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.heatmap-cell:not(.heatmap-cell--empty):hover {
  box-shadow: var(--shadow-sm);
  z-index: 1;
}

.heatmap-cell--empty {
  opacity: 0.3;
}

.heatmap-x-axis {
  display: flex;
  gap: v-bind('cellGap + "px"');
  margin-top: 8px;
}

.heatmap-x-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: hsl(var(--text-muted));
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid hsl(var(--border));
}

.heatmap-legend-label {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

.heatmap-legend-gradient {
  width: 120px;
  height: 8px;
  border-radius: 4px;
}

/* Tooltip */
.heatmap-tooltip {
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: var(--shadow-md);
  pointer-events: none;
  transform: translate(-50%, -100%);
  min-width: 140px;
}

.heatmap-tooltip-title {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--text));
  margin-bottom: 4px;
}

.heatmap-tooltip-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.heatmap-tooltip-label {
  color: hsl(var(--text-secondary));
}

.heatmap-tooltip-value {
  font-weight: 600;
  font-size: 14px;
}

.heatmap-tooltip-extra {
  margin-top: 4px;
  font-size: 11px;
  color: hsl(var(--text-muted));
  padding-top: 4px;
  border-top: 1px solid hsl(var(--border));
}

/* Tooltip transition */
.heatmap-tooltip-enter-active,
.heatmap-tooltip-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.heatmap-tooltip-enter-from,
.heatmap-tooltip-leave-to {
  opacity: 0;
  transform: translate(-50%, -90%);
}
</style>
