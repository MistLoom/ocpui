/**
 * 感知识别策略与兜底预案（F:PERCEPTION §2/§3/§5）
 *
 * - KIND_PRESETS：全场景通用的"信号 → 意图/通道/动效分级"兜底预案
 * - createSignal：按兜底预案产出确定性信号（组件库天然可被感知的标准入口）
 * - 策略可经 UiRoot perception.policies 覆盖/前置扩展，开发者无需改库源码
 */
import {
  SIGNAL_KINDS,
  type FeedbackChannel,
  type FocusWeight,
  type KindPreset,
  type PerceptionSignal,
  type SignalDecision,
  type SignalIntent,
  type SignalKind,
  type SignalPolicy,
  type SignalSource,
  type SignalTarget,
  type WeightTransition,
} from './signals';

/** kind → 兜底预案（与 perception §3 信号矩阵、§5 trigger 词表逐条对齐） */
export const KIND_PRESETS: Record<SignalKind, KindPreset> = {
  pointer_hover: { intent: 'afford', source: 'pointer', channel: 'action', tier: 'micro' },
  pointer_press: { intent: 'afford', source: 'pointer', channel: 'action', tier: 'micro' },
  user_select: { intent: 'activate', source: 'user', channel: 'action', tier: 'light' },
  user_submit: { intent: 'commit', source: 'user', channel: 'action', tier: 'micro' },
  overlay_open: { intent: 'reveal', source: 'user', channel: 'action', tier: 'light' },
  expand_panel: { intent: 'reveal', source: 'user', channel: 'action', tier: 'light' },
  list_update: { intent: 'mutate', source: 'system', channel: 'system', tier: 'light' },
  focus_transfer: { intent: 'navigate', source: 'keyboard', channel: 'action', tier: 'medium' },
  system_event: { intent: 'progress', source: 'system', channel: 'system', tier: 'micro' },
};

/** 意图 → 默认权重级（无权重变化时返回 null，如 commit/progress） */
const INTENT_WEIGHT: Partial<Record<SignalIntent, FocusWeight | null>> = {
  afford: 'afforded',
  activate: 'primary',
  reveal: 'elevated',
  navigate: 'primary',
  mutate: null,
  commit: null,
  progress: null,
};

/**
 * 意图→权重级查询；返回 null 表示该意图不产生持久权重变化
 * （提交/进度是数据态，权重不表达数据态：perception §6）。
 */
export function intentWeight(intent: SignalIntent): FocusWeight | null {
  return INTENT_WEIGHT[intent] ?? null;
}

let seq = 0;

/** 构造信号入参（at 自动生成，意图/通道缺省走兜底预案） */
export interface CreateSignalOptions<P = unknown> {
  kind: SignalKind;
  source?: SignalSource;
  intent?: SignalIntent;
  channel?: FeedbackChannel;
  target?: SignalTarget;
  payload?: P;
}

/** 按兜底预案产出一个确定性感知信号 */
export function createSignal<P = unknown>(options: CreateSignalOptions<P>): PerceptionSignal<P> {
  const preset = KIND_PRESETS[options.kind];
  return {
    kind: options.kind,
    source: options.source ?? preset.source,
    intent: options.intent ?? preset.intent,
    channel: options.channel ?? preset.channel,
    target: options.target,
    payload: options.payload,
    at: Date.now() + seq++,
  };
}

/**
 * 运行识别策略链：按注册顺序执行，首个 recognized 的策略可修正意图/通道；
 * 无策略命中时维持兜底预案。策略只能修正归属，不能把确定性信号改写成别的 kind。
 */
export function applyPolicies(
  signal: PerceptionSignal,
  policies: readonly SignalPolicy[],
): PerceptionSignal {
  let next = signal;
  for (const policy of policies) {
    const decision: SignalDecision = policy(next);
    if (!decision.recognized) continue;
    next = {
      ...next,
      intent: decision.intent ?? next.intent,
      channel: decision.channel ?? next.channel,
    };
  }
  return next;
}

/** 由已识别信号生成权重转移产物（控制器据此编排视觉/动效） */
export function toWeightTransition(
  signal: PerceptionSignal,
  to?: SignalTarget,
): WeightTransition | null {
  const weight = intentWeight(signal.intent);
  if (weight === null) return null;
  return {
    from: signal.target,
    to,
    weight,
    cause: signal.kind,
    tier: KIND_PRESETS[signal.kind].tier,
  };
}

/** 类型守卫：是否受控信号词表内 */
export function isSignalKind(value: string): value is SignalKind {
  return (SIGNAL_KINDS as readonly string[]).includes(value);
}
