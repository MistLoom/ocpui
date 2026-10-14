import { describe, it, expect } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { useTweenedValue } from '../useTweenedValue';

async function flushFrames(frames = 30): Promise<void> {
  for (let i = 0; i < frames; i += 1) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
  await nextTick();
}

describe('useTweenedValue', () => {
  it('initial 决定初始显示值，挂载不自动播放', () => {
    const scope = effectScope();
    const { value } = scope.run(() =>
      useTweenedValue(ref(100), { initial: 0, reducedMotion: ref(false) }),
    )!;
    expect(value.value).toBe(0);
    scope.stop();
  });

  it('reduced motion 下 source 变化直接跳到目标值', async () => {
    const scope = effectScope();
    const source = ref(0);
    const { value } = scope.run(() =>
      useTweenedValue(source, { duration: 1000, reducedMotion: ref(true) }),
    )!;
    source.value = 100;
    await nextTick();
    expect(value.value).toBe(100);
    scope.stop();
  });

  it('duration 为 0 时首帧即收敛到目标值', async () => {
    const scope = effectScope();
    const source = ref(0);
    const { value } = scope.run(() =>
      useTweenedValue(source, { duration: 0, reducedMotion: ref(false) }),
    )!;
    source.value = 50;
    await flushFrames(2);
    expect(value.value).toBe(50);
    scope.stop();
  });

  it('snapTo 立即落到目标值且不播放', async () => {
    const scope = effectScope();
    const source = ref(10);
    const tween = scope.run(() =>
      useTweenedValue(source, { duration: 1000, reducedMotion: ref(false) }),
    )!;
    tween.snapTo(77);
    expect(tween.value.value).toBe(77);
    expect(tween.isAnimating.value).toBe(false);
    scope.stop();
  });
});
