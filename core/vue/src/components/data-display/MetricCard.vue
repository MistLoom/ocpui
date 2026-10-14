<!--
MetricCard 指标卡片组件

## 组件说明
指标卡片组件，用于展示关键指标数据，支持趋势、进度条、子指标和迷你图表

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 指标标题 |
| value | number | - | 指标值 |
| unit | string | '' | 指标单位 |
| tooltip | string | '' | 指标提示 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | 卡片大小 |
| trend | 'up' \| 'down' \| 'flat' | undefined | 趋势方向 |
| trendValue | string | '' | 趋势值 |
| showProgress | boolean | false | 是否显示进度条 |
| progressPercent | number | 0 | 进度百分比 |
| progressLabel | string | '' | 进度标签 |
| subMetrics | SubMetric[] | [] | 子指标 |
| showChart | boolean | false | 是否显示图表 |
| chartData | number[] | [] | 图表数据 |
| chartWidth | number | 200 | 图表宽度 |
| chartHeight | number | 40 | 图表高度 |
| chartColor | string | 'hsl(var(--primary))' | 图表颜色 |
| actionLabel | string | '' | 操作标签 |
| alarm | boolean | false | 是否告警 |
| alarmThreshold | number | 0 | 告警阈值 |

## 事件
| 事件名 | 参数 | 说明 |
|-------|------|------|
| action | - | 操作事件 |

## 使用示例
```vue
<template>
  <MetricCard
    title="CPU使用率"
    :value="cpuUsage"
    unit="%"
    :trend="cpuTrend"
    :trendValue="cpuTrendValue"
    :showProgress="true"
    :progressPercent="cpuUsage"
    :showChart="true"
    :chartData="cpuHistory"
    :alarm="cpuUsage > 80"
    actionLabel="查看详情"
    @action="handleAction"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MetricCard from './MetricCard.vue';

const cpuUsage = ref(65);
const cpuTrend = ref('up');
const cpuTrendValue = ref('+5%');
const cpuHistory = ref([45, 55, 60, 58, 65, 62, 68]);

const handleAction = () => {
};
</script>
```
-->
<template>
  <Card
    class="metric-card"
    :class="[`metric-card--${size}`, { 'metric-card--alarm': isAlarm }]"
    :size="size"
    :bordered="true"
    shadow="hover"
  >
    <template #header>
      <div class="metric-header">
        <span class="metric-title">{{ title }}</span>
        <Tooltip v-if="tooltip" :content="tooltip" placement="top">
          <span class="metric-info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </span>
        </Tooltip>
      </div>
    </template>
    
    <div class="metric-content">
      <div class="metric-value-row">
        <AnimatedNumber
          :value="props.value"
          :duration="800"
          :format="formatMetricValue"
          class="metric-value"
          :class="{ 'metric-value--alarm': isAlarm }"
        />
        <span v-if="unit" class="metric-unit">{{ unit }}</span>
        <TrendIndicator
          v-if="trend !== undefined"
          :direction="trend"
          :value="Number(trendValue) || 0"
          size="sm"
        />
      </div>
      
      <div v-if="showProgress" class="metric-progress">
        <Progress
          :percent="progressPercent"
          :dynamic-color="true"
          :show-info="false"
          size="sm"
          :stroke-width="6"
        />
        <span v-if="progressLabel" class="metric-progress-label">{{ progressLabel }}</span>
      </div>
      
      <div v-if="subMetrics && subMetrics.length > 0" class="metric-sub-metrics">
        <div
          v-for="(sub, index) in subMetrics"
          :key="index"
          class="metric-sub-item"
          :class="{ 'metric-sub-item--alarm': sub.alarm }"
        >
          <span class="metric-sub-label">{{ sub.label }}</span>
          <span class="metric-sub-value">
            {{ sub.value }}
            <span v-if="sub.alarm" class="metric-alarm-icon">⚠️</span>
          </span>
        </div>
      </div>
      
      <MiniLineChart
        v-if="showChart && chartData && chartData.length > 0"
        :data="chartDataWithLabels"
        :height="chartHeight"
        :line-color="chartColor"
        :show-points="false"
        class="metric-chart"
      />
    </div>
    
    <template v-if="actionLabel" #footer>
      <button type="button" class="metric-action" @click="handleAction">
        <span>{{ actionLabel }}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from './Card.vue';
import Tooltip from '../feedback/Tooltip.vue';
import Progress from './Progress.vue';
import AnimatedNumber from './AnimatedNumber.vue';
import TrendIndicator from './TrendIndicator.vue';
import MiniLineChart from './MiniLineChart.vue';

export interface SubMetric {
  label: string;
  value: string | number;
  alarm?: boolean;
}

export interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
  trend?: 'up' | 'down' | 'stable' | 'neutral';
  trendValue?: string;
  showProgress?: boolean;
  progressPercent?: number;
  progressLabel?: string;
  subMetrics?: SubMetric[];
  showChart?: boolean;
  chartData?: number[];
  chartWidth?: number;
  chartHeight?: number;
  chartColor?: string;
  actionLabel?: string;
  alarm?: boolean;
  alarmThreshold?: number;
}

const props = withDefaults(defineProps<MetricCardProps>(), {
  unit: '',
  tooltip: '',
  size: 'md',
  trend: undefined,
  trendValue: '',
  showProgress: false,
  progressPercent: 0,
  progressLabel: '',
  subMetrics: () => [],
  showChart: false,
  chartData: () => [],
  chartWidth: 200,
  chartHeight: 40,
  chartColor: 'hsl(var(--primary))',
  actionLabel: '',
  alarm: false,
  alarmThreshold: 0,
});

const emit = defineEmits<{
  action: [];
}>();

const formatMetricValue = (value: number): string => {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return Math.round(value).toLocaleString('zh-CN');
};

// 转换chartData为MiniLineChart需要的格式
const chartDataWithLabels = computed(() => {
  return (props.chartData || []).map((value, index) => ({
    label: `T-${props.chartData!.length - index}`,
    value,
  }));
});

const isAlarm = computed(() => {
  return props.alarm || (props.alarmThreshold > 0 && props.value > props.alarmThreshold);
});

const handleAction = () => {
  emit('action');
};
</script>

<script lang="ts">
export default { name: 'MetricCard' };
</script>

<style scoped>
.metric-card {
  transition:
    border-color var(--duration-normal) var(--ease-standard),
    box-shadow var(--duration-normal) var(--ease-standard);
}

.metric-card--alarm {
  border-color: hsl(var(--error) / 0.5);
  box-shadow: 0 0 0 1px hsl(var(--error) / 0.2);
}

.metric-card--alarm :deep(.card-header) {
  background: hsl(var(--error) / 0.05);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-title {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
}

.metric-info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: hsl(var(--text-muted));
  cursor: help;
  transition: color 0.2s;
}

.metric-info-icon:hover {
  color: hsl(var(--primary));
}

.metric-info-icon svg {
  width: 100%;
  height: 100%;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: hsl(var(--text));
  line-height: 1;
  font-variant-numeric: tabular-nums;
  transition: color var(--duration-normal) var(--ease-standard);
}

.metric-value--alarm {
  color: hsl(var(--error));
}

.metric-unit {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
}

.metric-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-progress-label {
  font-size: 12px;
  color: hsl(var(--text-muted));
  text-align: right;
}

.metric-sub-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid hsl(var(--border));
}

.metric-sub-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.metric-sub-label {
  color: hsl(var(--text-secondary));
}

.metric-sub-value {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: hsl(var(--text));
}

.metric-sub-item--alarm .metric-sub-value {
  color: hsl(var(--error));
}

.metric-alarm-icon {
  font-size: 12px;
  animation: alarm-pulse 2s infinite;
}

@keyframes alarm-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.metric-chart {
  margin-top: 8px;
}

.metric-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--primary));
  cursor: pointer;
  transition:
    color var(--duration-normal) var(--ease-standard),
    background-color var(--duration-normal) var(--ease-standard),
    gap var(--duration-normal) var(--ease-standard);
  border: none;
  width: 100%;
  background: transparent;
}

.metric-action:hover {
  background: hsl(var(--primary) / 0.05);
  gap: 12px;
}

.metric-action svg {
  width: 14px;
  height: 14px;
  transition: transform 0.25s;
}

.metric-action:hover svg {
  transform: translateX(4px);
}

/* Size variants */
.metric-card--sm .metric-value {
  font-size: 24px;
}

.metric-card--sm .metric-title {
  font-size: 12px;
}

.metric-card--lg .metric-value {
  font-size: 40px;
}

.metric-card--lg .metric-title {
  font-size: 16px;
}

.metric-card--lg .metric-sub-metrics {
  gap: 12px;
}

.metric-card--lg .metric-sub-item {
  font-size: 14px;
}

@media (max-width: 768px) {
  .metric-card--md .metric-value,
  .metric-card--lg .metric-value {
    font-size: 24px;
  }

  .metric-card .metric-value {
    font-size: 20px;
  }
}
</style>
