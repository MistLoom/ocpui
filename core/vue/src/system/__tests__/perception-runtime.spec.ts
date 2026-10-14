import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  KIND_PRESETS,
  createSignal,
  applyPolicies,
  intentWeight,
  toWeightTransition,
  isSignalKind,
  type SignalPolicy,
} from '../perception/policy';
import { SIGNAL_KINDS } from '../perception/signals';
import { createPerceptionController } from '../perception/controller';

describe('信号类型与兜底预案', () => {
  it('每个受控 kind 都有意图/来源/通道/tier 预案', () => {
    for (const kind of SIGNAL_KINDS) {
      const preset = KIND_PRESETS[kind];
      expect(preset).toBeDefined();
      expect(['pointer', 'keyboard', 'user', 'system']).toContain(preset.source);
      expect(['action', 'system']).toContain(preset.channel);
    }
  });

  it('createSignal 缺省走兜底预案，显式字段可覆盖', () => {
    const s = createSignal({ kind: 'list_update' });
    expect(s.intent).toBe('mutate');
    expect(s.source).toBe('system');
    expect(s.channel).toBe('system');

    const overridden = createSignal({ kind: 'list_update', channel: 'action' });
    expect(overridden.channel).toBe('action');
  });

  it('isSignalKind 类型守卫', () => {
    expect(isSignalKind('overlay_open')).toBe(true);
    expect(isSignalKind('nope')).toBe(false);
  });
});

describe('识别策略链', () => {
  it('未命中策略维持兜底预案', () => {
    const skip: SignalPolicy = () => ({ recognized: false });
    const out = applyPolicies(createSignal({ kind: 'user_select' }), [skip]);
    expect(out.intent).toBe('activate');
  });

  it('命中策略可修正意图与通道，且不能改写 kind', () => {
    const promote: SignalPolicy = (sig) =>
      sig.kind === 'list_update'
        ? { recognized: true, channel: 'action' }
        : { recognized: false };
    const out = applyPolicies(createSignal({ kind: 'list_update' }), [promote]);
    expect(out.channel).toBe('action');
    expect(out.kind).toBe('list_update');
    expect(out.intent).toBe('mutate');
  });
});

describe('信号 → 权重转移产物', () => {
  it('选中产生 primary 权重；提交/进度不产生持久权重（权重不表达数据态）', () => {
    expect(intentWeight('activate')).toBe('primary');
    expect(intentWeight('commit')).toBeNull();
    expect(intentWeight('progress')).toBeNull();

    const select = toWeightTransition(createSignal({ kind: 'user_select' }));
    expect(select?.weight).toBe('primary');

    const submit = toWeightTransition(createSignal({ kind: 'user_submit' }));
    expect(submit).toBeNull();
  });
});

describe('中央控制器：信号调度', () => {
  it('signal 经策略识别后广播 signal；有权重变化时再广播 weight', () => {
    const controller = createPerceptionController();
    const signals: unknown[] = [];
    const weights: unknown[] = [];
    controller.on('signal', (s) => signals.push(s));
    controller.on('weight', (w) => weights.push(w));

    const recognized = controller.signal({ kind: 'user_select' });
    expect(recognized.intent).toBe('activate');
    expect(signals).toHaveLength(1);
    expect(weights).toHaveLength(1);

    // commit 无权重变化，不广播 weight
    controller.signal({ kind: 'user_submit' });
    expect(signals).toHaveLength(2);
    expect(weights).toHaveLength(1);
  });

  it('usePolicy 前置接入可按场景改写识别结果，并可注销', () => {
    const controller = createPerceptionController();
    const policy: SignalPolicy = (sig) =>
      sig.kind === 'system_event' ? { recognized: true, intent: 'afford' } : { recognized: false };
    const off = controller.usePolicy(policy);

    const r1 = controller.signal({ kind: 'system_event' });
    expect(r1.intent).toBe('afford');

    off();
    const r2 = controller.signal({ kind: 'system_event' });
    expect(r2.intent).toBe('progress');
  });

  it('on 返回取消订阅函数', () => {
    const controller = createPerceptionController();
    const fn = vi.fn();
    const off = controller.on('signal', fn);
    controller.signal({ kind: 'pointer_hover' });
    off();
    controller.signal({ kind: 'pointer_hover' });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('中央控制器：overlay 栈与 W4 隔离', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('打开设置滚动锁/降焦属性并隔离背景宿主，关闭后还原', () => {
    const host = document.createElement('div');
    host.setAttribute('data-ui-dispatch-role', 'focus-host');
    document.body.appendChild(host);
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    const controller = createPerceptionController();
    expect(controller.overlayDepth()).toBe(0);

    const layer = controller.openOverlay();
    expect(controller.overlayDepth()).toBe(1);
    expect(document.documentElement.hasAttribute('data-ui-overlay-active')).toBe(true);
    expect(host.hasAttribute('inert')).toBe(true);
    expect(host.getAttribute('aria-hidden')).toBe('true');

    layer.close();
    expect(controller.overlayDepth()).toBe(0);
    expect(document.documentElement.hasAttribute('data-ui-overlay-active')).toBe(false);
    expect(host.hasAttribute('inert')).toBe(false);
    expect(host.hasAttribute('aria-hidden')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('多层叠加仅隔离一次，全部关闭才解除', () => {
    const host = document.createElement('div');
    host.setAttribute('data-ui-dispatch-role', 'content-host');
    document.body.appendChild(host);

    const controller = createPerceptionController();
    const a = controller.openOverlay();
    const b = controller.openOverlay();
    expect(host.getAttribute('aria-hidden')).toBe('true');

    a.close();
    expect(controller.overlayDepth()).toBe(1);
    expect(host.getAttribute('aria-hidden')).toBe('true');

    b.close();
    expect(host.hasAttribute('inert')).toBe(false);
  });

  it('blur 任一栈层声明即开启全局 blur 属性', () => {
    const controller = createPerceptionController();
    const a = controller.openOverlay();
    expect(document.documentElement.hasAttribute('data-ui-overlay-blur')).toBe(false);
    const b = controller.openOverlay({ blur: true });
    expect(document.documentElement.hasAttribute('data-ui-overlay-blur')).toBe(true);
    b.close();
    expect(document.documentElement.hasAttribute('data-ui-overlay-blur')).toBe(false);
    a.close();
  });

  it('isolate:false 跳过背景隔离（就地非 Teleport 浮层）', () => {
    const host = document.createElement('div');
    host.setAttribute('data-ui-dispatch-role', 'focus-host');
    document.body.appendChild(host);

    const controller = createPerceptionController();
    const layer = controller.openOverlay({ isolate: false });
    expect(host.hasAttribute('inert')).toBe(false);
    layer.close();
  });

  it('overlay 事件广播开/闭与栈深', () => {
    const controller = createPerceptionController();
    const events: number[] = [];
    controller.on('overlay', (e) => events.push(e.depth));
    const layer = controller.openOverlay();
    layer.close();
    expect(events).toEqual([1, 0]);
  });

  it('非模态浮层不锁页/不 inert，计入 floatingDepth 但不计 overlayDepth', () => {
    const host = document.createElement('div');
    host.setAttribute('data-ui-dispatch-role', 'focus-host');
    document.body.appendChild(host);

    const controller = createPerceptionController();
    const layer = controller.openOverlay({ modal: false });
    expect(controller.overlayDepth()).toBe(0);
    expect(controller.floatingDepth()).toBe(1);
    expect(document.documentElement.hasAttribute('data-ui-overlay-active')).toBe(false);
    expect(host.hasAttribute('inert')).toBe(false);

    layer.close();
    expect(controller.floatingDepth()).toBe(0);
  });

  it('非模态浮层与模态层共存时，模态层仍隔离背景，关闭非模态不解除隔离', () => {
    const host = document.createElement('div');
    host.setAttribute('data-ui-dispatch-role', 'focus-host');
    document.body.appendChild(host);

    const controller = createPerceptionController();
    const modalLayer = controller.openOverlay();
    const floatLayer = controller.openOverlay({ modal: false });
    expect(host.hasAttribute('inert')).toBe(true);
    expect(controller.overlayDepth()).toBe(1);
    expect(controller.floatingDepth()).toBe(2);

    floatLayer.close();
    expect(host.hasAttribute('inert')).toBe(true);
    modalLayer.close();
    expect(host.hasAttribute('inert')).toBe(false);
  });

  it('Esc 按栈顶派发：仅最顶层且启用 Esc 的层收到关闭请求', () => {
    const controller = createPerceptionController();
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();
    controller.openOverlay({ onRequestClose: onCloseA });
    controller.openOverlay({ onRequestClose: onCloseB });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onCloseB).toHaveBeenCalledTimes(1);
    expect(onCloseA).not.toHaveBeenCalled();
  });

  it('closeOnEscape:false 的层被跳过时，Esc 落到下一层', () => {
    const controller = createPerceptionController();
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();
    controller.openOverlay({ onRequestClose: onCloseA });
    controller.openOverlay({ onRequestClose: onCloseB, closeOnEscape: false });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onCloseB).not.toHaveBeenCalled();
    expect(onCloseA).toHaveBeenCalledTimes(1);
  });

  it('trap 激活态：嵌套模态仅最顶层激活，关闭后回到下层，非模态不改变激活态', () => {
    const controller = createPerceptionController();
    const activeA: boolean[] = [];
    const activeB: boolean[] = [];

    const a = controller.openOverlay({ onActiveChange: (v) => activeA.push(v) });
    expect(activeA).toEqual([true]);

    const b = controller.openOverlay({ onActiveChange: (v) => activeB.push(v) });
    expect(activeA).toEqual([true, false]);
    expect(activeB).toEqual([true]);

    // 非模态浮层入栈/出栈不改变模态 trap 激活态
    const float = controller.openOverlay({ modal: false });
    expect(activeB).toEqual([true]);
    float.close();
    expect(activeB).toEqual([true]);

    b.close();
    expect(activeB).toEqual([true, false]);
    expect(activeA).toEqual([true, false, true]);

    a.close();
    expect(activeA).toEqual([true, false, true, false]);
  });
});
