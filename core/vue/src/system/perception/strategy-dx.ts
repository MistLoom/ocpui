/**
 * 场景策略 DX 糖（F:PERCEPTION §11.3 / §11.5）
 */
import type { PerceptionSignal, SignalKind } from './signals';
import { BUILTIN_STRATEGIES } from './strategy-builtins';
import type {
  PerceptionRespond,
  PerceptionStrategy,
  StrategyContext,
  StrategyDecision,
} from './strategy-types';

/** 校验并原样返回，便于推理与统一入口 */
export function defineStrategy(strategy: PerceptionStrategy): PerceptionStrategy {
  if (!strategy.id) throw new Error('[ocpui/perception] defineStrategy 需要 id');
  if (!strategy.narrative) {
    throw new Error(`[ocpui/perception] defineStrategy(${strategy.id}) 需要 narrative`);
  }
  if (typeof strategy.match !== 'function') {
    throw new Error(`[ocpui/perception] defineStrategy(${strategy.id}) 需要 match`);
  }
  return strategy;
}

export interface StrategyBuilder {
  where(pred: (signal: PerceptionSignal, ctx: StrategyContext) => boolean): StrategyBuilder;
  decide(fn: (signal: PerceptionSignal, ctx: StrategyContext) => StrategyDecision): StrategyBuilder;
  respond(
    value:
      | PerceptionRespond
      | ((signal: PerceptionSignal, ctx: StrategyContext) => PerceptionRespond),
  ): StrategyBuilder;
  priority(value: number): StrategyBuilder;
  narrative(text: string): StrategyBuilder;
  id(value: string): StrategyBuilder;
  build(): PerceptionStrategy;
}

/** 链式构造：when(kind).where(...).respond(...).id(...).build() */
export function when(kind: SignalKind): StrategyBuilder {
  let id = '';
  let narrative = '';
  let priority: number | undefined;
  const predicates: Array<(s: PerceptionSignal, ctx: StrategyContext) => boolean> = [
    (s) => s.kind === kind,
  ];
  let decideFn: PerceptionStrategy['decide'];
  let respondValue: PerceptionStrategy['respond'];

  const builder: StrategyBuilder = {
    where(pred) {
      predicates.push(pred);
      return builder;
    },
    decide(fn) {
      decideFn = fn;
      return builder;
    },
    respond(value) {
      respondValue = value;
      return builder;
    },
    priority(value) {
      priority = value;
      return builder;
    },
    narrative(text) {
      narrative = text;
      return builder;
    },
    id(value) {
      id = value;
      return builder;
    },
    build() {
      return defineStrategy({
        id,
        narrative: narrative || `when(${kind})`,
        priority,
        match: (signal, ctx) => predicates.every((p) => p(signal, ctx)),
        decide: decideFn,
        respond: respondValue,
      });
    },
  };
  return builder;
}

export interface CreateStrategySetOptions {
  /** 缺省 = 全部 builtin */
  include?: string[];
  exclude?: string[];
  extras?: PerceptionStrategy[];
}

/** 组装页面/根级策略集：筛选 builtin + extras */
export function createStrategySet(options: CreateStrategySetOptions = {}): PerceptionStrategy[] {
  const exclude = new Set(options.exclude ?? []);
  let base: PerceptionStrategy[];
  if (options.include) {
    const include = new Set(options.include);
    base = BUILTIN_STRATEGIES.filter((s) => include.has(s.id) && !exclude.has(s.id)).map((s) => ({
      ...s,
    }));
    for (const id of options.include) {
      if (!BUILTIN_STRATEGIES.some((s) => s.id === id)) {
        throw new Error(`[ocpui/perception] createStrategySet include 未知 id: ${id}`);
      }
    }
  } else {
    base = BUILTIN_STRATEGIES.filter((s) => !exclude.has(s.id)).map((s) => ({ ...s }));
  }

  const byId = new Map(base.map((s) => [s.id, s]));
  for (const extra of options.extras ?? []) {
    byId.set(extra.id, defineStrategy(extra));
  }
  return Array.from(byId.values());
}
