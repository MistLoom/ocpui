import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { effectScope, ref } from 'vue';
import {
  FOCUS_WEIGHTS,
  MOTION_TRIGGERS,
  useRepeatGuard,
  useChangeFlash,
} from '../perception';

describe('FOCUS_WEIGHTS / MOTION_TRIGGERS 常量', () => {
  it('焦点权重为 W0–W4 五级', () => {
    expect(Object.values(FOCUS_WEIGHTS)).toEqual([
      'rest',
      'afforded',
      'primary',
      'elevated',
      'deemphasized',
    ]);
  });

  it('motion trigger 词表与 schema enum 一致（9 项）', () => {
    expect(MOTION_TRIGGERS).toEqual([
      'pointer_hover',
      'pointer_press',
      'user_select',
      'user_submit',
      'overlay_open',
      'expand_panel',
      'list_update',
      'focus_transfer',
      'system_event',
    ]);
  });
});

describe('useRepeatGuard（复合-连点）', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('窗口内重复触发被忽略，窗口结束后恢复', () => {
    const scope = effectScope();
    const fn = vi.fn();
    let guarded!: (...args: unknown[]) => void;
    let pending!: { value: boolean };

    scope.run(() => {
      const api = useRepeatGuard({ windowMs: 800 });
      pending = api.pending;
      guarded = api.guard(fn);
    });

    guarded();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(pending.value).toBe(true);

    guarded();
    guarded();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(799);
    expect(pending.value).toBe(true);
    vi.advanceTimersByTime(2);
    expect(pending.value).toBe(false);

    guarded();
    expect(fn).toHaveBeenCalledTimes(2);

    scope.stop();
  });

  it('外部 locked 期间同样忽略触发', () => {
    const scope = effectScope();
    const fn = vi.fn();
    const locked = ref(false);
    let guarded!: (...args: unknown[]) => void;
    let pending!: { value: boolean };

    scope.run(() => {
      const api = useRepeatGuard({ windowMs: 800, locked });
      pending = api.pending;
      guarded = api.guard(fn);
    });

    locked.value = true;
    guarded();
    expect(fn).not.toHaveBeenCalled();
    expect(pending.value).toBe(true);

    locked.value = false;
    expect(pending.value).toBe(false);
    guarded();
    expect(fn).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  it('release 提前释放锁定', () => {
    const scope = effectScope();
    let pending!: { value: boolean };
    let release!: () => void;

    scope.run(() => {
      const api = useRepeatGuard({ windowMs: 800 });
      pending = api.pending;
      release = api.release;
      api.guard(() => {})();
    });

    expect(pending.value).toBe(true);
    release();
    expect(pending.value).toBe(false);

    scope.stop();
  });
});

describe('useChangeFlash（数据变化 W1 单次提示）', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('flash 后 ~600ms 内自动回落', () => {
    const scope = effectScope();
    let flashing!: { value: boolean };
    let flash!: () => void;

    scope.run(() => {
      const api = useChangeFlash();
      flashing = api.flashing;
      flash = api.flash;
    });

    expect(flashing.value).toBe(false);
    flash();
    expect(flashing.value).toBe(true);

    vi.advanceTimersByTime(599);
    expect(flashing.value).toBe(true);
    vi.advanceTimersByTime(2);
    expect(flashing.value).toBe(false);

    scope.stop();
  });

  it('连续 flash 重新计时，不叠加', () => {
    const scope = effectScope();
    let flashing!: { value: boolean };
    let flash!: () => void;

    scope.run(() => {
      const api = useChangeFlash();
      flashing = api.flashing;
      flash = api.flash;
    });

    flash();
    vi.advanceTimersByTime(400);
    flash();
    vi.advanceTimersByTime(400);
    expect(flashing.value).toBe(true);
    vi.advanceTimersByTime(201);
    expect(flashing.value).toBe(false);

    scope.stop();
  });
});
