import { describe, expect, it } from 'vitest';
import { resolveLocalePath } from '../index.js';
import zhCN from '../zh-CN.js';

describe('resolveLocalePath', () => {
  it('解析 components. 前缀键', () => {
    expect(
      resolveLocalePath(zhCN, 'components.feedback.errorStateBlock.defaultTitle'),
    ).toBe('加载失败');
  });

  it('解析无前缀键', () => {
    expect(resolveLocalePath(zhCN, 'common.retry')).toBe('重试');
  });
});
