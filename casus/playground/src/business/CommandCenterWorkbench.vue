<template>
  <div class="cmd-workbench" data-ui-dispatch-role="content-host">
    <!-- 概览 Tab -->
    <div v-show="shellTab === 'overview'" class="cmd-workbench__overview">
      <section class="cmd-workbench__metrics">
        <DashboardOverviewPanel
          title="实时 SLO 概览"
          :metrics="metrics"
          summary-trend="up"
          summary-trend-value="+3.2%"
          @metric-action="onMetricDrill"
        />
      </section>

      <div class="cmd-workbench__grid">
        <div class="cmd-workbench__main">
          <UiScenarioScope surface="chart" scene="workbench">
            <div class="playground-card cmd-workbench__charts">
              <Tabs v-model:value="visualTab" type="line" size="sm">
                <TabPane tab="错误趋势" value="trend">
                  <TrendChart
                    title=""
                    :labels="trend.labels"
                    :datasets="trend.datasets"
                    :height="220"
                  />
                </TabPane>
                <TabPane tab="南北向流量" value="traffic">
                  <NetworkTrafficChart
                    :data="trafficData"
                    :width="640"
                    :height="120"
                  />
                </TabPane>
                <TabPane tab="服务热力" value="heat">
                  <HeatmapChart
                    :data="heatmapData"
                    :width="560"
                    :height="200"
                    :value-formatter="(v) => `${v}%`"
                    @cell-click="onHeatmapCell"
                  />
                </TabPane>
              </Tabs>
            </div>
          </UiScenarioScope>

          <div class="playground-card">
            <div class="cmd-workbench__section-head">
              <h3>事件队列（Top 5）</h3>
              <Button size="sm" variant="text" @click="emit('switch-tab', 'incidents')">查看全部</Button>
            </div>
            <DataTable
              :columns="incidentColumns"
              :data="incidentPreview"
              row-key="id"
              size="sm"
              variant="plain"
              hoverable
              @row-click="onRowClick"
            >
              <template #cell-severity="{ row }">
                <StatusTag :status="severityStatus(String(row.severity))" />
              </template>
              <template #cell-status="{ row }">
                <StatusTag :status="incidentStatusTag(String(row.status))" />
              </template>
            </DataTable>
          </div>
        </div>

        <aside class="cmd-workbench__rail">
          <OpsHealthGaugeBoard
            :gauges="gauges"
            :alerts="alerts"
            :ring-completed="resolvedCount"
            :ring-total="totalIncidents"
            @alert-detail="onAlertDetail"
          />
          <div class="playground-card cmd-workbench__timeline">
            <h3>活动流</h3>
            <Timeline>
              <TimelineItem
                v-for="ev in timeline"
                :key="ev.id"
                :title="ev.title"
                :description="`${ev.time} · ${ev.detail}`"
              />
            </Timeline>
          </div>
        </aside>
      </div>
    </div>

    <!-- 事件 Tab -->
    <div v-show="shellTab === 'incidents'" class="cmd-workbench__incidents">
      <AdminFilterToolbar
        :active-filters="activeFilters"
        @remove-filter="removeFilter"
        @clear-filters="clearFilters"
      >
        <template #filters>
          <Select v-model="filterSeverity" :options="severityOptions" placeholder="级别" size="sm" />
          <Select v-model="filterService" :options="serviceFilterOptions" placeholder="服务" size="sm" />
          <Search v-model="filterKeyword" placeholder="搜索事件 ID / 标题" size="sm" />
        </template>
        <template #actions>
          <Button size="sm" variant="secondary" @click="refreshIncidents">刷新</Button>
        </template>
      </AdminFilterToolbar>

      <SelectionToolbar
        :visible="selectedKeys.length > 0"
        :count="selectedKeys.length"
        :selected-items="selectedRows"
        :actions="batchActions"
        @action-click="onBatchAction"
        @clear="selectedKeys = []"
      />

      <AdminWorkList v-bind="workListProps" empty-title="无匹配事件">
        <DataTable
          :columns="incidentColumnsFull"
          :data="tableRows"
          row-key="id"
          selectable
          :selected-keys="selectedKeys"
          hoverable
          @select="onSelect"
          @row-click="onRowClick"
        >
          <template #cell-severity="{ row }">
            <StatusTag :status="severityStatus(String(row.severity))" />
          </template>
          <template #cell-status="{ row }">
            <StatusTag :status="incidentStatusTag(String(row.status))" />
          </template>
          <template #cell-impact="{ row }">
            {{ Number(row.impact).toLocaleString() }}
          </template>
        </DataTable>
      </AdminWorkList>
    </div>

    <!-- 容量 Tab -->
    <div v-show="shellTab === 'capacity'" class="cmd-workbench__capacity">
      <UiScenarioScope surface="chart" presentation-mode="detail">
        <div class="playground-card">
          <HeatmapChart
            :data="heatmapData"
            :width="900"
            :height="280"
            :value-formatter="(v) => `${v}%`"
            @cell-click="onHeatmapCell"
          />
        </div>
        <AbnormalList
          title="异常操作检测"
          :items="abnormalItems"
          batch-mode
          @view-detail="openIncidentByTitle"
          @process="onAbnormalProcess"
        />
      </UiScenarioScope>
    </div>

    <!-- 事件处置 Drawer（progressive 分步） -->
    <Drawer
      v-model="drawerOpen"
      :title="activeIncident?.id ?? '事件处置'"
      size="lg"
      @close="triageStep = 0"
    >
      <template v-if="activeIncident">
        <Steps :current="triageStep" :steps="triageSteps" />
        <div class="cmd-workbench__triage-body">
          <template v-if="triageStep === 0">
            <Descriptions :items="impactItems" />
          </template>
          <template v-else-if="triageStep === 1">
            <Alert type="warning" :title="`根因候选：${activeIncident.service}`" />
            <Timeline>
              <TimelineItem title="指标偏离" description="P99 在 10:05 突增" />
              <TimelineItem title="关联部署" description="catalog-sync 09:48 发布" />
            </Timeline>
          </template>
          <template v-else-if="triageStep === 2">
            <Input v-model="triageNote" label="处置备注" placeholder="记录 mitigation 动作" />
          </template>
          <template v-else>
            <Result status="success" title="准备关闭" :subtitle="triageNote || '无备注'" />
          </template>
        </div>
      </template>
      <template #footer>
        <Button variant="secondary" :disabled="triageStep === 0" @click="triageStep -= 1">上一步</Button>
        <Button v-if="triageStep < 3" @click="triageStep += 1">下一步</Button>
        <Button v-else variant="primary" @click="closeIncident">关闭事件</Button>
      </template>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  HeatmapChart,
  Input,
  Result,
  Search,
  Select,
  StatusTag,
  Steps,
  Tabs,
  TabPane,
  Timeline,
  TimelineItem,
  TrendChart,
  UiScenarioScope,
  AbnormalList,
  SelectionToolbar,
  type StatusType,
  type AbnormalItem,
} from '@ocpui/vue';
import NetworkTrafficChart from '@ocpui/vue/data-display/NetworkTrafficChart.vue';
import {
  AdminFilterToolbar,
  AdminWorkList,
  DataTable,
  useAdminListRegion,
} from '@ocpui/vue-admin';
import { useUiActionFeedback, useUiSystemFeedback } from '@ocpui/vue/system';
import DashboardOverviewPanel from './DashboardOverviewPanel.vue';
import OpsHealthGaugeBoard from './OpsHealthGaugeBoard.vue';
import type { MetricSnapshot } from '@/mock/api';
import {
  batchAcknowledgeIncidents,
  escalateIncident,
  fetchIncidents,
  getAbnormalItems,
  getAlerts,
  getHeatmapData,
  getMetricsSnapshot,
  getTimeline,
  getTrafficData,
  getTrendData,
  getIncidentById,
  resolveIncident,
  severityOptions,
  serviceOptions,
  type Incident,
} from '@/mock/command-center';
import type { ActiveFilter } from '@ocpui/vue';

const props = defineProps<{
  shellTab: 'overview' | 'incidents' | 'capacity';
  liveEnabled: boolean;
}>();

const emit = defineEmits<{
  'switch-tab': [tab: 'overview' | 'incidents' | 'capacity'];
  'live-tick': [];
}>();

const action = useUiActionFeedback();
const system = useUiSystemFeedback();

const visualTab = ref('trend');
const metrics = ref<MetricSnapshot[]>([]);
const gauges = ref(getMetricsSnapshot().gauges);
const alerts = ref(getAlerts());
const trend = ref(getTrendData());
const trafficData = ref(getTrafficData());
const heatmapData = ref(getHeatmapData());
const timeline = ref(getTimeline());
const abnormalItems = ref(getAbnormalItems());

const filterSeverity = ref('');
const filterService = ref('');
const filterKeyword = ref('');

const serviceFilterOptions = [{ label: '全部服务', value: '' }, ...serviceOptions];

const listRegion = useAdminListRegion<Incident[]>({
  fetch: () =>
    fetchIncidents({
      severity: filterSeverity.value as '' | Incident['severity'],
      service: filterService.value,
      keyword: filterKeyword.value,
    }),
});

const { workListProps, refresh, data } = listRegion;
const tableRows = computed(() => (data.value ?? []) as unknown as Record<string, unknown>[]);
const incidentPreview = computed(() => tableRows.value.slice(0, 5));

const selectedKeys = ref<string[]>([]);
const selectedRows = computed(() =>
  (data.value ?? []).filter((r) => selectedKeys.value.includes(r.id)),
);

const drawerOpen = ref(false);
const activeIncident = ref<Incident | null>(null);
const triageStep = ref(0);
const triageNote = ref('');
const triageSteps = [
  { title: '影响确认' },
  { title: '根因分析' },
  { title: '处置动作' },
  { title: '关闭' },
];

const incidentColumns = [
  { key: 'id', title: 'ID' },
  { key: 'title', title: '标题' },
  { key: 'severity', title: '级别' },
  { key: 'status', title: '状态' },
];

const incidentColumnsFull = [
  ...incidentColumns,
  { key: 'service', title: '服务' },
  { key: 'impact', title: '影响用户' },
  { key: 'assignee', title: '负责人' },
  { key: 'updatedAt', title: '更新' },
];

const batchActions = [
  { key: 'ack', label: '批量确认', variant: 'primary' as const },
  { key: 'escalate', label: '升级', variant: 'secondary' as const },
];

const activeFilters = computed<ActiveFilter[]>(() => {
  const f: ActiveFilter[] = [];
  if (filterSeverity.value) {
    f.push({ key: 'severity', label: '级别', value: filterSeverity.value, valueLabel: filterSeverity.value });
  }
  if (filterService.value) {
    f.push({ key: 'service', label: '服务', value: filterService.value, valueLabel: filterService.value });
  }
  if (filterKeyword.value.trim()) {
    const q = filterKeyword.value.trim();
    f.push({ key: 'q', label: '关键词', value: q, valueLabel: q });
  }
  return f;
});

const resolvedCount = computed(
  () => (data.value ?? []).filter((r) => r.status === 'resolved').length,
);
const totalIncidents = computed(() => (data.value ?? []).length);

const impactItems = computed(() => {
  if (!activeIncident.value) return [];
  const i = activeIncident.value;
  return [
    { label: '服务', value: i.service },
    { label: '影响用户', value: String(i.impact) },
    { label: '持续', value: `${i.durationMin} min` },
    { label: '级别', value: i.severity },
  ];
});

function severityStatus(s: string): StatusType {
  const map: Record<string, StatusType> = {
    critical: 'high-risk',
    high: 'high-risk',
    medium: 'medium-risk',
    low: 'low-risk',
  };
  return map[s] ?? 'low-risk';
}

function incidentStatusTag(s: string): StatusType {
  const map: Record<string, StatusType> = {
    open: 'open',
    acknowledged: 'mitigated',
    investigating: 'executing',
    resolved: 'closed',
  };
  return map[s] ?? 'open';
}

function refreshMetrics() {
  const snap = getMetricsSnapshot();
  metrics.value = snap.metrics;
  gauges.value = snap.gauges;
  trafficData.value = getTrafficData();
  timeline.value = getTimeline();
}

async function refreshIncidents() {
  system.loading.overlay.show({ text: '同步事件…' });
  await refresh();
  system.loading.overlay.hide();
  system.notify.success('已刷新', `${(data.value ?? []).length} 条事件`);
}

function onSelect(keys: (string | number)[]) {
  selectedKeys.value = keys.map(String);
}

async function onBatchAction(act: { key: string }) {
  if (act.key === 'ack') {
    const ok = await action.dialog.confirm({
      title: '批量确认',
      content: `确认 ${selectedKeys.value.length} 条事件？`,
    });
    if (!ok) return;
    await batchAcknowledgeIncidents(selectedKeys.value);
    action.message.success('已批量确认');
    selectedKeys.value = [];
    await refresh();
    refreshMetrics();
    return;
  }
  if (act.key === 'escalate') {
    for (const id of selectedKeys.value) await escalateIncident(id);
    action.message.warning('已升级选中事件');
    await refresh();
  }
}

function onRowClick(row: Record<string, unknown>) {
  const inc = getIncidentById(String(row.id));
  if (inc) {
    activeIncident.value = inc;
    triageStep.value = 0;
    drawerOpen.value = true;
  }
}

async function closeIncident() {
  if (!activeIncident.value) return;
  const ok = await action.dialog.confirm({
    title: '关闭事件',
    content: `关闭 ${activeIncident.value.id}？`,
  });
  if (!ok) return;
  await resolveIncident(activeIncident.value.id);
  action.message.success('事件已关闭');
  drawerOpen.value = false;
  await refresh();
  refreshMetrics();
}

function onMetricDrill(key: string) {
  action.message.info(`下钻指标：${key}`);
  if (key === 'queue') emit('switch-tab', 'capacity');
}

function onHeatmapCell(cell: { yLabel?: string }) {
  if (cell.yLabel) {
    filterService.value = cell.yLabel;
    emit('switch-tab', 'incidents');
    void refresh();
    system.notify.info('筛选已应用', cell.yLabel);
  }
}

function onAlertDetail(id: string) {
  action.message.warning(`告警 ${id}`);
}

function onAbnormalProcess(item: AbnormalItem) {
  action.message.success(`已处理：${item.typeLabel}`);
}

function openIncidentByTitle(item: AbnormalItem) {
  action.message.info(item.typeLabel);
}

function removeFilter(f: ActiveFilter) {
  if (f.key === 'severity') filterSeverity.value = '';
  if (f.key === 'service') filterService.value = '';
  if (f.key === 'q') filterKeyword.value = '';
}

function clearFilters() {
  filterSeverity.value = '';
  filterService.value = '';
  filterKeyword.value = '';
}

watch([filterSeverity, filterService, filterKeyword], () => {
  if (props.shellTab === 'incidents') void refresh();
});

let liveTimer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  refreshMetrics();
  await refresh();
});

watch(
  () => props.liveEnabled,
  (on) => {
    if (liveTimer) clearInterval(liveTimer);
    if (on) {
      liveTimer = setInterval(() => {
        refreshMetrics();
        emit('live-tick');
      }, 5000);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer);
});

defineExpose({ refreshIncidents, refreshMetrics });
</script>

<style scoped>
.cmd-workbench {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cmd-workbench__grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  align-items: start;
}

.cmd-workbench__main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.cmd-workbench__rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cmd-workbench__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.cmd-workbench__section-head h3 {
  margin: 0;
  font-size: 0.9375rem;
}

.cmd-workbench__timeline h3 {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
}

.cmd-workbench__charts {
  overflow: auto;
}

.cmd-workbench__incidents {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cmd-workbench__triage-body {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 960px) {
  .cmd-workbench__grid {
    grid-template-columns: 1fr;
  }
}
</style>
