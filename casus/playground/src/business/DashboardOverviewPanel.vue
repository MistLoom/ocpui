<template>
  <section
    class="dashboard-overview"
    v-bind="dispatchAttrs"
    :style="panelStyle"
  >
    <header class="dashboard-overview__header">
      <h3>{{ title }}</h3>
      <TrendIndicator v-if="summaryTrend" :trend="resolvedSummaryTrend" :label="summaryTrendValue" :show-value="false" />
    </header>
    <div class="ocp-chart-dashboard">
      <MetricCard
        v-for="item in metrics"
        :key="item.key"
        :title="item.title"
        :value="item.value"
        :unit="item.unit"
        :trend="item.trend === 'flat' ? 'stable' : item.trend"
        :trend-value="item.trendValue"
        :show-chart="true"
        :chart-data="item.chartData"
        :alarm="item.alarm"
        size="md"
        action-label="详情"
        @action="emit('metric-action', item.key)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MetricCard, TrendIndicator } from '@ocpui/vue';
import { shellDispatchAttrs, useUiMotion } from '@ocpui/vue/system';
import type { MetricSnapshot } from '@/mock/api';

const props = withDefaults(
  defineProps<{
    title?: string;
    metrics: MetricSnapshot[];
    summaryTrend?: 'up' | 'down' | 'flat';
    summaryTrendValue?: string;
  }>(),
  {
    title: '运营概览',
    summaryTrend: 'up',
    summaryTrendValue: '+6%',
  },
);

const emit = defineEmits<{
  'metric-action': [key: string];
}>();

// 演示趋势词表（flat）映射到组件趋势词表（stable）
const resolvedSummaryTrend = computed(() =>
  props.summaryTrend === 'flat' ? 'stable' : props.summaryTrend,
);

const dispatchAttrs = shellDispatchAttrs('content-host');
const { resolve } = useUiMotion();
const panelMotion = resolve('explain_state', 'light');

const panelStyle = computed(() => ({
  transition: panelMotion.transition,
}));
</script>

<style scoped>
.dashboard-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-overview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.dashboard-overview__header h3 {
  margin: 0;
  font-size: 1rem;
}
</style>
