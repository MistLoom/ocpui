import { describe, it, expect } from 'vitest';
import {
  adminWorkListFlagsFromState,
  isUiDataState,
  UI_DATA_STATES,
} from '../ui-data-state';

describe('ui-data-state', () => {
  it('10 态枚举完整', () => {
    expect(UI_DATA_STATES).toHaveLength(10);
    expect(isUiDataState('success_followup')).toBe(true);
    expect(isUiDataState('pending')).toBe(false);
  });

  it('场景：等待不等于空', () => {
    const loading = adminWorkListFlagsFromState('loading');
    const empty = adminWorkListFlagsFromState('empty');
    expect(loading.loading).toBe(true);
    expect(loading.isEmpty).toBe(false);
    expect(empty.isEmpty).toBe(true);
    expect(empty.loading).toBe(false);
  });

  it('场景：无权限独立分支', () => {
    const forbidden = adminWorkListFlagsFromState('forbidden');
    expect(forbidden.isForbidden).toBe(true);
    expect(forbidden.isEmpty).toBe(false);
    expect(forbidden.isError).toBe(false);
  });

  it('场景：部分失败走 error 分支', () => {
    const partial = adminWorkListFlagsFromState('partial_error');
    expect(partial.isError).toBe(true);
  });

  it('场景：提交中锁定 loading', () => {
    const submitting = adminWorkListFlagsFromState('submitting');
    expect(submitting.loading).toBe(true);
  });
});
