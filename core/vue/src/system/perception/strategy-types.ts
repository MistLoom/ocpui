/**
 * 场景策略类型（F:PERCEPTION §11）
 *
 * 策略只声明识别与响应意图，不执行视觉/动效/反馈副作用。
 */
import type {
  FeedbackChannel,
  FocusWeight,
  PerceptionSignal,
  SignalIntent,
  SignalKind,
} from './signals';

/** 动效分级（含降级 none） */
export type StrategyMotionTier = 'micro' | 'light' | 'medium' | 'heavy' | 'scene' | 'none';

/** 策略硬约束标志（mustNot 并集合并） */
export type MustNotFlag =
  | 'steal_focus'
  | 'reorder_selection'
  | 'imply_success'
  | 'elevate_to_primary'
  | 'use_blur_deemph'
  | 'nested_inert_duplicate';

/** 反馈落点提示（供 feedback 订阅方，非强制 UI 形态） */
export type FeedbackHint = 'inline' | 'region' | 'overlay' | 'notify' | 'none';

/**
 * 策略求值上下文。
 * proxies 仅承载可观测计数（驻留 ms、窗内 commit 次数等），禁止情绪字段。
 */
export interface StrategyContext {
  overlayDepth: number;
  reducedMotion: boolean;
  proxies: Record<string, number>;
  scopeId?: string;
}

/** 响应声明（字段级合并；mustNot 并集；affordStrength 取 min） */
export interface PerceptionRespond {
  /** 目标权重；`null` = 明确不改权重 */
  weight?: FocusWeight | null;
  tier?: StrategyMotionTier;
  channel?: FeedbackChannel;
  intent?: SignalIntent;
  mustNot?: MustNotFlag[];
  feedbackHint?: FeedbackHint;
  /** 弱化 afforded 强度（0–1），默认 1 */
  affordStrength?: number;
}

/** 合并后的响应意图（控制器广播 'respond'） */
export interface ResponseIntent {
  signal: PerceptionSignal;
  weight?: FocusWeight | null;
  tier?: StrategyMotionTier;
  channel: FeedbackChannel;
  intent: SignalIntent;
  mustNot: MustNotFlag[];
  feedbackHint?: FeedbackHint;
  affordStrength: number;
  /** 实际参与 decide/respond 的策略 id */
  matchedIds: string[];
}

export interface StrategyDecision {
  recognized: boolean;
  intent?: SignalIntent;
  channel?: FeedbackChannel;
}

/** 具名场景策略包 */
export interface PerceptionStrategy {
  id: string;
  /** 数值越大越优先；同 priority 时后 add 在合并中靠后（后者覆盖） */
  priority?: number;
  /** 工作流叙事（内置 MUST）；不参与运行时匹配 */
  narrative: string;
  match: (signal: PerceptionSignal, ctx: StrategyContext) => boolean;
  decide?: (signal: PerceptionSignal, ctx: StrategyContext) => StrategyDecision;
  respond?:
    | PerceptionRespond
    | ((signal: PerceptionSignal, ctx: StrategyContext) => PerceptionRespond);
}

/** 可观测代理阈值（E1）；单一事实源 */
export const PROXY_THRESHOLDS = {
  /** 同 target 悬停驻留视为 dwell（ms） */
  dwellMs: 1200,
  /** 驻留窗内 hover 进出次数达到则触发 soften */
  hoverJitterCount: 3,
  /** 连点/急促提交统计窗（ms） */
  commitWindowMs: 800,
  /** 窗内 commit 次数阈值 */
  commitCount: 2,
  /** content-host 内静止达到此值后首次 hover 走 quiet（ms） */
  readQuietMs: 5000,
} as const;

export type ProxyThresholdKey = keyof typeof PROXY_THRESHOLDS;

/** 目标键：优先 carrier，其次不序列化 el 标记 */
export function signalTargetKey(signal: PerceptionSignal): string {
  if (signal.target?.carrier) return `carrier:${signal.target.carrier}`;
  if (signal.target?.el) return `el:${signalTargetElId(signal.target.el)}`;
  return 'global';
}

const elIds = new WeakMap<object, number>();
let elSeq = 0;

function signalTargetElId(el: object): number {
  let id = elIds.get(el);
  if (id === undefined) {
    id = ++elSeq;
    elIds.set(el, id);
  }
  return id;
}

export type { SignalKind };
