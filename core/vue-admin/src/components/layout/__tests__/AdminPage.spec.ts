/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const adminPageSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../AdminPage.vue'),
  'utf8',
);

describe('AdminPage', () => {
  it('smoke: 页壳分区与默认 preset', () => {
    expect(adminPageSrc).toContain("'admin-page'");
    expect(adminPageSrc).toContain('admin-page__header');
    expect(adminPageSrc).toContain('admin-page__body');
    expect(adminPageSrc).toContain('UiScenarioScope');
    expect(adminPageSrc).toContain("surface: 'list'");
    expect(adminPageSrc).toContain("scene: 'workbench'");
  });
});
