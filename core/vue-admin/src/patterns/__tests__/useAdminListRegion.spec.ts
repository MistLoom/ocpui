import { describe, it, expect } from 'vitest';
import { useAdminListRegion } from '../useAdminListRegion';

describe('useAdminListRegion', () => {
  it('场景：拉取成功 → workListProps.regionState 为 ready', async () => {
    const region = useAdminListRegion({
      fetch: async () => [{ id: 1 }],
    });
    await region.refresh();
    expect(region.workListProps.value.regionState).toBe('ready');
  });

  it('场景：拉取失败 → workListProps.regionState 为 error', async () => {
    const region = useAdminListRegion({
      fetch: async () => {
        throw new Error('fail');
      },
    });
    await region.refresh();
    expect(region.workListProps.value.regionState).toBe('error');
  });

  it('场景：传递 errorText → 绑定 AdminWorkList', async () => {
    const region = useAdminListRegion({
      fetch: async () => [],
      errorText: '加载失败',
    });
    await region.refresh();
    expect(region.workListProps.value.errorText).toBe('加载失败');
    expect(region.workListProps.value.regionState).toBe('empty');
  });
});
