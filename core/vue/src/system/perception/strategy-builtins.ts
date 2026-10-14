/**
 * 第一版内置场景策略包（F:PERCEPTION §11.4，15 条）
 * id 前缀 builtin:；叙事为设计说明，不参与匹配。
 */
import type { PerceptionSignal } from './signals';
import type { PerceptionStrategy } from './strategy-types';
import { PROXY_THRESHOLDS } from './strategy-types';

function phaseOf(signal: PerceptionSignal): 'open' | 'close' | undefined {
  const payload = signal.payload as { phase?: string } | undefined;
  if (payload?.phase === 'close') return 'close';
  if (payload?.phase === 'open') return 'open';
  return undefined;
}

function isNotifySurface(signal: PerceptionSignal): boolean {
  const carrier = signal.target?.carrier ?? '';
  if (carrier === 'notify' || carrier.startsWith('notify:')) return true;
  const payload = signal.payload as { surface?: string } | undefined;
  return payload?.surface === 'notify';
}

/** 全部内置策略（可被 createStrategySet 筛选） */
export const BUILTIN_STRATEGIES: readonly PerceptionStrategy[] = [
  {
    id: 'builtin:hover-afford',
    priority: 10,
    narrative: '表单/工具条上指针扫过可点控件，须立刻表明可点且不抢当前选中行',
    match: (s) => s.kind === 'pointer_hover',
    decide: () => ({ recognized: true, intent: 'afford', channel: 'action' }),
    respond: {
      weight: 'afforded',
      tier: 'micro',
      channel: 'action',
      mustNot: ['elevate_to_primary', 'steal_focus'],
    },
  },
  {
    id: 'builtin:select-primary',
    priority: 20,
    narrative: '工作列表点选一行进入主从编辑；选中为页内唯一主焦点',
    match: (s) => s.kind === 'user_select',
    decide: () => ({ recognized: true, intent: 'activate', channel: 'action' }),
    respond: {
      weight: 'primary',
      tier: 'light',
      channel: 'action',
      mustNot: ['reorder_selection'],
    },
  },
  {
    id: 'builtin:submit-guard',
    priority: 30,
    narrative: '用户点保存后网络未回；防连点且不假装成功',
    match: (s) => s.kind === 'user_submit',
    decide: () => ({ recognized: true, intent: 'commit', channel: 'action' }),
    respond: {
      weight: null,
      tier: 'micro',
      channel: 'action',
      feedbackHint: 'inline',
      mustNot: ['imply_success', 'steal_focus'],
    },
  },
  {
    id: 'builtin:overlay-elevate',
    priority: 40,
    narrative: '危险操作弹出确认；主内容退让，对话框接管',
    match: (s) => s.kind === 'overlay_open' && phaseOf(s) !== 'close',
    decide: () => ({ recognized: true, intent: 'reveal', channel: 'action' }),
    respond: {
      weight: 'elevated',
      tier: 'light',
      channel: 'action',
      feedbackHint: 'overlay',
      mustNot: ['steal_focus'],
    },
  },
  {
    id: 'builtin:overlay-restore',
    priority: 40,
    narrative: '关闭确认后回到触发控件继续编辑',
    match: (s) => s.kind === 'overlay_open' && phaseOf(s) === 'close',
    decide: () => ({ recognized: true, intent: 'reveal', channel: 'action' }),
    respond: {
      weight: 'rest',
      tier: 'light',
      channel: 'action',
      mustNot: ['steal_focus'],
    },
  },
  {
    id: 'builtin:list-mutate-quiet',
    priority: 20,
    narrative: '他人认领/后台同步改当前列表行；阅读不被打断',
    match: (s) => s.kind === 'list_update',
    decide: () => ({ recognized: true, intent: 'mutate', channel: 'system' }),
    respond: {
      weight: null,
      tier: 'light',
      channel: 'system',
      mustNot: ['steal_focus', 'reorder_selection'],
    },
  },
  {
    id: 'builtin:panel-expand',
    priority: 20,
    narrative: '详情抽屉/折叠区展开看字段，列表选中仍保留',
    match: (s) => s.kind === 'expand_panel',
    decide: () => ({ recognized: true, intent: 'reveal', channel: 'action' }),
    respond: {
      // 局部 reveal：不夺全局 W2
      weight: null,
      tier: 'light',
      channel: 'action',
      mustNot: ['elevate_to_primary', 'steal_focus'],
    },
  },
  {
    id: 'builtin:focus-transfer',
    priority: 25,
    narrative: '键盘或向导「下一步」把主焦点移到下一责任区',
    match: (s) => s.kind === 'focus_transfer',
    decide: () => ({ recognized: true, intent: 'navigate', channel: 'action' }),
    respond: {
      weight: 'primary',
      tier: 'medium',
      channel: 'action',
    },
  },
  {
    id: 'builtin:system-progress',
    priority: 15,
    narrative: '区域 loading / 任务进度；说明「在取得」而非换主焦点',
    match: (s) => s.kind === 'system_event' && !isNotifySurface(s),
    decide: () => ({ recognized: true, intent: 'progress', channel: 'system' }),
    respond: {
      weight: null,
      tier: 'micro',
      channel: 'system',
      feedbackHint: 'region',
      mustNot: ['steal_focus', 'elevate_to_primary'],
    },
  },
  {
    id: 'builtin:notify-no-steal',
    priority: 35,
    narrative: '通知中心推送新消息；用户仍在编辑',
    match: (s) =>
      (s.kind === 'system_event' || s.kind === 'list_update') && isNotifySurface(s),
    decide: () => ({ recognized: true, intent: 'afford', channel: 'system' }),
    respond: {
      weight: 'afforded',
      tier: 'micro',
      channel: 'system',
      feedbackHint: 'notify',
      mustNot: ['steal_focus', 'elevate_to_primary'],
    },
  },
  {
    id: 'builtin:stack-conflict',
    priority: 50,
    narrative: '已有 Drawer 又开 Modal；叠层清晰、背景只降一次、Esc 按栈',
    match: (s, ctx) =>
      s.kind === 'overlay_open' && phaseOf(s) !== 'close' && ctx.overlayDepth >= 2,
    decide: () => ({ recognized: true }),
    respond: {
      weight: 'elevated',
      tier: 'light',
      mustNot: ['nested_inert_duplicate', 'steal_focus'],
    },
  },
  {
    id: 'builtin:reduced-motion',
    priority: 100,
    narrative: '系统或站点开启减动效；语义权重仍在，动效退让',
    match: (_s, ctx) => ctx.reducedMotion,
    decide: () => ({ recognized: true }),
    respond: {
      mustNot: ['use_blur_deemph'],
      tier: 'micro',
    },
  },
  {
    id: 'builtin:dwell-soften',
    priority: 45,
    narrative: '同 target 长驻留/反复进出 hover（可观测代理）；降低压迫感',
    match: (s, ctx) => {
      if (s.kind !== 'pointer_hover' && s.kind !== 'pointer_press') return false;
      const dwell = ctx.proxies.dwellMs ?? 0;
      const jitter = ctx.proxies.hoverJitter ?? 0;
      return dwell >= PROXY_THRESHOLDS.dwellMs || jitter >= PROXY_THRESHOLDS.hoverJitterCount;
    },
    decide: () => ({ recognized: true, intent: 'afford', channel: 'action' }),
    respond: (s) => ({
      weight: 'afforded' as const,
      tier: 'micro' as const,
      affordStrength: s.kind === 'pointer_press' ? 0.5 : 0.65,
      mustNot: ['elevate_to_primary' as const],
    }),
  },
  {
    id: 'builtin:rapid-commit-throttle',
    priority: 55,
    narrative: '短窗多次 submit/click（可观测代理）；强化防误提交与抑闪',
    match: (s, ctx) =>
      s.kind === 'user_submit' &&
      (ctx.proxies.commitCount ?? 0) >= PROXY_THRESHOLDS.commitCount,
    decide: () => ({ recognized: true, intent: 'commit', channel: 'action' }),
    respond: {
      weight: null,
      tier: 'none',
      channel: 'action',
      feedbackHint: 'inline',
      mustNot: ['imply_success', 'steal_focus', 'elevate_to_primary'],
    },
  },
  {
    id: 'builtin:read-region-quiet',
    priority: 48,
    narrative: 'content-host 内长静止后的首次 pointer_hover（可观测代理）；避免大面积 W1 闪',
    match: (s, ctx) => {
      if (s.kind !== 'pointer_hover') return false;
      const carrier = s.target?.carrier ?? '';
      const inContent =
        carrier === 'content-host' || carrier.startsWith('content-host:');
      if (!inContent) return false;
      return (ctx.proxies.readQuietMs ?? 0) >= PROXY_THRESHOLDS.readQuietMs;
    },
    decide: () => ({ recognized: true, intent: 'afford', channel: 'action' }),
    respond: {
      weight: 'afforded',
      tier: 'none',
      affordStrength: 0.35,
      mustNot: ['elevate_to_primary', 'steal_focus'],
    },
  },
];

export const BUILTIN_STRATEGY_IDS: readonly string[] = BUILTIN_STRATEGIES.map((s) => s.id);

export function getBuiltinStrategy(id: string): PerceptionStrategy | undefined {
  return BUILTIN_STRATEGIES.find((s) => s.id === id);
}

/** 供测试/文档：断言无情绪词进入 id */
const FORBIDDEN_AFFECT_TOKENS = ['hesitat', 'urgenc', 'emotion', 'mood', '犹豫', '急切', '情绪'];

export function assertBuiltinIdsHaveNoAffectTokens(
  strategies: readonly PerceptionStrategy[] = BUILTIN_STRATEGIES,
): void {
  for (const s of strategies) {
    const lower = s.id.toLowerCase();
    for (const token of FORBIDDEN_AFFECT_TOKENS) {
      if (lower.includes(token)) {
        throw new Error(`[ocpui/perception] 内置策略 id 禁止情绪词: ${s.id}`);
      }
    }
  }
}
