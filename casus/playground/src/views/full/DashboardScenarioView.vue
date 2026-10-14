<template>
  <AdminPage
    title="运营仪表板"
    subtitle="业务组件：DashboardOverviewPanel + OpsHealthGaugeBoard"
    presentation-mode="summary"
    scene="workbench"
  >
    <template #toolbar>
      <Button variant="secondary" :loading="loading" @click="load">刷新指标</Button>
    </template>

    <AdminWorkList
      :region-state="regionState"
      error-text="指标加载失败"
    >
      <DashboardOverviewPanel
        :metrics="metrics"
        @metric-action="onMetricAction"
      />
      <OpsHealthGaugeBoard
        :gauges="gauges"
        :alerts="alerts"
        :ring-completed="14"
        :ring-total="20"
        @alert-detail="onAlertDetail"
      />
    </AdminWorkList>
  </AdminPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Button } from '@ocpui/vue';
import { AdminPage, AdminWorkList } from '@ocpui/vue-admin';
import { useUiActionFeedback } from '@ocpui/vue/system';
import type { UiDataState } from '@ocpui/vue-admin';
import DashboardOverviewPanel from '@/business/DashboardOverviewPanel.vue';
import OpsHealthGaugeBoard from '@/business/OpsHealthGaugeBoard.vue';
import {
  fetchAlerts,
  fetchHealthGauges,
  fetchMetricSnapshot,
  type AlertRecord,
  type HealthGauge,
  type MetricSnapshot,
} from '@/mock/api';

const action = useUiActionFeedback();

const loading = ref(false);
const regionState = ref<UiDataState>('loading');
const metrics = ref<MetricSnapshot[]>([]);
const gauges = ref<HealthGauge[]>([]);
const alerts = ref<AlertRecord[]>([]);

async function load() {
  loading.value = true;
  regionState.value = 'loading';
  try {
    const [m, g, a] = await Promise.all([
      fetchMetricSnapshot(),
      fetchHealthGauges(),
      fetchAlerts(),
    ]);
    metrics.value = m;
    gauges.value = g;
    alerts.value = a;
    regionState.value = 'ready';
  } catch {
    regionState.value = 'error';
  } finally {
    loading.value = false;
  }
}

function onMetricAction(key: string) {
  action.message.info(`查看指标：${key}`);
}

function onAlertDetail(id: string) {
  action.message.warning(`告警详情 #${id}`);
}

onMounted(load);
</script>
