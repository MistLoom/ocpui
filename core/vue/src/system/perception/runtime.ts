/**
 * 感知层 Vue 运行时：注入控制器、组件接入门面、overlay 统一收口、区域 Scope。
 */
import {
  getCurrentInstance,
  inject,
  onUnmounted,
  provide,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue';
import {
  createPerceptionController,
  type OverlayLayer,
  type PerceptionController,
} from './controller';
import type { SignalPolicy } from './signals';
import { createStrategyRegistry, type StrategyRegistry } from './strategy-registry';
import type { PerceptionStrategy } from './strategy-types';

export const UI_PERCEPTION_KEY: InjectionKey<PerceptionController> = Symbol('ocpui.perception');
export const UI_PERCEPTION_SCOPE_ID_KEY: InjectionKey<string> = Symbol('ocpui.perception.scopeId');

/** 脱离 UiRoot 时的进程内兜底控制器（保证门面始终可用） */
const fallbackController: PerceptionController = createPerceptionController();

/** 感知中央控制器门面：优先取 UiRoot / Scope 注入，否则用兜底单例 */
export function usePerception(): PerceptionController {
  if (!getCurrentInstance()) return fallbackController;
  return inject(UI_PERCEPTION_KEY, fallbackController);
}

export interface InstallPerceptionOptions {
  policies?: SignalPolicy[];
  strategies?: readonly PerceptionStrategy[];
  includeBuiltins?: boolean;
  reducedMotion?: () => boolean;
}

/** UiRoot 安装控制器并允许注册全局识别策略 / 场景策略 */
export function installPerception(
  policiesOrOptions: SignalPolicy[] | InstallPerceptionOptions = [],
): PerceptionController {
  const options: InstallPerceptionOptions = Array.isArray(policiesOrOptions)
    ? { policies: policiesOrOptions }
    : policiesOrOptions;
  const controller = createPerceptionController(undefined, {
    strategies: options.strategies,
    includeBuiltins: options.includeBuiltins,
    reducedMotion: options.reducedMotion,
  });
  options.policies?.forEach((p) => controller.usePolicy(p));
  return controller;
}

export interface ProvidePerceptionScopeOptions {
  /** 在父级列表上按 id 覆盖/追加 */
  strategies?: PerceptionStrategy[];
  /** 若提供则替换为本集（不再继承父级列表） */
  set?: PerceptionStrategy[];
  scopeId?: string;
  reducedMotion?: () => boolean;
}

let scopeSeq = 0;

/**
 * 区域 Scope：子树内 usePerception() 拿到包装控制器；
 * signal 在本 Scope 注册表上求值；overlay / on 共享父级总线。
 */
export function providePerceptionScope(
  options: ProvidePerceptionScopeOptions = {},
): StrategyRegistry {
  const parent = usePerception();
  const scopeId = options.scopeId ?? `scope-${++scopeSeq}`;
  const registry = createStrategyRegistry();

  if (options.set) {
    options.set.forEach((s) => registry.add(s));
  } else {
    parent.strategies.list().forEach((s) => registry.add(s));
    options.strategies?.forEach((s) => registry.add(s));
  }

  if (options.reducedMotion) {
    parent.setReducedMotion(options.reducedMotion);
  }

  const scoped: PerceptionController = {
    get strategies() {
      return registry;
    },
    setReducedMotion: parent.setReducedMotion.bind(parent),
    setScopeId: parent.setScopeId.bind(parent),
    usePolicy: parent.usePolicy.bind(parent),
    on: parent.on.bind(parent),
    openOverlay: parent.openOverlay.bind(parent),
    lockScroll: parent.lockScroll.bind(parent),
    overlayDepth: parent.overlayDepth.bind(parent),
    floatingDepth: parent.floatingDepth.bind(parent),
    runWithRegistry: parent.runWithRegistry.bind(parent),
    signal(input) {
      parent.setScopeId(scopeId);
      try {
        return parent.runWithRegistry(registry, () => parent.signal(input));
      } finally {
        parent.setScopeId(undefined);
      }
    },
  };

  provide(UI_PERCEPTION_KEY, scoped);
  provide(UI_PERCEPTION_SCOPE_ID_KEY, scopeId);
  return registry;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetWidth || el.offsetHeight || el.getClientRects().length,
  );
}

export interface UseOverlayLayerOptions {
  /** 背景深降焦 blur（W4 可选手段），可响应式 */
  blur?: boolean | Ref<boolean>;
  /** 提供容器时启用焦点 trap：打开聚焦首元素，Tab 循环，Esc 请求关闭 */
  container?: Ref<HTMLElement | null | undefined>;
  /** 打开时优先聚焦的元素（如危险操作的确认输入框）；缺省聚焦首个可聚焦元素 */
  initialFocus?: Ref<HTMLElement | null | undefined>;
  closeOnEscape?: boolean | Ref<boolean>;
  onRequestClose?: () => void;
  /**
   * 无离场动画的浮层（命令面板/搜索/图片预览）置 true：
   * visible 转 false 立即释放本层；默认 false，由 Transition after-leave 调 afterLeave。
   */
  releaseWhenHidden?: boolean;
  /** 是否隔离背景宿主（inert/aria-hidden），默认 true；就地非 Teleport 浮层置 false */
  isolate?: boolean;
  /**
   * 是否模态层，默认 true。
   * 非模态浮层（下拉/Popover/Tooltip/菜单）置 false：仅登记入栈参与 Esc 按栈与层叠，
   * 默认不锁页、不 W4 降焦、不 inert、不接管焦点 trap。
   */
  modal?: boolean;
  /** 是否锁定背景滚动，默认取 modal；全屏系统 loading 可 modal:false + lockScroll:true */
  lockScroll?: boolean;
  /**
   * 是否施加 W4 背景降焦（data-ui-overlay-active + overlay_open 信号），默认取 modal。
   * 数据态 loading 必须为 false（state-system §3：数据态与焦点权重正交）。
   */
  deemphasis?: boolean;
}

export interface OverlayLayerApi {
  /** 当前模态栈深（响应式需经控制器事件自行订阅） */
  depth: () => number;
  /** 当前登记总层数（含非模态浮层） */
  floatingDepth: () => number;
  /** Transition 离场结束后调用以释放本层 */
  afterLeave: () => void;
}

/**
 * overlay 统一收口（替代各处直接 lockBodyScroll / useOverlay 旁路）：
 * 模态打开 → 控制器入栈（滚动锁 + W4 降焦 + 背景 inert + 可选 trap）；
 * 非模态打开 → 仅登记入栈（Esc 按栈派发，不锁页/不降焦）；
 * 离场结束 → 出栈（模态栈空解除 inert 并恢复焦点到触发源）。
 *
 * Esc 由控制器在捕获阶段按栈顶统一派发（仅栈顶层接收），容器内不再各自监听 Esc。
 */
export function useOverlayLayer(
  visible: Ref<boolean>,
  options: UseOverlayLayerOptions = {},
): OverlayLayerApi {
  const controller = usePerception();
  const modal = options.modal ?? true;
  const lockScroll = options.lockScroll ?? modal;
  const deemphasis = options.deemphasis ?? modal;
  let layer: OverlayLayer | null = null;
  /** 当前是否为最顶层模态（由控制器通知），只有激活层接管 Tab */
  let trapActive = false;
  /** open 后内容渲染帧令牌；一帧内关闭即作废，避免对已卸载容器聚焦/绑监听 */
  let rafToken = 0;
  /** 为聚焦空容器临时补的 tabindex，关闭时还原 */
  let injectedTabindex = false;

  function resolveBlur(): boolean {
    return typeof options.blur === 'boolean' ? options.blur : (options.blur?.value ?? false);
  }

  function resolveCloseOnEscape(): boolean {
    return typeof options.closeOnEscape === 'boolean'
      ? options.closeOnEscape
      : (options.closeOnEscape?.value ?? true);
  }

  // 容器内仅接管 Tab 焦点循环；Esc 由控制器按栈派发
  function trapTab(e: KeyboardEvent): void {
    const container = options.container?.value;
    if (!container || e.key !== 'Tab') return;
    const items = getFocusable(container);
    if (items.length === 0) {
      // 空容器：吞掉 Tab，焦点保留在容器本身（容器须可聚焦）
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
      return;
    }
    if (active === last || !container.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  }

  function focusInitial(container: HTMLElement): void {
    const preferred = options.initialFocus?.value;
    if (preferred && container.contains(preferred)) {
      preferred.focus();
      return;
    }
    const items = getFocusable(container);
    if (items.length > 0) {
      items[0].focus();
      return;
    }
    // 无可聚焦元素：容器补 tabindex="-1" 以可编程聚焦，关闭时还原
    if (!container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '-1');
      injectedTabindex = true;
    }
    if (typeof container.focus === 'function') container.focus();
  }

  function bindTrap(): void {
    const container = options.container?.value;
    if (!container || !trapActive) return;
    container.addEventListener('keydown', trapTab);
  }

  function unbindTrap(): void {
    options.container?.value?.removeEventListener('keydown', trapTab);
  }

  function open(): void {
    if (layer) return;
    layer = controller.openOverlay({
      modal,
      lockScroll,
      deemphasis,
      // blur 仅在施加 W4 降焦时有意义
      blur: deemphasis ? resolveBlur() : false,
      isolate: options.isolate ?? modal,
      closeOnEscape: resolveCloseOnEscape(),
      onRequestClose: options.onRequestClose,
      // 仅模态且提供容器时参与最顶层 trap 激活态
      onActiveChange: modal && options.container ? setTrapActive : undefined,
    });
    // 仅模态层接管焦点；等待内容渲染后聚焦并接管 Tab，一帧内关闭则放弃
    if (modal && options.container && typeof requestAnimationFrame === 'function') {
      const token = ++rafToken;
      requestAnimationFrame(() => {
        if (token !== rafToken || !layer) return;
        const container = options.container?.value;
        if (!container) return;
        focusInitial(container);
        bindTrap();
      });
    }
  }

  function setTrapActive(active: boolean): void {
    if (trapActive === active) return;
    trapActive = active;
    if (active) bindTrap();
    else unbindTrap();
  }

  function afterLeave(): void {
    const current = layer;
    layer = null;
    // 作废待执行的渲染帧
    rafToken += 1;
    unbindTrap();
    trapActive = false;
    if (injectedTabindex && options.container?.value) {
      options.container.value.removeAttribute('tabindex');
      injectedTabindex = false;
    }
    current?.close();
  }

  watch(
    visible,
    (val) => {
      if (val) {
        open();
      } else if (options.releaseWhenHidden) {
        afterLeave();
      }
    },
    { immediate: true },
  );

  onUnmounted(afterLeave);

  return {
    depth: () => controller.overlayDepth(),
    floatingDepth: () => controller.floatingDepth(),
    afterLeave,
  };
}

/**
 * 纯背景滚动锁（数据态使用，非浮层）：
 * visible 为 true 时经控制器持一次滚动锁，false / 卸载时释放。
 *
 * 不进 overlay 栈、不改栈深、不 W4 降焦、不 inert、不发 overlay_open 信号。
 * 全屏系统 loading 用它而非 useOverlayLayer，保证数据态与焦点权重正交（state-system §3）。
 */
export function useScrollLock(visible: Ref<boolean>): void {
  const controller = usePerception();
  let release: (() => void) | null = null;

  watch(
    visible,
    (val) => {
      if (val && !release) {
        release = controller.lockScroll();
      } else if (!val && release) {
        release();
        release = null;
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    release?.();
    release = null;
  });
}
