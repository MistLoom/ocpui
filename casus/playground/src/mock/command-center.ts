/** 运营指挥台 mock — 对标可观测性/事件响应平台（Datadog Incident 简化） */

import type { AbnormalItem } from '@ocpui/vue';

export type { AbnormalItem };

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assignee: string;
  impact: number;
  durationMin: number;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  type: 'incident' | 'deploy' | 'alert' | 'action';
}

const SERVICES = ['entry-api', 'dimension-worker', 'outbox-dispatch', 'catalog-sync', 'notify-sse'];

let incidentStore: Incident[] = [
  { id: 'INC-1042', title: '维度重算 P99 超阈值', service: 'dimension-worker', severity: 'critical', status: 'open', assignee: '—', impact: 1280, durationMin: 42, updatedAt: '10:18' },
  { id: 'INC-1041', title: 'Outbox 投递延迟飙升', service: 'outbox-dispatch', severity: 'high', status: 'investigating', assignee: 'ops-bot', impact: 890, durationMin: 95, updatedAt: '10:05' },
  { id: 'INC-1040', title: 'Catalog 注册表版本冲突', service: 'catalog-sync', severity: 'medium', status: 'acknowledged', assignee: 'admin', impact: 120, durationMin: 210, updatedAt: '09:52' },
  { id: 'INC-1039', title: 'Entry API 5xx 比率上升', service: 'entry-api', severity: 'high', status: 'open', assignee: '—', impact: 640, durationMin: 28, updatedAt: '09:40' },
  { id: 'INC-1038', title: 'SSE 连接间歇断开', service: 'notify-sse', severity: 'low', status: 'resolved', assignee: 'ops-bot', impact: 45, durationMin: 360, updatedAt: '09:12' },
  { id: 'INC-1037', title: '批次重算队列堆积', service: 'dimension-worker', severity: 'medium', status: 'investigating', assignee: 'admin', impact: 310, durationMin: 130, updatedAt: '08:55' },
  { id: 'INC-1036', title: '跨区复制延迟', service: 'catalog-sync', severity: 'low', status: 'acknowledged', assignee: '—', impact: 80, durationMin: 480, updatedAt: '08:30' },
];

let timelineStore: TimelineEvent[] = [
  { id: 't1', time: '10:18', title: 'P1 事件创建', detail: 'INC-1042 维度重算超时', type: 'incident' },
  { id: 't2', time: '10:12', title: '自动扩容', detail: 'dimension-worker +2 实例', type: 'action' },
  { id: 't3', time: '10:05', title: '告警触发', detail: 'Outbox 深度 > 500', type: 'alert' },
  { id: 't4', time: '09:48', title: '部署完成', detail: 'catalog-sync v2.4.1', type: 'deploy' },
];

const delay = (ms = 360) => new Promise((r) => setTimeout(r, ms));

export async function fetchIncidents(filter?: {
  severity?: IncidentSeverity | '';
  service?: string;
  keyword?: string;
}): Promise<Incident[]> {
  await delay();
  let rows = [...incidentStore];
  if (filter?.severity) rows = rows.filter((r) => r.severity === filter.severity);
  if (filter?.service) rows = rows.filter((r) => r.service === filter.service);
  if (filter?.keyword?.trim()) {
    const q = filter.keyword.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.service.includes(q),
    );
  }
  return rows.sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));
}

function severityWeight(s: IncidentSeverity): number {
  return { critical: 4, high: 3, medium: 2, low: 1 }[s];
}

export async function batchAcknowledgeIncidents(ids: string[]): Promise<void> {
  await delay(400);
  incidentStore = incidentStore.map((row) =>
    ids.includes(row.id) && row.status === 'open'
      ? { ...row, status: 'acknowledged' as const, assignee: '当前用户', updatedAt: nowTime() }
      : row,
  );
  pushTimeline('批量确认', `${ids.length} 条事件已确认`, 'action');
}

export async function escalateIncident(id: string): Promise<void> {
  await delay(300);
  incidentStore = incidentStore.map((row) =>
    row.id === id ? { ...row, severity: bumpSeverity(row.severity), updatedAt: nowTime() } : row,
  );
}

function bumpSeverity(s: IncidentSeverity): IncidentSeverity {
  if (s === 'low') return 'medium';
  if (s === 'medium') return 'high';
  if (s === 'high') return 'critical';
  return 'critical';
}

export function getMetricsSnapshot() {
  const errorRate = 2.4 + Math.random() * 0.8;
  const latency = 180 + Math.floor(Math.random() * 40);
  const throughput = 1200 + Math.floor(Math.random() * 200);
  const queueDepth = 3.5 + Math.random() * 2;
  return {
    metrics: [
      { key: 'errorRate', title: '错误率', value: +errorRate.toFixed(1), unit: '%', trend: 'up' as const, trendValue: '+0.2%', chartData: genSparkline(errorRate, 6), alarm: errorRate > 2.8 },
      { key: 'latency', title: 'P99 延迟', value: latency, unit: 'ms', trend: 'down' as const, trendValue: '-5ms', chartData: genSparkline(latency / 10, 6) },
      { key: 'throughput', title: '请求吞吐', value: throughput, unit: 'req/s', trend: 'up' as const, trendValue: '+8%', chartData: genSparkline(throughput / 100, 6) },
      { key: 'queue', title: '队列深度', value: +queueDepth.toFixed(1), unit: 'k', trend: 'flat' as const, trendValue: '±0', chartData: genSparkline(queueDepth, 6), alarm: queueDepth > 4.5 },
    ],
    gauges: [
      { label: 'CPU', value: 55 + Math.floor(Math.random() * 25), min: 0, max: 100, unit: '%' },
      { label: '内存', value: 60 + Math.floor(Math.random() * 20), min: 0, max: 100, unit: '%' },
      { label: 'Saturation', value: +(2 + Math.random() * 6).toFixed(1), min: 0, max: 10, unit: '' },
    ],
  };
}

function genSparkline(base: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => Math.round(base * (0.85 + (i / n) * 0.3 + Math.random() * 0.1)));
}

export function getTrendData() {
  const labels = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'];
  return {
    labels,
    datasets: [
      { label: '5xx 比率', data: [0.8, 1.1, 1.4, 2.0, 2.4, 2.6], color: 'hsl(0, 84%, 60%)' },
      { label: 'P99 ms', data: [120, 135, 150, 170, 186, 195], color: 'hsl(217, 91%, 60%)' },
    ],
  };
}

export function getTrafficData() {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${6 + i}:00`,
    upload: 800 + Math.random() * 400,
    download: 1200 + Math.random() * 600,
  }));
}

export function getHeatmapData() {
  const hours = ['06', '07', '08', '09', '10', '11'];
  const cells: { x: number; y: number; value: number; xLabel: string; yLabel: string }[] = [];
  SERVICES.forEach((svc, y) => {
    hours.forEach((h, x) => {
      cells.push({
        x,
        y,
        value: Math.round(20 + Math.random() * 80),
        xLabel: `${h}:00`,
        yLabel: svc,
      });
    });
  });
  return cells;
}

export function getAlerts() {
  return [
    { id: 'a1', title: 'SLO 违约风险', message: 'entry-api 可用性 99.2% < 99.5%', time: '10:16', level: 'error' as const },
    { id: 'a2', title: '队列积压', message: 'outbox 待投递 612 条', time: '10:08', level: 'warning' as const },
    { id: 'a3', title: '部署探测', message: 'catalog-sync 金丝雀通过', time: '09:50', level: 'info' as const },
  ];
}

export function getAbnormalItems(): AbnormalItem[] {
  return [
    { id: 'ab1', type: 'batch-recompute', typeLabel: '异常批量重算', description: '5min 内触发 12 次全量重算', riskLevel: 'high', status: 'pending', timestamp: '10:10', userId: 'u-1001', username: 'admin' },
    { id: 'ab2', type: 'cross-tenant', typeLabel: '跨租户查询', description: '未授权 catalog 字段被读取', riskLevel: 'medium', status: 'pending', timestamp: '09:35', userId: 'u-0', username: '未知用户' },
    { id: 'ab3', type: 'config-change', typeLabel: '夜间配置变更', description: 'dimension 阈值被手动下调', riskLevel: 'low', status: 'processed', timestamp: '02:18', userId: 'u-2002', username: 'ops-bot' },
  ];
}

export function getTimeline(): TimelineEvent[] {
  return [...timelineStore];
}

export function pushTimeline(title: string, detail: string, type: TimelineEvent['type']) {
  timelineStore = [
    { id: `t-${Date.now()}`, time: nowTime(), title, detail, type },
    ...timelineStore,
  ].slice(0, 12);
}

export function simulateLiveEvent(): { title: string; message: string; type: 'warning' | 'info' | 'error' } {
  const roll = Math.random();
  if (roll > 0.7) {
    const id = `INC-${1030 + Math.floor(Math.random() * 10)}`;
    incidentStore = [
      {
        id,
        title: '自动探测：延迟抖动',
        service: SERVICES[Math.floor(Math.random() * SERVICES.length)],
        severity: roll > 0.9 ? 'high' : 'medium',
        status: 'open',
        assignee: '—',
        impact: Math.floor(Math.random() * 500),
        durationMin: 5,
        updatedAt: nowTime(),
      },
      ...incidentStore,
    ];
    pushTimeline('新事件', id, 'incident');
    return { title: '新事件', message: `${id} 已进入队列`, type: 'warning' };
  }
  pushTimeline('指标刷新', '实时流更新', 'action');
  return { title: '指标刷新', message: '监控流已同步', type: 'info' };
}

export function getIncidentById(id: string): Incident | undefined {
  return incidentStore.find((r) => r.id === id);
}

export async function resolveIncident(id: string): Promise<void> {
  await delay(500);
  incidentStore = incidentStore.map((r) =>
    r.id === id ? { ...r, status: 'resolved', updatedAt: nowTime() } : r,
  );
  pushTimeline('事件关闭', id, 'action');
}

export const serviceOptions = SERVICES.map((s) => ({ label: s, value: s }));
export const severityOptions = [
  { label: '全部级别', value: '' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

export const commandSearchResults = [
  { id: 'cmd1', title: '确认全部 P1', description: '批量 ack 未处理 critical', category: 'action', icon: 'check' },
  { id: 'cmd2', title: '跳转热力图', description: '容量 Tab', category: 'page', icon: 'grid' },
  { id: 'cmd3', title: '模拟 live 事件', description: '触发系统 notify', category: 'action', icon: 'zap' },
  { id: 'cmd4', title: 'INC-1042', description: '维度重算 P99 超阈值', category: 'incident', icon: 'alert' },
];

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
