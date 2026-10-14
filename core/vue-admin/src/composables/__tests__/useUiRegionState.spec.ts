import { describe, it, expect, vi } from 'vitest';
import { useUiRegionState } from '../useUiRegionState';

describe('useUiRegionState', () => {
  it('场景：拉取成功有数据 → ready', async () => {
    const { state, data, refresh } = useUiRegionState({
      fetch: async () => [{ id: 1 }],
    });
    await refresh();
    expect(state.value).toBe('ready');
    expect(data.value).toEqual([{ id: 1 }]);
  });

  it('场景：拉取成功无数据 → empty', async () => {
    const { state, refresh } = useUiRegionState({
      fetch: async () => [],
    });
    await refresh();
    expect(state.value).toBe('empty');
  });

  it('场景：拉取失败 → error', async () => {
    const { state, refresh } = useUiRegionState({
      fetch: async () => {
        throw new Error('network');
      },
    });
    await refresh();
    expect(state.value).toBe('error');
  });

  it('场景：用户提交 → submitting → success', async () => {
    const { state, runSubmit } = useUiRegionState({
      fetch: async () => ['a'],
    });
    const task = vi.fn(async () => 'ok');
    const p = runSubmit(task);
    expect(state.value).toBe('submitting');
    await expect(p).resolves.toBe('ok');
    expect(state.value).toBe('success');
    expect(task).toHaveBeenCalledOnce();
  });
});
