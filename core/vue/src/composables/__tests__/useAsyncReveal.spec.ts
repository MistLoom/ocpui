import { describe, expect, it } from 'vitest';
import { resolveAsyncShellPending } from '../useAsyncReveal';

describe('resolveAsyncShellPending', () => {
  it('interactive SSR：无数据 pending', () => {
    expect(
      resolveAsyncShellPending({
        mode: 'public',
        browse: 'interactive',
        isClient: false,
        asyncPending: false,
        clientBrowseReady: true,
        data: null,
        error: null,
      }),
    ).toBe(true);
  });

  it('interactive SSR：有数据不 pending（SEO）', () => {
    expect(
      resolveAsyncShellPending({
        mode: 'public',
        browse: 'interactive',
        isClient: false,
        asyncPending: false,
        clientBrowseReady: true,
        data: { ok: true },
        error: null,
      }),
    ).toBe(false);
  });

  it('interactive 客户端：未 ready 时 pending', () => {
    expect(
      resolveAsyncShellPending({
        mode: 'public',
        browse: 'interactive',
        isClient: true,
        asyncPending: false,
        clientBrowseReady: false,
        data: { ok: true },
        error: null,
      }),
    ).toBe(true);
  });

  it('有 error 时不 pending', () => {
    expect(
      resolveAsyncShellPending({
        mode: 'public',
        browse: 'interactive',
        isClient: true,
        asyncPending: false,
        clientBrowseReady: false,
        data: null,
        error: new Error('x'),
      }),
    ).toBe(false);
  });
});
