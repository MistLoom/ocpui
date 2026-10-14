/** 演示用 mock 数据与延迟 */

export interface AuditRow {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  owner: string;
  updatedAt: string;
}

export interface MetricSnapshot {
  key: string;
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  trendValue: string;
  chartData: number[];
  alarm?: boolean;
}

export interface HealthGauge {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
}

export interface AlertRecord {
  id: string;
  title: string;
  message: string;
  time: string;
  level: 'info' | 'warning' | 'error';
}

const delay = (ms = 480) => new Promise((r) => setTimeout(r, ms));

let auditStore: AuditRow[] = [
  { id: '1', name: '纪元链结构校验', status: 'pending', owner: '系统', updatedAt: '09-07 10:12' },
  { id: '2', name: '维度重算批次 #42', status: 'approved', owner: 'ops-bot', updatedAt: '09-07 09:40' },
  { id: '3', name: 'Catalog 注册表同步', status: 'pending', owner: 'admin', updatedAt: '09-07 08:55' },
  { id: '4', name: 'Outbox 积压告警', status: 'rejected', owner: '系统', updatedAt: '09-06 22:10' },
  { id: '5', name: '通知流 SSE 探活', status: 'approved', owner: 'ops-bot', updatedAt: '09-06 18:30' },
];

export async function fetchAuditList(): Promise<AuditRow[]> {
  await delay();
  return [...auditStore];
}

export async function batchApprove(ids: string[]): Promise<void> {
  await delay(320);
  auditStore = auditStore.map((row) =>
    ids.includes(row.id) ? { ...row, status: 'approved' as const } : row,
  );
}

export async function fetchMetricSnapshot(): Promise<MetricSnapshot[]> {
  await delay();
  return [
    {
      key: 'throughput',
      title: '内容吞吐',
      value: 1284,
      unit: '条/日',
      trend: 'up',
      trendValue: '+12%',
      chartData: [820, 910, 880, 1020, 1150, 1284],
    },
    {
      key: 'latency',
      title: '平均延迟',
      value: 186,
      unit: 'ms',
      trend: 'down',
      trendValue: '-8%',
      chartData: [240, 220, 210, 198, 190, 186],
      alarm: false,
    },
    {
      key: 'errorRate',
      title: '错误率',
      value: 2.4,
      unit: '%',
      trend: 'up',
      trendValue: '+0.3%',
      chartData: [1.8, 1.9, 2.0, 2.1, 2.3, 2.4],
      alarm: true,
    },
    {
      key: 'activeUsers',
      title: '活跃编辑者',
      value: 37,
      unit: '人',
      trend: 'flat',
      trendValue: '0%',
      chartData: [35, 36, 37, 36, 37, 37],
    },
  ];
}

export async function fetchHealthGauges(): Promise<HealthGauge[]> {
  await delay(300);
  return [
    { label: 'CPU', value: 62, min: 0, max: 100, unit: '%' },
    { label: '内存', value: 71, min: 0, max: 100, unit: '%' },
    { label: '队列深度', value: 4.2, min: 0, max: 10, unit: 'k' },
  ];
}

export async function fetchAlerts(): Promise<AlertRecord[]> {
  await delay(280);
  return [
    {
      id: 'a1',
      title: '维度计算失败',
      message: '3 条 entry 在 outline 维度超时',
      time: '10:05',
      level: 'error',
    },
    {
      id: 'a2',
      title: 'Outbox 积压',
      message: '待投递事件超过阈值 500',
      time: '09:48',
      level: 'warning',
    },
    {
      id: 'a3',
      title: 'Registry 同步完成',
      message: '204 组件元数据已刷新',
      time: '09:12',
      level: 'info',
    },
  ];
}

export const searchCategories = [
  { key: 'page', label: '页面', count: 3 },
  { key: 'action', label: '操作', count: 2 },
];

export const searchResults = [
  { id: 's1', title: '列表场景', description: 'useAdminListRegion + AdminWorkList', category: 'page', icon: 'list' },
  { id: 's2', title: '仪表场景', description: 'MetricCard + GaugeChart 组合', category: 'page', icon: 'chart' },
  { id: 's3', title: '批量审批', description: 'SelectionToolbar 批量操作', category: 'action', icon: 'check' },
  { id: 's4', title: '刷新数据', description: '系统通道 loading', category: 'action', icon: 'refresh' },
  { id: 's5', title: '独立模式组件库', description: '无 UiRoot 局部渲染', category: 'page', icon: 'box' },
];
