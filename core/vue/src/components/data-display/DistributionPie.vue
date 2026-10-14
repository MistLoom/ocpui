<!--
DistributionPie 分布饼图组件

## 组件说明
分布饼图组件，用于展示数据的分布情况，支持饼图和环形图两种模式

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | DataItem[] | [] | 饼图数据 |
| type | 'pie' \| 'donut' | 'donut' | 图表类型 |
| size | number | 100 | 图表大小 |
| showLegend | boolean | true | 是否显示图例 |
| showCenterText | boolean | true | 是否显示中心文字 |
| centerText | string | '总计' | 中心文字标签 |
| centerValue | string | '' | 中心文字值 |
| legendVertical | boolean | false | 图例是否垂直显示 |
| showLegendValue | boolean | false | 图例是否显示数值 |
| showLegendPercent | boolean | true | 图例是否显示百分比 |
| valueFormatter | (value: number) => string | (value: number) => value.toString() | 数值格式化函数 |

## 事件
无

## 使用示例
```vue
<template>
  <DistributionPie
    :data="pieData"
    type="donut"
    :size="200"
    :showLegend="true"
    :showCenterText="true"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DistributionPie from './DistributionPie.vue';

const pieData = ref([
  { name: '类别1', value: 30 },
  { name: '类别2', value: 20 },
  { name: '类别3', value: 50 }
]);
</script>
```
-->
<template>
  <div class="distribution-pie" :class="{ 'distribution-pie--vertical': isVertical }">
    <!-- 图表区域 -->
    <div class="pie-chart-container" :style="chartContainerStyle">
      <svg :width="chartSize" :height="chartSize" class="pie-svg">
        <!-- 饼图/环形图扇区 -->
        <g :transform="`translate(${chartSize / 2}, ${chartSize / 2})`">
          <path
            v-for="(slice, index) in pieSlices"
            :key="`slice-${index}`"
            :d="slice.path"
            :fill="slice.color"
            class="pie-slice"
            :class="{ 'pie-slice--active': hoveredIndex === index }"
            @mouseenter="handleSliceEnter(index)"
            @mouseleave="handleSliceLeave"
          />

          <!-- 中心文字（环形图模式） -->
          <text
            v-if="type === 'donut' && showCenterText"
            class="center-text"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            <tspan class="center-label" x="0" :dy="centerTextOffset">{{ centerText }}</tspan>
            <tspan class="center-value" x="0" :dy="centerValueOffset">{{ displayCenterValue }}</tspan>
          </text>
        </g>
      </svg>

      <!-- Tooltip -->
      <Transition name="tooltip">
        <div
          v-if="showTooltip && hoveredIndex !== null"
          class="pie-tooltip"
          :style="tooltipPosition"
        >
          <div class="tooltip-color" :style="{ backgroundColor: pieSlices[hoveredIndex]?.color }"></div>
          <div class="tooltip-content">
            <div class="tooltip-name">{{ data[hoveredIndex]?.name }}</div>
            <div class="tooltip-value">
              {{ formatValue(data[hoveredIndex]?.value) }}
              <span class="tooltip-percent">({{ pieSlices[hoveredIndex]?.percentage }}%)</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 图例区域 -->
    <div v-if="showLegend" class="pie-legend" :class="{ 'pie-legend--vertical': legendVertical }">
      <div
        v-for="(item, index) in data"
        :key="`legend-${index}`"
        class="legend-item"
        :class="{ 'legend-item--active': hoveredIndex === index }"
        @mouseenter="handleSliceEnter(index)"
        @mouseleave="handleSliceLeave"
      >
        <span class="legend-color" :style="{ backgroundColor: item.color || getDefaultColor(index) }"></span>
        <span class="legend-name">{{ item.name }}</span>
        <span v-if="showLegendValue" class="legend-value">{{ formatValue(item.value) }}</span>
        <span v-if="showLegendPercent" class="legend-percent">{{ getPercentage(item.value) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface DataItem {
  name: string;
  value: number;
  color?: string;
}

type PieType = 'pie' | 'donut';

interface Props {
  data: DataItem[];
  type?: PieType;
  size?: number;
  showLegend?: boolean;
  showCenterText?: boolean;
  centerText?: string;
  centerValue?: string;
  legendVertical?: boolean;
  showLegendValue?: boolean;
  showLegendPercent?: boolean;
  valueFormatter?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  type: 'donut',
  size: 100,
  showLegend: true,
  showCenterText: true,
  centerText: '总计',
  centerValue: '',
  legendVertical: false,
  showLegendValue: false,
  showLegendPercent: true,
  valueFormatter: (value: number) => value.toString(),
});

// 默认颜色调色板
const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)',
  'hsl(48, 96%, 53%)',
  'hsl(0, 84%, 60%)',
  'hsl(271, 91%, 65%)',
  'hsl(188, 94%, 43%)',
  'hsl(25, 95%, 53%)',
  'hsl(330, 81%, 60%)',
];

const hoveredIndex = ref<number | null>(null);
const showTooltip = ref(false);
const tooltipPosition = ref({ left: '0px', top: '0px' });

const isVertical = computed(() => {
  return props.legendVertical || props.size < 120;
});

const chartSize = computed(() => props.size);

const chartContainerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}));

const centerTextOffset = computed(() => displayCenterValue ? '-0.5em' : '0');
const centerValueOffset = computed(() => '1.2em');

// 计算总值
const totalValue = computed(() => {
  return props.data.reduce((sum, item) => sum + item.value, 0);
});

// 显示的中心值
const displayCenterValue = computed(() => {
  return props.centerValue || props.valueFormatter(totalValue.value);
});

// 获取默认颜色
const getDefaultColor = (index: number): string => {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

// 计算百分比
const getPercentage = (value: number): string => {
  if (totalValue.value === 0) return '0';
  return ((value / totalValue.value) * 100).toFixed(1);
};

// 格式化数值
const formatValue = (value: number | undefined): string => {
  if (value === undefined) return '-';
  return props.valueFormatter(value);
};

// 计算饼图扇区
const pieSlices = computed(() => {
  if (!props.data.length || totalValue.value === 0) return [];

  const radius = props.size / 2 - 4;
  const innerRadius = props.type === 'donut' ? radius * 0.6 : 0;
  let currentAngle = -Math.PI / 2; // 从顶部开始

  return props.data.map((item, index) => {
    const percentage = item.value / totalValue.value;
    const angle = percentage * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // 计算路径
    const path = createArcPath(0, 0, radius, innerRadius, startAngle, endAngle);

    currentAngle += angle;

    return {
      path,
      color: item.color || getDefaultColor(index),
      percentage: (percentage * 100).toFixed(1),
      startAngle,
      endAngle,
    };
  });
});

// 创建弧形路径
const createArcPath = (
  cx: number,
  cy: number,
  radius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string => {
  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);

  const x3 = cx + innerRadius * Math.cos(endAngle);
  const y3 = cy + innerRadius * Math.sin(endAngle);
  const x4 = cx + innerRadius * Math.cos(startAngle);
  const y4 = cy + innerRadius * Math.sin(startAngle);

  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  if (innerRadius === 0) {
    // 实心饼图
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  } else {
    // 环形图
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  }
};

// 处理扇区悬停
const handleSliceEnter = (index: number) => {
  hoveredIndex.value = index;
  showTooltip.value = true;

  // 计算tooltip位置
  const slice = pieSlices.value[index];
  if (slice) {
    const midAngle = (slice.startAngle + slice.endAngle) / 2;
    const tooltipRadius = props.size / 2 + 10;
    let x = Math.cos(midAngle) * tooltipRadius + props.size / 2;
    let y = Math.sin(midAngle) * tooltipRadius + props.size / 2;

    // 确保tooltip在容器内可见
    const tooltipWidth = 150; // 估计的tooltip宽度
    const tooltipHeight = 60; // 估计的tooltip高度
    
    x = Math.max(0, Math.min(x, props.size - tooltipWidth));
    y = Math.max(0, Math.min(y, props.size - tooltipHeight));

    tooltipPosition.value = {
      left: `${x}px`,
      top: `${y}px`,
    };
  }
};

const handleSliceLeave = () => {
  hoveredIndex.value = null;
  showTooltip.value = false;
};
</script>

<style scoped>
.distribution-pie {
  display: flex;
  align-items: center;
  gap: 16px;
}

.distribution-pie--vertical {
  flex-direction: column;
}

.pie-chart-container {
  position: relative;
  flex-shrink: 0;
}

.pie-svg {
  display: block;
}

.pie-slice {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  cursor: pointer;
  stroke: hsl(var(--surface));
  stroke-width: 2px;
}

.pie-slice:hover,
.pie-slice--active {
  opacity: 0.9;
}

.center-text {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  pointer-events: none;
}

.center-label {
  font-size: 10px;
  fill: hsl(var(--text-muted));
}

.center-value {
  font-size: 14px;
  font-weight: 600;
  fill: hsl(var(--text));
}

/* 图例 */
.pie-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 12px;
}

.pie-legend--vertical {
  flex-direction: column;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  padding: 2px 4px;
  border-radius: 4px;
}

.legend-item:hover,
.legend-item--active {
  background: hsl(var(--surface-container-high));
}

.legend-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-name {
  color: hsl(var(--text-secondary));
  white-space: nowrap;
}

.legend-value {
  color: hsl(var(--text));
  font-weight: 500;
}

.legend-percent {
  color: hsl(var(--text-muted));
  font-size: 11px;
}

/* Tooltip */
.pie-tooltip {
  position: absolute;
  transform: translate(-50%, -50%);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: var(--shadow-sm);
  pointer-events: none;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 120px;
}

.tooltip-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 2px;
}

.tooltip-content {
  flex: 1;
}

.tooltip-name {
  font-size: 12px;
  color: hsl(var(--text));
  font-weight: 500;
  margin-bottom: 2px;
}

.tooltip-value {
  font-size: 13px;
  color: hsl(var(--text));
  font-weight: 600;
}

.tooltip-percent {
  font-size: 11px;
  color: hsl(var(--text-muted));
  font-weight: 400;
}

/* Tooltip 过渡动画 */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}
</style>
