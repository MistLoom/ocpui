&lt;!--
图表图例组件

Props:
- data: LegendItem[] - 图例数据
- direction?: 'horizontal' | 'vertical' - 排列方向，默认值：'vertical'
- size?: 'sm' | 'md' | 'lg' - 图例大小，默认值：'md'
- showValue?: boolean - 是否显示数值，默认值：false
- showPercentage?: boolean - 是否显示百分比，默认值：true
- interactive?: boolean - 是否可交互，默认值：true
- maxWidth?: number - 最大宽度
- valueFormatter?: (value: number) =&gt; string - 数值格式化函数

Events:
- item-hover: (index: number | null) - 鼠标悬停事件
- item-click: (index: number) - 点击事件

Slots:
- item-extra - 图例项额外内容插槽，接收 item 和 index 参数

Usage:
&lt;ChartLegend
  :data="[
    { name: '数据1', value: 100, percentage: 33.3, color: 'hsl(var(--primary))' },
    { name: '数据2', value: 150, percentage: 50, color: 'hsl(var(--success))' },
    { name: '数据3', value: 50, percentage: 16.7, color: 'hsl(var(--warning))' }
  ]"
  direction="horizontal"
  :showValue="true"
  @item-click="handleLegendClick"
/&gt;

LegendItem 接口:
- name: string - 图例名称
- value: number - 图例数值
- percentage: number - 图例百分比
- color: string - 图例颜色
- disabled?: boolean - 是否禁用
--&gt;
<template>
  <div :class="containerClass" :style="containerStyle">
    <div
      v-for="(item, index) in data"
      :key="index"
      :class="getItemClass(index)"
      @mouseenter="handleMouseEnter(index)"
      @mouseleave="handleMouseLeave"
      @click="handleClick(index)"
    >
      <!-- 颜色指示器 -->
      <span
        class="legend-indicator"
        :style="{ backgroundColor: item.color }"
      />
      
      <!-- 内容区 -->
      <div class="legend-content">
        <span class="legend-name" :title="item.name">{{ item.name }}</span>
        <span v-if="showValue" class="legend-value">{{ formatValue(item.value) }}</span>
        <span v-if="showPercentage" class="legend-percentage">{{ item.percentage }}%</span>
      </div>
      
      <!-- 额外插槽 -->
      <slot name="item-extra" :item="item" :index="index" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface LegendItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
  disabled?: boolean;
}

interface Props {
  data: LegendItem[];
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showPercentage?: boolean;
  interactive?: boolean;
  maxWidth?: number;
  valueFormatter?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'vertical',
  size: 'md',
  showValue: false,
  showPercentage: true,
  interactive: true,
  maxWidth: undefined,
});

const emit = defineEmits<{
  'item-hover': [index: number | null];
  'item-click': [index: number];
}>();

const hoveredIndex = ref<number | null>(null);

const containerClass = computed(() => {
  const classes = ['chart-legend'];
  classes.push(`chart-legend--${props.direction}`);
  classes.push(`chart-legend--${props.size}`);
  if (props.interactive) {
    classes.push('chart-legend--interactive');
  }
  return classes;
});

const containerStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.maxWidth) {
    style.maxWidth = `${props.maxWidth}px`;
  }
  return style;
});

const getItemClass = (index: number) => {
  const classes = ['legend-item'];
  if (hoveredIndex.value === index) {
    classes.push('legend-item--hovered');
  }
  if (props.data[index]?.disabled) {
    classes.push('legend-item--disabled');
  }
  return classes;
};

const formatValue = (value: number) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value);
  }
  return value.toLocaleString();
};

const handleMouseEnter = (index: number) => {
  if (!props.interactive || props.data[index]?.disabled) return;
  hoveredIndex.value = index;
  emit('item-hover', index);
};

const handleMouseLeave = () => {
  if (!props.interactive) return;
  hoveredIndex.value = null;
  emit('item-hover', null);
};

const handleClick = (index: number) => {
  if (!props.interactive || props.data[index]?.disabled) return;
  emit('item-click', index);
};
</script>

<style scoped>
.chart-legend {
  display: flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Direction variants */
.chart-legend--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.chart-legend--vertical {
  flex-direction: column;
  gap: 8px;
}

/* Legend item */
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  border-radius: 6px;
}

.chart-legend--interactive .legend-item {
  cursor: pointer;
}

.chart-legend--interactive .legend-item:hover:not(.legend-item--disabled) {
  background: hsl(var(--surface-hover));
}

/* Size variants */
.chart-legend--sm .legend-item {
  padding: 4px 6px;
  gap: 6px;
}

.chart-legend--sm .legend-indicator {
  width: 6px;
  height: 6px;
}

.chart-legend--sm .legend-name,
.chart-legend--sm .legend-value,
.chart-legend--sm .legend-percentage {
  font-size: 11px;
}

.chart-legend--md .legend-item {
  padding: 6px 8px;
}

.chart-legend--md .legend-indicator {
  width: 8px;
  height: 8px;
}

.chart-legend--md .legend-name,
.chart-legend--md .legend-value,
.chart-legend--md .legend-percentage {
  font-size: 12px;
}

.chart-legend--lg .legend-item {
  padding: 8px 10px;
  gap: 10px;
}

.chart-legend--lg .legend-indicator {
  width: 10px;
  height: 10px;
}

.chart-legend--lg .legend-name,
.chart-legend--lg .legend-value,
.chart-legend--lg .legend-percentage {
  font-size: 13px;
}

/* Color indicator */
.legend-indicator {
  flex-shrink: 0;
  border-radius: 50%;
  transition: transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.legend-item--hovered .legend-indicator {
  transform: scale(1.3);
}

/* Content area */
.legend-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.legend-name {
  color: hsl(var(--text));
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.legend-value {
  color: hsl(var(--text-secondary));
  font-weight: 400;
  white-space: nowrap;
}

.legend-percentage {
  color: hsl(var(--primary));
  font-weight: 600;
  white-space: nowrap;
  min-width: 36px;
  text-align: right;
}

/* Disabled state */
.legend-item--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.legend-item--disabled .legend-indicator {
  background: hsl(var(--text-muted)) !important;
}

/* Horizontal layout specific */
.chart-legend--horizontal .legend-item {
  flex-shrink: 0;
}

.chart-legend--horizontal .legend-content {
  flex: none;
}

/* Responsive adjustments */
@media (max-width: 639.98px) {
  .chart-legend--horizontal {
    gap: 8px 12px;
  }

  .legend-item {
    padding: 6px 8px;
  }

  .legend-name,
  .legend-value,
  .legend-percentage {
    font-size: 12px;
  }
}
</style>
