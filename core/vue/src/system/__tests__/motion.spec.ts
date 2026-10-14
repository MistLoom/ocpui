import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUiMotion } from '../motion';

describe('useUiMotion', () => {
  const matchMediaMock = vi.fn();

  beforeEach(() => {
    matchMediaMock.mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('场景：标准动效 → 返回 transition 与时长', () => {
    const { resolve } = useUiMotion();
    const preset = resolve('explain_spatial_origin', 'heavy');
    expect(preset.reduced).toBe(false);
    expect(preset.tier).toBe('heavy');
    expect(preset.transition).toContain('var(--transition-modal)');
    expect(preset.durationMs).toBe(600);
  });

  it('场景：prefers-reduced-motion → 降级为 none', () => {
    matchMediaMock.mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const { resolve } = useUiMotion();
    const preset = resolve('explain_focus', 'micro');
    expect(preset.reduced).toBe(true);
    expect(preset.transition).toBe('none');
    expect(preset.durationMs).toBe(0);
  });
});
