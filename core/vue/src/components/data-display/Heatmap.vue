<!--
Heatmap 热图组件

## 组件说明
热图组件，用于展示数据密度，如贡献热图

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| values | HeatmapValue[] | [] | 热图数据 |
| startDate | Date | undefined | 开始日期 |
| endDate | Date | undefined | 结束日期 |
| colors | string[] | ['hsl(var(--surface-container-high))', 'hsl(var(--primary) / 0.25)', 'hsl(var(--primary) / 0.5)', 'hsl(var(--primary) / 0.75)', 'hsl(var(--primary))'] | 颜色数组 |
| cellSize | number | 12 | 单元格大小 |
| cellRadius | number | 2 | 单元格圆角 |
| cellGap | number | 3 | 单元格间距 |
| showMonthLabels | boolean | true | 是否显示月份标签 |
| showDayLabels | boolean | true | 是否显示星期标签 |
| showLegend | boolean | true | 是否显示图例 |
| customClass | string | '' | 自定义类名 |

## 事件
无

## 使用示例
```vue
<template>
  <Heatmap
    :values="heatmapData"
    :startDate="startDate"
    :endDate="endDate"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Heatmap from './Heatmap.vue';

const startDate = ref(new Date('2023-01-01'));
const endDate = ref(new Date('2023-12-31'));
const heatmapData = ref([
  { date: '2023-01-01', count: 5 },
  { date: '2023-01-02', count: 10 },
  { date: '2023-01-03', count: 3 },
  // 更多数据...
]);
</script>
```
-->
<template>
  <div :class="heatmapClass">
    <div v-if="showMonthLabels" class="heatmap-months">
      <span
        v-for="(month, index) in months"
        :key="index"
        class="heatmap-month"
      >
        {{ month }}
      </span>
    </div>
    <div class="heatmap-container">
      <div v-if="showDayLabels" class="heatmap-days">
        <span v-for="day in days" :key="day" class="heatmap-day">{{ day }}</span>
      </div>
      <div class="heatmap-grid" ref="gridRef">
        <div
          v-for="(week, weekIndex) in weeks"
          :key="weekIndex"
          class="heatmap-week"
        >
          <div
            v-for="(day, dayIndex) in week"
            :key="dayIndex"
            class="heatmap-cell"
            :class="getCellClass(day)"
            :style="getCellStyle(day)"
            :title="getCellTitle(day)"
            @mouseenter="handleMouseEnter(day, $event)"
            @mouseleave="handleMouseLeave"
          ></div>
        </div>
      </div>
    </div>
    <div v-if="showLegend" class="heatmap-legend">
      <span class="heatmap-legend-label">{{ t('components.dataDisplay.heatmap.less') }}</span>
      <div
        v-for="(level, index) in levels"
        :key="index"
        class="heatmap-legend-item"
        :style="{ backgroundColor: level.color }"
      ></div>
      <span class="heatmap-legend-label">{{ t('components.dataDisplay.heatmap.more') }}</span>
    </div>
    <Teleport to="body">
      <Transition name="heatmap-tooltip">
        <div
          v-if="tooltipVisible"
          class="heatmap-tooltip"
          :style="tooltipStyle"
        >
          <div class="heatmap-tooltip-content">
            <div class="heatmap-tooltip-value">{{ tooltipData.value }}</div>
            <div class="heatmap-tooltip-date">{{ tooltipData.date }}</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface HeatmapValue {
  date: string;
  count: number;
}

interface Props {
  values?: HeatmapValue[];
  startDate?: Date;
  endDate?: Date;
  colors?: string[];
  cellSize?: number;
  cellRadius?: number;
  cellGap?: number;
  showMonthLabels?: boolean;
  showDayLabels?: boolean;
  showLegend?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  values: () => [],
  startDate: undefined,
  endDate: undefined,
  colors: () => [
    'hsl(var(--surface-container-high))',
    'hsl(var(--primary) / 0.25)',
    'hsl(var(--primary) / 0.5)',
    'hsl(var(--primary) / 0.75)',
    'hsl(var(--primary))',
  ],
  cellSize: 12,
  cellRadius: 2,
  cellGap: 3,
  showMonthLabels: true,
  showDayLabels: true,
  showLegend: true,
  customClass: '',
});

const gridRef = ref<HTMLElement>();
const tooltipVisible = ref(false);
const tooltipData = ref({ value: 0, date: '' });
const tooltipPosition = ref({ x: 0, y: 0 });

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const days = ['日', '一', '二', '三', '四', '五', '六'];

const heatmapClass = computed(() => {
  const classes = ['heatmap'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const levels = computed(() => {
  return props.colors.map((color, index) => ({
    level: index,
    color,
  }));
});

const dateRange = computed(() => {
  const end = props.endDate || new Date();
  const start = props.startDate || new Date(end.getFullYear() - 1, end.getMonth(), end.getDate());
  return { start, end };
});

const weeks = computed(() => {
  const { start, end } = dateRange.value;
  const weeks: Array<Array<{ date: Date; count: number; level: number }>> = [];
  let current = new Date(start);
  current.setHours(0, 0, 0, 0);
  
  const startDay = current.getDay();
  current.setDate(current.getDate() - startDay);
  
  while (current <= end) {
    const week: Array<{ date: Date; count: number; level: number }> = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(current);
      const dateStr = formatDate(date);
      const value = props.values.find(v => v.date === dateStr);
      const count = value?.count || 0;
      const level = getLevel(count);
      
      week.push({ date, count, level });
      current.setDate(current.getDate() + 1);
    }
    
    weeks.push(week);
  }
  
  return weeks;
});

const maxCount = computed(() => {
  return Math.max(...props.values.map(v => v.count), 1);
});

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLevel = (count: number): number => {
  if (count === 0) return 0;
  const ratio = count / maxCount.value;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
};

const getCellClass = (day: { date: Date; count: number; level: number }) => {
  return [`heatmap-cell--level-${day.level}`];
};

const getCellStyle = (day: { date: Date; count: number; level: number }) => {
  return {
    width: `${props.cellSize}px`,
    height: `${props.cellSize}px`,
    borderRadius: `${props.cellRadius}px`,
    backgroundColor: props.colors[day.level],
  };
};

const getCellTitle = (day: { date: Date; count: number; level: number }): string => {
  const dateStr = day.date.toLocaleDateString('zh-CN');
  return `${day.count} 次贡献 - ${dateStr}`;
};

const handleMouseEnter = (day: { date: Date; count: number; level: number }, event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  
  tooltipData.value = {
    value: day.count,
    date: day.date.toLocaleDateString('zh-CN'),
  };
  
  tooltipPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10,
  };
  
  tooltipVisible.value = true;
};

const handleMouseLeave = () => {
  tooltipVisible.value = false;
};

const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`,
  transform: 'translate(-50%, -100%)',
}));
</script>

<style scoped>
.heatmap {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.heatmap-months {
  display: flex;
  margin-left: 30px;
  margin-bottom: 8px;
}

.heatmap-month {
  flex: 1;
  font-size: 11px;
  color: hsl(var(--text-muted));
  text-align: left;
}

.heatmap-container {
  display: flex;
  gap: 8px;
}

.heatmap-days {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 2px 0;
}

.heatmap-day {
  font-size: 11px;
  color: hsl(var(--text-muted));
  height: 12px;
  line-height: 12px;
}

.heatmap-grid {
  display: flex;
  gap: 3px;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-cell {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.heatmap-cell:hover {
  transform: scale(1.1);
  outline: 2px solid hsl(var(--primary) / 0.5);
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  margin-left: 30px;
}

.heatmap-legend-label {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

.heatmap-legend-item {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.heatmap-tooltip {
  position: fixed;
  z-index: var(--z-tooltip);
  padding: 8px 12px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  box-shadow: 0 4px 12px hsl(var(--shadow));
  pointer-events: none;
}

.heatmap-tooltip-value {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text));
}

.heatmap-tooltip-date {
  font-size: 12px;
  color: hsl(var(--text-muted));
  margin-top: 2px;
}

.heatmap-tooltip-enter-active,
.heatmap-tooltip-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.heatmap-tooltip-enter-from,
.heatmap-tooltip-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-100% + 8px));
}
</style>