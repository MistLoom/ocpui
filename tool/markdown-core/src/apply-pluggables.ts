import type { PluggableList } from 'unified';

type UnifiedLike = {
  use: (...args: never[]) => UnifiedLike;
};

/** 将 PluggableList 项注册到 unified processor */
export function applyPluggables(processor: UnifiedLike, list?: PluggableList): void {
  if (!list) {
    return;
  }
  for (const item of list) {
    if (Array.isArray(item)) {
      processor.use(item[0] as never, item[1] as never);
    } else {
      processor.use(item as never);
    }
  }
}
