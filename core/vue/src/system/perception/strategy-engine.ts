/**
 * 场景策略求值与响应合并（F:PERCEPTION §11.2）
 */
import type { PerceptionSignal } from './signals';
import type {
  MustNotFlag,
  PerceptionRespond,
  PerceptionStrategy,
  ResponseIntent,
  StrategyContext,
  StrategyMotionTier,
} from './strategy-types';

export interface ApplyStrategiesResult {
  signal: PerceptionSignal;
  respond: ResponseIntent | null;
}

function resolveRespond(
  respond: PerceptionStrategy['respond'],
  signal: PerceptionSignal,
  ctx: StrategyContext,
): PerceptionRespond | undefined {
  if (!respond) return undefined;
  return typeof respond === 'function' ? respond(signal, ctx) : respond;
}

function degradeTier(
  tier: StrategyMotionTier | undefined,
  reducedMotion: boolean,
): StrategyMotionTier | undefined {
  if (tier === undefined) return undefined;
  if (!reducedMotion) return tier;
  if (tier === 'none' || tier === 'micro') return tier;
  return 'micro';
}

/**
 * 收集 match 策略 → decide 叠改 → respond 合并 → ResponseIntent。
 * 处理序（后者覆盖）：priority 升序（高 priority 靠后赢得覆盖）；同级注册序升序（后 add 靠后）。
 * matchedIds 按 priority 降序列出，便于阅读。
 */
export function applyStrategies(
  signal: PerceptionSignal,
  strategies: readonly PerceptionStrategy[],
  ctx: StrategyContext,
  registrationIndex: (id: string) => number,
): ApplyStrategiesResult {
  const matched = strategies
    .filter((s) => s.match(signal, ctx))
    .sort((a, b) => {
      const pa = a.priority ?? 0;
      const pb = b.priority ?? 0;
      if (pa !== pb) return pa - pb;
      return registrationIndex(a.id) - registrationIndex(b.id);
    });

  let next = signal;
  const applied: PerceptionStrategy[] = [];
  const respondParts: PerceptionRespond[] = [];

  for (const strategy of matched) {
    if (strategy.decide) {
      const decision = strategy.decide(next, ctx);
      if (!decision.recognized) continue;
      next = {
        ...next,
        intent: decision.intent ?? next.intent,
        channel: decision.channel ?? next.channel,
      };
    }
    applied.push(strategy);
    const part = resolveRespond(strategy.respond, next, ctx);
    if (part) respondParts.push(part);
  }

  if (applied.length === 0 && respondParts.length === 0) {
    return { signal: next, respond: null };
  }

  const merged: PerceptionRespond = {};
  const mustNot = new Set<MustNotFlag>();
  let affordStrength: number | undefined;

  for (const part of respondParts) {
    if (part.weight !== undefined) merged.weight = part.weight;
    if (part.tier !== undefined) merged.tier = part.tier;
    if (part.channel !== undefined) merged.channel = part.channel;
    if (part.intent !== undefined) merged.intent = part.intent;
    if (part.feedbackHint !== undefined) merged.feedbackHint = part.feedbackHint;
    if (part.mustNot) part.mustNot.forEach((f) => mustNot.add(f));
    if (part.affordStrength !== undefined) {
      affordStrength =
        affordStrength === undefined
          ? part.affordStrength
          : Math.min(affordStrength, part.affordStrength);
    }
  }

  // reduced-motion：降级优先（§7 / builtin:reduced-motion）
  const reduced =
    ctx.reducedMotion || applied.some((s) => s.id === 'builtin:reduced-motion');
  if (reduced) {
    merged.tier = degradeTier(merged.tier ?? 'light', true);
    mustNot.add('use_blur_deemph');
  }

  if (merged.intent) next = { ...next, intent: merged.intent };
  if (merged.channel) next = { ...next, channel: merged.channel };

  const respond: ResponseIntent = {
    signal: next,
    weight: merged.weight,
    tier: merged.tier,
    channel: next.channel,
    intent: next.intent,
    mustNot: Array.from(mustNot),
    feedbackHint: merged.feedbackHint,
    affordStrength: affordStrength ?? 1,
    matchedIds: [...applied]
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .map((s) => s.id),
  };

  return { signal: next, respond };
}
