import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BUILTIN_STRATEGIES,
  BUILTIN_STRATEGY_IDS,
  assertBuiltinIdsHaveNoAffectTokens,
  createStrategySet,
  defineStrategy,
  when,
  createStrategyRegistry,
  applyStrategies,
  PROXY_THRESHOLDS,
  createPerceptionController,
  createSignal,
  type ResponseIntent,
} from '../perception';

describe('内置场景策略包', () => {
  it('恰好 15 条且 id 唯一、无情绪词', () => {
    expect(BUILTIN_STRATEGIES).toHaveLength(15);
    expect(new Set(BUILTIN_STRATEGY_IDS).size).toBe(15);
    expect(() => assertBuiltinIdsHaveNoAffectTokens()).not.toThrow();
    for (const s of BUILTIN_STRATEGIES) {
      expect(s.id.startsWith('builtin:')).toBe(true);
      expect(s.narrative.length).toBeGreaterThan(8);
      expect(typeof s.match).toBe('function');
    }
  });
});

describe('StrategyRegistry', () => {
  it('add / remove / clear / 同 id 替换', () => {
    const reg = createStrategyRegistry();
    const a = defineStrategy({
      id: 'app:a',
      narrative: '测试 A',
      match: () => true,
      respond: { weight: 'afforded' },
    });
    reg.add(a);
    expect(reg.list()).toHaveLength(1);
    reg.add({
      ...a,
      respond: { weight: 'primary' },
    });
    expect(reg.list()).toHaveLength(1);
    expect((reg.get('app:a')!.respond as { weight: string }).weight).toBe('primary');
    expect(reg.remove('app:a')).toBe(true);
    expect(reg.list()).toHaveLength(0);
    reg.add(a);
    reg.clear();
    expect(reg.list()).toHaveLength(0);
  });
});

describe('createStrategySet / defineStrategy / when', () => {
  it('exclude 与 extras 组装', () => {
    const set = createStrategySet({
      exclude: ['builtin:notify-no-steal'],
      extras: [
        defineStrategy({
          id: 'app:batch',
          narrative: '批量选中工具条',
          match: (s) => s.kind === 'user_select',
          respond: { weight: 'primary', tier: 'light' },
        }),
      ],
    });
    expect(set.some((s) => s.id === 'builtin:notify-no-steal')).toBe(false);
    expect(set.some((s) => s.id === 'app:batch')).toBe(true);
    expect(set.length).toBe(15); // 14 builtin + 1 extra
  });

  it('when 链式构建', () => {
    const s = when('user_select')
      .where((sig) => sig.target?.carrier === 'row')
      .respond({ weight: 'primary', tier: 'light' })
      .id('app:row-select')
      .narrative('行选中')
      .priority(30)
      .build();
    expect(s.id).toBe('app:row-select');
    expect(
      s.match(createSignal({ kind: 'user_select', target: { carrier: 'row' } }), {
        overlayDepth: 0,
        reducedMotion: false,
        proxies: {},
      }),
    ).toBe(true);
    expect(
      s.match(createSignal({ kind: 'user_select' }), {
        overlayDepth: 0,
        reducedMotion: false,
        proxies: {},
      }),
    ).toBe(false);
  });
});

describe('applyStrategies 合并', () => {
  it('mustNot 并集、affordStrength 取 min、后者覆盖 weight', () => {
    const reg = createStrategyRegistry([
      defineStrategy({
        id: 'low',
        priority: 1,
        narrative: '低',
        match: () => true,
        decide: () => ({ recognized: true }),
        respond: { weight: 'afforded', affordStrength: 0.8, mustNot: ['steal_focus'] },
      }),
      defineStrategy({
        id: 'high',
        priority: 10,
        narrative: '高',
        match: () => true,
        decide: () => ({ recognized: true }),
        respond: { weight: 'primary', affordStrength: 0.5, mustNot: ['imply_success'] },
      }),
    ]);
    const { respond } = applyStrategies(
      createSignal({ kind: 'pointer_hover' }),
      reg.list(),
      { overlayDepth: 0, reducedMotion: false, proxies: {} },
      (id) => reg.registrationIndex(id),
    );
    expect(respond?.weight).toBe('primary');
    expect(respond?.affordStrength).toBe(0.5);
    expect(respond?.mustNot.sort()).toEqual(['imply_success', 'steal_focus']);
    expect(respond?.matchedIds).toEqual(['high', 'low']);
  });

  it('reducedMotion 降级 tier 并加入 use_blur_deemph', () => {
    const reg = createStrategyRegistry([
      defineStrategy({
        id: 'x',
        narrative: 'x',
        match: () => true,
        decide: () => ({ recognized: true }),
        respond: { tier: 'medium', weight: 'primary' },
      }),
    ]);
    const { respond } = applyStrategies(
      createSignal({ kind: 'user_select' }),
      reg.list(),
      { overlayDepth: 0, reducedMotion: true, proxies: {} },
      (id) => reg.registrationIndex(id),
    );
    expect(respond?.tier).toBe('micro');
    expect(respond?.mustNot).toContain('use_blur_deemph');
  });
});

describe('控制器：场景策略 + respond 广播', () => {
  it('默认装载 15 builtin；select 广播 respond 与 weight', () => {
    const c = createPerceptionController();
    expect(c.strategies.list()).toHaveLength(15);
    const responds: ResponseIntent[] = [];
    const weights: unknown[] = [];
    c.on('respond', (r) => responds.push(r));
    c.on('weight', (w) => weights.push(w));
    c.signal({ kind: 'user_select' });
    expect(responds[0]?.matchedIds).toContain('builtin:select-primary');
    expect(responds[0]?.weight).toBe('primary');
    expect(weights).toHaveLength(1);
  });

  it('submit-guard：weight null 不广播 weight', () => {
    const c = createPerceptionController();
    const weights = vi.fn();
    c.on('weight', weights);
    c.signal({ kind: 'user_submit' });
    expect(weights).not.toHaveBeenCalled();
  });

  it('remove / clear 可剔除默认策略', () => {
    const c = createPerceptionController();
    expect(c.strategies.remove('builtin:hover-afford')).toBe(true);
    expect(c.strategies.get('builtin:hover-afford')).toBeUndefined();
    c.strategies.clear();
    expect(c.strategies.list()).toHaveLength(0);
    const responds: ResponseIntent[] = [];
    c.on('respond', (r) => responds.push(r));
    c.signal({ kind: 'pointer_hover' });
    expect(responds).toHaveLength(0);
  });

  it('includeBuiltins:false 可空启动', () => {
    const c = createPerceptionController(undefined, { includeBuiltins: false });
    expect(c.strategies.list()).toHaveLength(0);
  });

  it('overlay 开/关命中 elevate / restore', () => {
    const c = createPerceptionController();
    const ids: string[][] = [];
    c.on('respond', (r) => ids.push(r.matchedIds));
    const layer = c.openOverlay();
    expect(ids.some((m) => m.includes('builtin:overlay-elevate'))).toBe(true);
    layer.close();
    expect(ids.some((m) => m.includes('builtin:overlay-restore'))).toBe(true);
  });

  it('stack-conflict：第二层 overlay', () => {
    const c = createPerceptionController();
    const matched: string[] = [];
    c.on('respond', (r) => matched.push(...r.matchedIds));
    const a = c.openOverlay();
    const b = c.openOverlay();
    expect(matched).toContain('builtin:stack-conflict');
    b.close();
    a.close();
  });

  it('runWithRegistry 临时切换策略集', () => {
    const c = createPerceptionController(undefined, { includeBuiltins: false });
    const scoped = createStrategyRegistry([
      defineStrategy({
        id: 'scope:only',
        narrative: '区域专用',
        match: (s) => s.kind === 'user_select',
        decide: () => ({ recognized: true }),
        respond: { weight: 'primary' },
      }),
    ]);
    const responds: string[][] = [];
    c.on('respond', (r) => responds.push(r.matchedIds));
    c.signal({ kind: 'user_select' });
    expect(responds).toHaveLength(0);
    c.runWithRegistry(scoped, () => {
      c.signal({ kind: 'user_select' });
    });
    expect(responds[0]).toEqual(['scope:only']);
  });

  it('rapid-commit-throttle：窗内多次 submit', () => {
    const c = createPerceptionController();
    const responds: ResponseIntent[] = [];
    c.on('respond', (r) => responds.push(r));
    c.signal({ kind: 'user_submit', target: { carrier: 'save' } });
    c.signal({ kind: 'user_submit', target: { carrier: 'save' } });
    expect(responds.at(-1)?.matchedIds).toContain('builtin:rapid-commit-throttle');
    expect(responds.at(-1)?.tier).toBe('none');
  });

  it('dwell-soften：驻留超过阈值', () => {
    const c = createPerceptionController();
    const target = { carrier: 'btn' };
    const t0 = 1_700_000_000_000;
    c.signal({
      kind: 'pointer_hover',
      source: 'pointer',
      intent: 'afford',
      channel: 'action',
      target,
      at: t0,
    });
    const responds: ResponseIntent[] = [];
    c.on('respond', (r) => responds.push(r));
    c.signal({
      kind: 'pointer_hover',
      source: 'pointer',
      intent: 'afford',
      channel: 'action',
      target,
      at: t0 + PROXY_THRESHOLDS.dwellMs + 10,
    });
    expect(responds.some((r) => r.matchedIds.includes('builtin:dwell-soften'))).toBe(true);
  });

  it('notify-no-steal：notify 表面', () => {
    const c = createPerceptionController();
    const responds: ResponseIntent[] = [];
    c.on('respond', (r) => responds.push(r));
    c.signal({
      kind: 'system_event',
      target: { carrier: 'notify' },
    });
    expect(responds[0]?.matchedIds).toContain('builtin:notify-no-steal');
    expect(responds[0]?.feedbackHint).toBe('notify');
  });

  it('setReducedMotion 命中 reduced-motion 包', () => {
    let reduced = false;
    const c = createPerceptionController(undefined, {
      reducedMotion: () => reduced,
    });
    reduced = true;
    const responds: ResponseIntent[] = [];
    c.on('respond', (r) => responds.push(r));
    c.signal({ kind: 'user_select' });
    expect(responds[0]?.matchedIds).toContain('builtin:reduced-motion');
    expect(responds[0]?.mustNot).toContain('use_blur_deemph');
  });
});

describe('代理阈值常数', () => {
  beforeEach(() => {
    expect(PROXY_THRESHOLDS.dwellMs).toBeGreaterThan(0);
    expect(PROXY_THRESHOLDS.commitCount).toBeGreaterThan(1);
  });

  it('阈值表完整', () => {
    expect(PROXY_THRESHOLDS).toMatchObject({
      dwellMs: expect.any(Number),
      hoverJitterCount: expect.any(Number),
      commitWindowMs: expect.any(Number),
      commitCount: expect.any(Number),
      readQuietMs: expect.any(Number),
    });
  });
});
