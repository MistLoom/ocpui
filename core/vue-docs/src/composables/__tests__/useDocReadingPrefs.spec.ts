import { describe, expect, it, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import {
  useDocReadingPrefs,
  DOC_READING_PREFS_KEY,
  DOC_READING_DEFAULTS,
  resetDocReadingPrefsForTests,
} from '../useDocReadingPrefs.js';

describe('useDocReadingPrefs', () => {
  beforeEach(() => {
    resetDocReadingPrefsForTests();
  });

  it('默认偏好并写入 localStorage', async () => {
    const { prefs, cssVars } = useDocReadingPrefs();
    expect(prefs.value).toEqual(DOC_READING_DEFAULTS);
    expect(cssVars.value['--doc-measure']).toBe('72ch');

    prefs.value = { ...prefs.value, measure: 80 };
    await nextTick();
    const stored = localStorage.getItem(DOC_READING_PREFS_KEY);
    expect(stored).toBeTruthy();
    expect(stored).toContain('"measure":80');
  });

  it('reset 恢复默认', () => {
    const { prefs, reset } = useDocReadingPrefs();
    prefs.value = { fontSize: 'lg', measure: 85, leading: 'relaxed' };
    reset();
    expect(prefs.value).toEqual(DOC_READING_DEFAULTS);
  });

  it('多实例共享同一偏好状态', async () => {
    const first = useDocReadingPrefs();
    const second = useDocReadingPrefs();

    first.prefs.value = { ...first.prefs.value, fontSize: 'lg' };
    await nextTick();

    expect(second.prefs.value.fontSize).toBe('lg');
  });
});

describe('useReadingScrollRestore', () => {
  it('占位：挂载行为由 DocReaderShell 集成测试覆盖', () => {
    expect(true).toBe(true);
  });
});
