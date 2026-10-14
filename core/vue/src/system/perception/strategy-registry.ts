/**
 * 场景策略注册表（F:PERCEPTION §11.3）
 * 具名 add / remove / clear；同 id 替换。
 */
import type { PerceptionStrategy } from './strategy-types';

export interface StrategyRegistry {
  add(strategy: PerceptionStrategy): void;
  remove(id: string): boolean;
  clear(): void;
  get(id: string): PerceptionStrategy | undefined;
  list(): readonly PerceptionStrategy[];
  /** 注册序（用于同 priority 合并：后注册靠后） */
  registrationIndex(id: string): number;
}

interface Entry {
  strategy: PerceptionStrategy;
  index: number;
}

export function createStrategyRegistry(
  initial: readonly PerceptionStrategy[] = [],
): StrategyRegistry {
  const map = new Map<string, Entry>();
  let seq = 0;

  function add(strategy: PerceptionStrategy): void {
    if (!strategy.id) {
      throw new Error('[ocpui/perception] PerceptionStrategy.id 不能为空');
    }
    const prev = map.get(strategy.id);
    map.set(strategy.id, {
      strategy,
      // 同 id 替换时刷新注册序，使「后 add 覆盖」可预期
      index: prev ? ++seq : ++seq,
    });
  }

  for (const s of initial) add(s);

  return {
    add,
    remove(id: string): boolean {
      return map.delete(id);
    },
    clear(): void {
      map.clear();
    },
    get(id: string): PerceptionStrategy | undefined {
      return map.get(id)?.strategy;
    },
    list(): readonly PerceptionStrategy[] {
      return Array.from(map.values())
        .sort((a, b) => a.index - b.index)
        .map((e) => e.strategy);
    },
    registrationIndex(id: string): number {
      return map.get(id)?.index ?? -1;
    },
  };
}
