&lt;!--
核心负载图表组件

Props:
- loads: number[] - 各核心负载数组 (0-100)
- highThreshold?: number - 高负载阈值，默认值：70
- showAverage?: boolean - 是否显示平均负载，默认值：true
- maxCores?: number - 最大显示核心数，默认值：16

Usage:
&lt;CoreLoadChart
  :loads="[45, 60, 75, 30, 50, 65, 80, 40]"
  :highThreshold="70"
  :showAverage="true"
  :maxCores="8"
/&gt;
--&gt;
<template>
  <div class="core-load-chart" role="graph" :aria-label="t('components.dataDisplay.coreLoadChart.chartAriaLabel')">
    <div class="cores-container">
      <div
        v-for="(load, index) in normalizedLoads"
        :key="`core-${index}`"
        class="core-item"
        :class="{ 'core-item--high': load >= highThreshold }"
        role="graphics-document"
        :aria-label="t('components.dataDisplay.coreLoadChart.coreAriaLabel')"
      >
        <Tooltip :content="t('components.dataDisplay.coreLoadChart.coreTooltip', { index: index + 1, load: load.toFixed(1) })" placement="top">
          <div class="core-bar-wrapper">
            <div
              class="core-bar"
              :style="{
                height: `${load}%`,
                backgroundColor: getBarColor(load)
              }"
              :aria-valuenow="load"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-label="t('components.dataDisplay.coreLoadChart.coreBarAriaLabel', { index: index + 1, load: load.toFixed(1) })"
            />
          </div>
        </Tooltip>
        <span class="core-label" aria-hidden="true">{{ index + 1 }}</span>
      </div>
    </div>
    <div v-if="showAverage" class="average-info">
      <span class="average-label">{{ t('components.dataDisplay.coreLoadChart.averageLoad') }}</span>
      <span class="average-value" :style="{ color: getBarColor(averageLoad) }" aria-live="polite">
        {{ averageLoad.toFixed(1) }}%
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Tooltip } from '../feedback';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

export interface CoreLoadChartProps {
  /** 各核心负载数组 (0-100) */
  loads: number[];
  /** 高负载阈值 (默认70) */
  highThreshold?: number;
  /** 是否显示平均负载 */
  showAverage?: boolean;
  /** 最大显示核心数 */
  maxCores?: number;
}

const props = withDefaults(defineProps<CoreLoadChartProps>(), {
  highThreshold: 70,
  showAverage: true,
  maxCores: 16
});

// 规范化负载数据
const normalizedLoads = computed(() => {
  if (!Array.isArray(props.loads)) return [];
  return props.loads.slice(0, props.maxCores).map(load => {
    return Math.max(0, Math.min(100, load));
  });
});

// 计算平均负载
const averageLoad = computed(() => {
  if (normalizedLoads.value.length === 0) return 0;
  const sum = normalizedLoads.value.reduce((a, b) => a + b, 0);
  return sum / normalizedLoads.value.length;
});

// 获取柱状条颜色
const getBarColor = (load: number): string => {
  if (load >= 85) return 'hsl(var(--error))';
  if (load >= 70) return 'hsl(var(--warning))';
  return 'hsl(var(--primary))';
};
</script>

<style scoped>
.cores-container {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 4px;
  height: 40px;
}

.core-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  max-width: 24px;
}

.core-bar-wrapper {
  width: 100%;
  height: 32px;
  background-color: hsl(var(--surface-container-high));
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.core-bar {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-radius: 2px;
  transition: height 0.3s ease, background-color 0.2s ease;
  min-height: 2px;
}

.core-item--high .core-bar-wrapper {
  outline: 1px solid hsl(var(--error) / 0.3);
  outline-offset: 2px;
}

.core-label {
  font-size: 10px;
  color: hsl(var(--text-muted));
  font-variant-numeric: tabular-nums;
}

.average-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid hsl(var(--border));
}

.average-label {
  font-size: 11px;
  color: hsl(var(--text-secondary));
}

.average-value {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  transition: color 0.2s ease;
}

/* 响应式 */
@media (max-width: 639.98px) {
  .cores-container {
    gap: 2px;
    height: 32px;
  }

  .core-bar-wrapper {
    height: 24px;
  }

  .core-label {
    font-size: 9px;
  }

  .core-item {
    max-width: 16px;
  }
}
</style>
