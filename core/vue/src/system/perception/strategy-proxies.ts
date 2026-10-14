/**
 * 可观测代理计数（E1）：驻留 / 抖动 / 连点 / 阅读区静止。
 * 禁止情绪字段；仅由信号流更新。
 */
import type { PerceptionSignal } from './signals';
import { PROXY_THRESHOLDS, signalTargetKey } from './strategy-types';

export interface ProxyTracker {
  /** 在匹配前根据当前信号更新，并返回本帧 proxies 快照 */
  observe(signal: PerceptionSignal): Record<string, number>;
  reset(): void;
}

interface TargetHoverState {
  firstAt: number;
  lastAt: number;
  jitter: number;
  inside: boolean;
}

interface CommitState {
  windowStart: number;
  count: number;
}

export function createProxyTracker(): ProxyTracker {
  const hover = new Map<string, TargetHoverState>();
  const commits = new Map<string, CommitState>();
  let lastActivityAt = Date.now();
  let lastContentQuietAt = Date.now();
  let inContentHost = false;

  function isContentHost(signal: PerceptionSignal): boolean {
    const carrier = signal.target?.carrier ?? '';
    return carrier === 'content-host' || carrier.startsWith('content-host:');
  }

  function observe(signal: PerceptionSignal): Record<string, number> {
    const now = signal.at || Date.now();
    const key = signalTargetKey(signal);
    const proxies: Record<string, number> = {};

    // 阅读区静止：非 hover 的交互重置；content-host 内无操作累计
    if (signal.kind !== 'pointer_hover') {
      lastActivityAt = now;
      if (isContentHost(signal)) {
        inContentHost = true;
        lastContentQuietAt = now;
      } else if (signal.source === 'pointer' || signal.source === 'keyboard' || signal.source === 'user') {
        inContentHost = false;
      }
    } else if (isContentHost(signal)) {
      inContentHost = true;
    }

    if (signal.kind === 'pointer_hover') {
      let state = hover.get(key);
      if (!state) {
        state = { firstAt: now, lastAt: now, jitter: 1, inside: true };
        hover.set(key, state);
      } else {
        // 同 target 持续 hover：保留 firstAt 累计驻留；短间隔再入计抖动
        if (now - state.lastAt < 120) {
          state.jitter += 1;
        }
        state.lastAt = now;
        state.inside = true;
      }
      proxies.dwellMs = now - state.firstAt;
      proxies.hoverJitter = state.jitter;
      proxies.readQuietMs = inContentHost ? now - lastContentQuietAt : 0;
    }

    if (signal.kind === 'user_submit') {
      let c = commits.get(key);
      if (!c || now - c.windowStart > PROXY_THRESHOLDS.commitWindowMs) {
        c = { windowStart: now, count: 1 };
        commits.set(key, c);
      } else {
        c.count += 1;
      }
      proxies.commitCount = c.count;
      proxies.commitWindowMs = now - c.windowStart;
    } else {
      const c = commits.get(key);
      if (c && now - c.windowStart <= PROXY_THRESHOLDS.commitWindowMs) {
        proxies.commitCount = c.count;
        proxies.commitWindowMs = now - c.windowStart;
      }
    }

    proxies.lastActivityAgeMs = now - lastActivityAt;
    return proxies;
  }

  return {
    observe,
    reset() {
      hover.clear();
      commits.clear();
      lastActivityAt = Date.now();
      lastContentQuietAt = Date.now();
      inContentHost = false;
    },
  };
}
