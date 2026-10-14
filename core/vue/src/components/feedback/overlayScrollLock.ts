/**
 * 背景滚动锁与 overlay 降焦属性，两个正交关注点，各自引用计数：
 * - 滚动锁：任何需要冻结背景滚动的层（模态、全屏系统 loading）都可持有；
 * - data-ui-overlay-active：仅真正的模态隔离层持有，驱动 W4 背景降焦 CSS。
 *
 * 全屏 loading 只持滚动锁、不持降焦属性——loading 是数据态，不改变焦点权重
 * （state-system §3：数据态与焦点权重正交）。
 */

let scrollLockDepth = 0;
let previousOverflow = '';

let overlayActiveDepth = 0;

const OVERLAY_ACTIVE_ATTR = 'data-ui-overlay-active';

function syncOverlayActiveAttribute(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (overlayActiveDepth > 0) {
    root.setAttribute(OVERLAY_ACTIVE_ATTR, '');
  } else {
    root.removeAttribute(OVERLAY_ACTIVE_ATTR);
  }
}

export function lockBodyScroll(): void {
  // SSR 守卫：服务器端无真实滚动锁，且模块单例计数会跨请求污染，整体 no-op；
  // 客户端 hydration 时 setup 的 immediate watch 会重新入栈。
  if (typeof document === 'undefined') return;
  scrollLockDepth += 1;
  if (scrollLockDepth === 1) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  scrollLockDepth = Math.max(0, scrollLockDepth - 1);
  if (scrollLockDepth === 0) {
    document.body.style.overflow = previousOverflow;
  }
}

/** 持有一次 W4 模态降焦属性（仅隔离型模态层调用，loading 不调用） */
export function acquireOverlayActive(): void {
  if (typeof document === 'undefined') return;
  overlayActiveDepth += 1;
  syncOverlayActiveAttribute();
}

export function releaseOverlayActive(): void {
  if (typeof document === 'undefined') return;
  overlayActiveDepth = Math.max(0, overlayActiveDepth - 1);
  syncOverlayActiveAttribute();
}

/** 测试/调试：当前背景滚动锁深度 */
export function getOverlayLockDepth(): number {
  return scrollLockDepth;
}

/** 测试/调试：当前模态降焦属性持有深度 */
export function getOverlayActiveDepth(): number {
  return overlayActiveDepth;
}
