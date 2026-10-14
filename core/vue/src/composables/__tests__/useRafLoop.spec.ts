import { describe, it, expect, vi, afterEach } from 'vitest';
import { effectScope, nextTick } from 'vue';
import { useRafLoop } from '../useRafLoop';

async function flushFrames(frames = 2): Promise<void> {
  for (let i = 0; i < frames; i += 1) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
  await nextTick();
}

describe('useRafLoop', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('start 后按帧回调，回调内 stop 后停止', async () => {
    const scope = effectScope();
    const cb = vi.fn((_t: number, controls: { stop: () => void }) => {
      if (cb.mock.calls.length >= 3) controls.stop();
    });
    const loop = scope.run(() => useRafLoop(cb))!;
    loop.start();
    await flushFrames(5);
    expect(cb.mock.calls.length).toBe(3);
    expect(loop.isActive.value).toBe(false);
    scope.stop();
  });

  it('重复 start 幂等，不产生并行循环', async () => {
    const scope = effectScope();
    let count = 0;
    const loop = scope.run(() =>
      useRafLoop(() => {
        count += 1;
        if (count >= 2) loop.stop();
      }),
    )!;
    loop.start();
    loop.start();
    loop.start();
    await flushFrames(4);
    expect(count).toBe(2);
    scope.stop();
  });

  it('作用域销毁自动取消帧循环', async () => {
    const scope = effectScope();
    let count = 0;
    scope.run(() => {
      const loop = useRafLoop(() => {
        count += 1;
      });
      loop.start();
    });
    scope.stop();
    const after = count;
    await flushFrames(3);
    expect(count).toBe(after);
  });
});
