/**
 * 感知中央控制器与事件调度协议（F:PERCEPTION / F:CONTAINER-CHAIN 运行时）
 *
 * 单一调度收口：
 * - 信号：dispatch → 代理计数 → 场景策略 → 识别策略链 → 广播 signal / respond / weight
 * - overlay 栈：引用计数统一维护滚动锁 / W4 降焦 / blur / 背景 inert / 焦点恢复
 *
 * 交互、动效、视觉系统只订阅控制器事件，不直接互相调用。
 */
import { type Ref } from 'vue';
import { lockBodyScroll, unlockBodyScroll, acquireOverlayActive, releaseOverlayActive } from '../../components/feedback/overlayScrollLock';
import {
  applyPolicies,
  createSignal,
  toWeightTransition,
  type CreateSignalOptions,
} from './policy';
import type {
  FocusWeight,
  PerceptionSignal,
  SignalPolicy,
  WeightTransition,
} from './signals';
import { applyStrategies } from './strategy-engine';
import { createStrategyRegistry, type StrategyRegistry } from './strategy-registry';
import { createProxyTracker } from './strategy-proxies';
import { BUILTIN_STRATEGIES } from './strategy-builtins';
import type {
  PerceptionStrategy,
  ResponseIntent,
  StrategyMotionTier,
} from './strategy-types';

/** 调度事件协议 */
export type PerceptionEventType = 'signal' | 'weight' | 'overlay' | 'respond';

/** overlay 栈变化事件 */
export interface OverlayStackEvent {
  /** 变化后栈深 */
  depth: number;
  phase: 'open' | 'close';
  blur: boolean;
  /** 是否模态层（非模态浮层仅登记参与 Esc 按栈，不加锁/降焦） */
  modal: boolean;
}

export interface PerceptionEventMap {
  signal: PerceptionSignal;
  weight: WeightTransition;
  overlay: OverlayStackEvent;
  respond: ResponseIntent;
}

type Handler<E extends PerceptionEventType> = (payload: PerceptionEventMap[E]) => void;

export interface OpenOverlayOptions {
  /** 背景是否启用 blur 深降焦（W4 可选手段，仅 deemphasis 层生效） */
  blur?: boolean;
  /**
   * 是否模态层，默认 true。
   * 非模态浮层（下拉/Popover/Tooltip/菜单 modal:false）：仅登记入栈参与 Esc 按栈与层叠，
   * 不锁页、不降焦、不 inert、不接管焦点。
   * 模态层的锁滚 / W4 降焦 / inert 可再经下列开关独立关闭。
   */
  modal?: boolean;
  /** 是否锁定背景滚动，默认取 modal（模态 true / 非模态 false） */
  lockScroll?: boolean;
  /**
   * 是否施加 W4 背景降焦（data-ui-overlay-active + overlay_open 权重信号），默认取 modal。
   * 就地抽屉等与背景同树、不做视觉降焦的模态层置 false。
   */
  deemphasis?: boolean;
  /**
   * 是否对背景宿主做 inert/aria-hidden 隔离，默认取 modal。
   * 非 Teleport 的就地浮层（如布局内移动端抽屉）置 false，避免误隔离同树内容。
   */
  isolate?: boolean;
  /** Esc 请求关闭回调；提供后由控制器按栈顶统一派发（仅栈顶层接收） */
  onRequestClose?: () => void;
  /** 该层是否响应 Esc，默认 true */
  closeOnEscape?: boolean;
  /**
   * 栈顶激活态变化（仅模态焦点 trap 使用）：
   * 该层成为最顶层模态层时 active=true，被更高模态层覆盖时 false。
   * 保证同一时刻只有最顶层模态接管 Tab；非模态浮层（经 Teleport 脱离模态容器、
   * 自带键盘管理）不改变该状态。
   */
  onActiveChange?: (active: boolean) => void;
}

export interface OverlayLayer {
  readonly id: number;
  /** 离场动画结束后调用：出栈、释放滚动锁/W4 降焦，栈空解除 inert 并恢复焦点 */
  close: () => void;
}

const BG_HOST_SELECTOR = [
  "[data-ui-dispatch-role='focus-host']",
  "[data-ui-dispatch-role='content-host']",
  "[data-ui-dispatch-role='chrome-host']",
].join(',');

interface InertRecord {
  el: HTMLElement;
  hadInert: boolean;
  hadAriaHidden: string | null;
}

export interface CreatePerceptionControllerOptions {
  /** 初始场景策略；默认与 includeBuiltins 合并 */
  strategies?: readonly PerceptionStrategy[];
  /** 默认 true：装载全部 builtin */
  includeBuiltins?: boolean;
  /** 减动效开关；缺省读 documentElement data-ui-reduced-motion */
  reducedMotion?: () => boolean;
  scopeId?: string;
}

export interface PerceptionController {
  /** 识别并广播信号；返回经策略链识别后的产物 */
  signal: <P = unknown>(input: SignalInput<P>) => PerceptionSignal<P>;
  /** 订阅调度事件，返回取消订阅函数 */
  on: <E extends PerceptionEventType>(event: E, handler: Handler<E>) => () => void;
  /** 前置一个识别策略（后注册先执行），返回注销函数 */
  usePolicy: (policy: SignalPolicy) => () => void;
  /** 场景策略注册表（§11） */
  readonly strategies: StrategyRegistry;
  /**
   * 在临时注册表上执行 fn（区域 Scope 用）；共享 overlay 栈与事件总线。
   * 嵌套调用按栈恢复。
   */
  runWithRegistry: <T>(registry: StrategyRegistry, fn: () => T) => T;
  /** 更新减动效解析（UiRoot 绑定） */
  setReducedMotion: (fn: () => boolean) => void;
  /** 更新当前 scopeId（区域 Scope 用） */
  setScopeId: (id: string | undefined) => void;
  /** overlay 入栈：模态层滚动锁 + W4 降焦 + 背景 inert；非模态层仅登记 Esc/层叠 */
  openOverlay: (options?: OpenOverlayOptions) => OverlayLayer;
  /**
   * 纯背景滚动锁（不进 overlay 栈、不改栈深、不降焦、不 inert）。
   * 供全屏系统 loading 等数据态使用；返回释放函数，引用计数由底层统一维护。
   */
  lockScroll: () => () => void;
  /** 当前模态层数（滚动锁/W4/inert/叠层冲突策略据此判断，不含非模态浮层） */
  readonly overlayDepth: () => number;
  /** 当前登记总层数（模态 + 非模态），供层叠顺序/Esc 参考 */
  readonly floatingDepth: () => number;
}

/** signal 入参：与 createSignal 一致 */
export type SignalInput<P = unknown> = CreateSignalOptions<P> | PerceptionSignal<P>;

function isRawSignal<P>(v: SignalInput<P>): v is PerceptionSignal<P> {
  return typeof v === 'object' && v !== null && 'at' in v && 'intent' in v;
}

function defaultReducedMotion(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-ui-reduced-motion') === 'true';
}

function seedStrategies(options: CreatePerceptionControllerOptions): PerceptionStrategy[] {
  const includeBuiltins = options.includeBuiltins !== false;
  const extras = options.strategies ?? [];
  if (!includeBuiltins) return [...extras];
  const byId = new Map<string, PerceptionStrategy>();
  for (const s of BUILTIN_STRATEGIES) byId.set(s.id, s);
  for (const s of extras) byId.set(s.id, s);
  return Array.from(byId.values());
}

function weightFromRespond(
  signal: PerceptionSignal,
  respond: ResponseIntent,
): WeightTransition | null {
  if (respond.weight === null) return null;
  if (respond.weight === undefined) return toWeightTransition(signal);
  const tier = (respond.tier ?? toWeightTransition(signal)?.tier ?? 'micro') as WeightTransition['tier'];
  return {
    from: signal.target,
    to: signal.target,
    weight: respond.weight as FocusWeight,
    cause: signal.kind,
    tier: tier === 'none' ? 'micro' : (tier as WeightTransition['tier']),
  };
}

/**
 * 创建中央控制器。root 为 UiRoot 根元素时，overlay 打开可对背景宿主做 inert
 * 无障碍隔离；无 root（脱离 UiRoot 的兜底场景）跳过 inert，仅保留滚动锁/降焦。
 */
export function createPerceptionController(
  root?: Ref<HTMLElement | undefined>,
  options: CreatePerceptionControllerOptions = {},
): PerceptionController {
  const policies: SignalPolicy[] = [];
  const handlers: { [E in PerceptionEventType]?: Set<Handler<E>> } = {};
  const rootStrategies = createStrategyRegistry(seedStrategies(options));
  /** 当前生效注册表（Scope 可临时切换） */
  let activeStrategies: StrategyRegistry = rootStrategies;
  const registryStack: StrategyRegistry[] = [];
  const proxies = createProxyTracker();
  let reducedMotionFn: () => boolean = options.reducedMotion ?? defaultReducedMotion;
  let scopeId = options.scopeId;

  /* ---------------- overlay 栈（模态 + 非模态统一登记） ---------------- */
  interface StackEntry {
    id: number;
    modal: boolean;
    lockScroll: boolean;
    deemphasis: boolean;
    blur: boolean;
    isolate: boolean;
    closeOnEscape: boolean;
    onRequestClose: (() => void) | null;
    onActiveChange: ((active: boolean) => void) | null;
    trigger: HTMLElement | null;
  }
  const stack: StackEntry[] = [];
  let seq = 0;
  let inertRecords: InertRecord[] = [];
  let escBound = false;
  /** 当前接管 Tab 焦点循环的模态层 id（最顶层模态） */
  let activeTrapId: number | null = null;

  /** 模态层数（overlayDepth 语义；不含非模态浮层） */
  function modalCount(): number {
    return stack.reduce((n, e) => n + (e.modal ? 1 : 0), 0);
  }

  /** 最顶层模态层（非模态浮层不参与） */
  function topModalEntry(): StackEntry | undefined {
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      if (stack[i].modal) return stack[i];
    }
    return undefined;
  }

  /**
   * 栈变化后同步最顶层模态的 trap 激活态。
   * @param removed 本次出栈的条目（已不在 stack 中，需显式传入以停用其 trap）
   */
  function syncActiveTrap(removed?: StackEntry): void {
    const prevId = activeTrapId;
    const nextId = topModalEntry()?.id ?? null;
    if (prevId === nextId) return;
    const prev =
      removed && removed.id === prevId ? removed : stack.find((e) => e.id === prevId);
    const next = nextId !== null ? stack.find((e) => e.id === nextId) : undefined;
    activeTrapId = nextId;
    if (prev?.onActiveChange) prev.onActiveChange(false);
    if (next?.onActiveChange) next.onActiveChange(true);
  }

  /** Esc 按栈顶派发：仅最顶层且启用 Esc 的层接收，避免多层同时关闭 */
  function handleStackKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      const entry = stack[i];
      if (!entry.closeOnEscape) continue;
      if (entry.onRequestClose) {
        event.preventDefault();
        event.stopPropagation();
        entry.onRequestClose();
      }
      return;
    }
  }

  function bindStackEsc(): void {
    if (escBound || typeof document === 'undefined') return;
    document.addEventListener('keydown', handleStackKeydown, true);
    escBound = true;
  }
  function unbindStackEsc(): void {
    if (!escBound || typeof document === 'undefined') return;
    document.removeEventListener('keydown', handleStackKeydown, true);
    escBound = false;
  }

  function emit<E extends PerceptionEventType>(event: E, payload: PerceptionEventMap[E]): void {
    handlers[event]?.forEach((h) => h(payload));
  }

  function currentBlur(): boolean {
    return stack.some((e) => e.blur);
  }

  function syncBlurAttribute(): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (currentBlur()) html.setAttribute('data-ui-overlay-blur', '');
    else html.removeAttribute('data-ui-overlay-blur');
  }

  function rootScope(): ParentNode | undefined {
    const el = root?.value;
    return el ?? (typeof document === 'undefined' ? undefined : document);
  }

  /** 运行环境是否支持 inert（旧浏览器降级为仅 aria-hidden + 焦点 trap 圈定） */
  const supportsInert =
    typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype;

  /** W4 非视觉通道：背景宿主 inert + aria-hidden（perception §4.1 约束 3） */
  function isolateBackground(): void {
    // 幂等：首个 overlay 已隔离时不重复采集（多层叠加）
    if (inertRecords.length > 0) return;
    const scope = rootScope();
    if (!scope || typeof document === 'undefined') return;
    const hosts = Array.from(scope.querySelectorAll<HTMLElement>(BG_HOST_SELECTOR));
    inertRecords = hosts
      // overlay 经 Teleport 挂到 body，不属背景宿主；防御性排除 overlay-host 内部
      .filter((el) => !el.closest("[data-ui-dispatch-role='overlay-host']"))
      .map((el) => {
        const record: InertRecord = {
          el,
          hadInert: el.hasAttribute('inert'),
          hadAriaHidden: el.getAttribute('aria-hidden'),
        };
        // 不支持 inert 时仅置 aria-hidden；键盘焦点由模态 trap 圈定
        if (supportsInert) el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
        return record;
      });
  }

  function restoreBackground(): void {
    inertRecords.forEach(({ el, hadInert, hadAriaHidden }) => {
      if (!el.isConnected) return;
      if (hadInert) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
      if (hadAriaHidden === null) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', hadAriaHidden);
    });
    inertRecords = [];
  }

  function restoreTriggerFocus(trigger: HTMLElement | null): void {
    // 恢复到打开该层前记录的触发元素；元素已卸载则放弃
    if (trigger && trigger.isConnected && typeof trigger.focus === 'function') {
      trigger.focus();
    }
  }

  /** 是否存在做背景 inert 隔离的层 */
  function hasIsolate(): boolean {
    return stack.some((e) => e.isolate);
  }

  function openOverlay(overlayOptions: OpenOverlayOptions = {}): OverlayLayer {
    const modal = overlayOptions.modal ?? true;
    const trigger =
      typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    // 模态默认全部施加；非模态默认全不施加；模态层可逐项关闭
    const lockScroll = overlayOptions.lockScroll ?? modal;
    const deemphasis = overlayOptions.deemphasis ?? modal;
    const isolate = overlayOptions.isolate ?? modal;
    const hadIsolate = hasIsolate();
    const entry: StackEntry = {
      id: ++seq,
      modal,
      lockScroll,
      deemphasis,
      blur: deemphasis ? (overlayOptions.blur ?? false) : false,
      isolate,
      closeOnEscape: overlayOptions.closeOnEscape ?? true,
      onRequestClose: overlayOptions.onRequestClose ?? null,
      onActiveChange: modal ? (overlayOptions.onActiveChange ?? null) : null,
      trigger: modal ? trigger : null,
    };
    stack.push(entry);
    bindStackEsc();
    syncActiveTrap();

    if (lockScroll) lockBodyScroll();
    // 首个隔离层打开时 inert 背景（叠加不重复采集）
    if (isolate && !hadIsolate) isolateBackground();
    if (deemphasis) {
      acquireOverlayActive();
      syncBlurAttribute();
      // 统一信号流：模态 overlay 打开是一次 overlay_open 信号（reveal/elevated）
      signal({
        kind: 'overlay_open',
        target: trigger ? { el: trigger } : undefined,
        payload: { phase: 'open' },
      });
    }
    emit('overlay', {
      depth: stack.length,
      phase: 'open',
      blur: currentBlur(),
      modal,
    });

    return {
      id: entry.id,
      close() {
        const index = stack.findIndex((e) => e.id === entry.id);
        if (index === -1) return;
        stack.splice(index, 1);
        syncActiveTrap(entry);
        if (stack.length === 0) unbindStackEsc();

        if (entry.lockScroll) unlockBodyScroll();
        if (entry.deemphasis) {
          releaseOverlayActive();
          syncBlurAttribute();
          // 关闭信号：供 builtin:overlay-restore 匹配
          signal({
            kind: 'overlay_open',
            target: trigger ? { el: trigger } : undefined,
            payload: { phase: 'close' },
          });
        }
        if (entry.isolate && !hasIsolate()) {
          // 先解除 inert，再恢复焦点，避免焦点落回仍被隔离的触发源
          restoreBackground();
          restoreTriggerFocus(entry.trigger);
        }
        emit('overlay', {
          depth: stack.length,
          phase: 'close',
          blur: currentBlur(),
          modal: entry.modal,
        });
      },
    };
  }

  /* ---------------- 信号调度 ---------------- */
  function signal<P = unknown>(input: SignalInput<P>): PerceptionSignal<P> {
    const base: PerceptionSignal<P> = isRawSignal(input)
      ? input
      : createSignal(input as CreateSignalOptions<P>);

    const proxySnap = proxies.observe(base as PerceptionSignal);
    const ctx = {
      overlayDepth: modalCount(),
      reducedMotion: reducedMotionFn(),
      proxies: proxySnap,
      scopeId,
    };

    const applied = applyStrategies(
      base as PerceptionSignal,
      activeStrategies.list(),
      ctx,
      (id) => activeStrategies.registrationIndex(id),
    );

    // 低层 SignalPolicy 仍可叠改（兼容入口）
    const recognized = applyPolicies(applied.signal, policies) as PerceptionSignal<P>;

    emit('signal', recognized as unknown as PerceptionSignal);

    let respondPayload = applied.respond;
    if (respondPayload) {
      respondPayload = {
        ...respondPayload,
        signal: recognized as unknown as PerceptionSignal,
        channel: recognized.channel,
        intent: recognized.intent,
      };
      emit('respond', respondPayload);
    }

    if (respondPayload) {
      const transition = weightFromRespond(recognized as unknown as PerceptionSignal, respondPayload);
      if (transition) emit('weight', transition);
    } else {
      const transition = toWeightTransition(recognized);
      if (transition) emit('weight', transition);
    }

    return recognized;
  }

  function on<E extends PerceptionEventType>(event: E, handler: Handler<E>): () => void {
    let set = handlers[event] as Set<Handler<E>> | undefined;
    if (!set) {
      set = new Set<Handler<E>>();
      (handlers[event] as Set<Handler<E>> | undefined) = set;
    }
    set.add(handler);
    return () => set?.delete(handler);
  }

  function usePolicy(policy: SignalPolicy): () => void {
    policies.unshift(policy);
    return () => {
      const i = policies.indexOf(policy);
      if (i !== -1) policies.splice(i, 1);
    };
  }

  return {
    signal,
    on,
    usePolicy,
    strategies: rootStrategies,
    runWithRegistry(registry, fn) {
      registryStack.push(activeStrategies);
      activeStrategies = registry;
      try {
        return fn();
      } finally {
        activeStrategies = registryStack.pop() ?? rootStrategies;
      }
    },
    setReducedMotion(fn: () => boolean) {
      reducedMotionFn = fn;
    },
    setScopeId(id: string | undefined) {
      scopeId = id;
    },
    openOverlay,
    lockScroll() {
      lockBodyScroll();
      let released = false;
      return () => {
        if (released) return;
        released = true;
        unlockBodyScroll();
      };
    },
    overlayDepth: modalCount,
    floatingDepth: () => stack.length,
  };
}

export type { StrategyMotionTier };
