/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminWorkListFlagsFromState } from '../../../types/ui-data-state';

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../AdminWorkList.vue'),
  'utf8',
);

describe('AdminWorkList', () => {
  it('实现：支持 regionState 统一 10 态入口', () => {
    expect(src).toContain('regionState?: UiDataState');
    expect(src).toContain('adminWorkListFlagsFromState');
  });

  it('实现：无权限独立分支', () => {
    expect(src).toContain('admin-work-list__forbidden');
    expect(src).toContain('forbidden-action');
  });

  it('场景：regionState=loading → 骨架分支', () => {
    expect(adminWorkListFlagsFromState('loading').loading).toBe(true);
    expect(src).toContain('resolved.loading');
  });

  it('场景：regionState=empty → Empty 分支', () => {
    expect(adminWorkListFlagsFromState('empty').isEmpty).toBe(true);
    expect(src).toContain('resolved.isEmpty');
  });

  it('场景：regionState=forbidden → 无权限分支', () => {
    expect(adminWorkListFlagsFromState('forbidden').isForbidden).toBe(true);
    expect(src).toContain('resolved.isForbidden');
  });

  it('场景：regionState=ready → 列表 slot', () => {
    expect(adminWorkListFlagsFromState('ready').loading).toBe(false);
    expect(adminWorkListFlagsFromState('ready').isEmpty).toBe(false);
    expect(src).toContain('class="admin-work-list"');
  });
});
