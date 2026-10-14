import { onScopeDispose, ref, type Ref } from 'vue';

export interface RafLoopControls {
  /** 终止帧循环 */
  stop: () => void;
}

export interface UseRafLoopReturn {
  /** 启动帧循环；重复调用幂等（不会产生多个并行循环） */
  start: () => void;
  /** 终止帧循环 */
  stop: () => void;
  isActive: Readonly<Ref<boolean>>;
}

const hasRaf = () =>
  typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function';

/**
 * 统一 requestAnimationFrame 帧循环。
 *
 * - 作用域销毁时自动 cancel，杜绝卸载后继续回调；
 * - SSR（无 rAF）下 start 为 no-op，回调不会在服务器执行；
 * - 回调内可经第二参 controls.stop() 自行终止。
 */
export function useRafLoop(
  callback: (time: number, controls: RafLoopControls) => void,
): UseRafLoopReturn {
  const isActive = ref(false);
  let handle: number | null = null;

  function stop(): void {
    if (handle !== null && hasRaf()) cancelAnimationFrame(handle);
    handle = null;
    isActive.value = false;
  }

  function start(): void {
    // 已在循环中或 SSR 环境：不重复调度
    if (handle !== null || !hasRaf()) return;
    isActive.value = true;
    const controls: RafLoopControls = { stop };
    const frame = (time: number) => {
      // stop() 可能在回调内被调用
      if (handle === null) return;
      callback(time, controls);
      if (handle !== null) handle = requestAnimationFrame(frame);
    };
    handle = requestAnimationFrame(frame);
  }

  onScopeDispose(stop);

  return { start, stop, isActive };
}
