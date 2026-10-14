import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  lockBodyScroll,
  unlockBodyScroll,
  getOverlayLockDepth,
  acquireOverlayActive,
  releaseOverlayActive,
  getOverlayActiveDepth,
} from '../overlayScrollLock';

describe('overlayScrollLock', () => {
  beforeEach(() => {
    while (getOverlayLockDepth() > 0) unlockBodyScroll();
    while (getOverlayActiveDepth() > 0) releaseOverlayActive();
    document.documentElement.removeAttribute('data-ui-overlay-active');
    document.body.style.overflow = '';
  });

  afterEach(() => {
    while (getOverlayLockDepth() > 0) unlockBodyScroll();
    while (getOverlayActiveDepth() > 0) releaseOverlayActive();
    document.documentElement.removeAttribute('data-ui-overlay-active');
    document.body.style.overflow = '';
  });

  describe('背景滚动锁', () => {
    it('首层锁定 body overflow，不触碰 W4 降焦属性', () => {
      lockBodyScroll();
      expect(document.body.style.overflow).toBe('hidden');
      expect(getOverlayLockDepth()).toBe(1);
      // 锁滚与 W4 降焦正交：仅锁滚不设置 data-ui-overlay-active
      expect(document.documentElement.hasAttribute('data-ui-overlay-active')).toBe(false);
    });

    it('多层引用计数，全部解锁才还原', () => {
      lockBodyScroll();
      lockBodyScroll();
      expect(getOverlayLockDepth()).toBe(2);

      unlockBodyScroll();
      expect(getOverlayLockDepth()).toBe(1);
      expect(document.body.style.overflow).toBe('hidden');

      unlockBodyScroll();
      expect(getOverlayLockDepth()).toBe(0);
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('W4 模态降焦属性', () => {
    it('acquire 设置 data-ui-overlay-active，release 引用计数', () => {
      acquireOverlayActive();
      expect(document.documentElement.hasAttribute('data-ui-overlay-active')).toBe(true);
      expect(getOverlayActiveDepth()).toBe(1);

      acquireOverlayActive();
      releaseOverlayActive();
      expect(getOverlayActiveDepth()).toBe(1);
      expect(document.documentElement.hasAttribute('data-ui-overlay-active')).toBe(true);

      releaseOverlayActive();
      expect(getOverlayActiveDepth()).toBe(0);
      expect(document.documentElement.hasAttribute('data-ui-overlay-active')).toBe(false);
    });

    it('降焦属性与滚动锁互不影响（全屏 loading 只锁滚不降焦）', () => {
      lockBodyScroll();
      expect(getOverlayLockDepth()).toBe(1);
      expect(getOverlayActiveDepth()).toBe(0);
      expect(document.documentElement.hasAttribute('data-ui-overlay-active')).toBe(false);

      unlockBodyScroll();
      expect(getOverlayLockDepth()).toBe(0);
    });
  });
});
