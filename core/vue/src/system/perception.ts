/**
 * 感知层运行时门面（spec/foundation/perception.md）
 *
 * 类型体系与中央控制器见 ./perception/*：
 * - 信号/意图/权重类型：perception/signals
 * - 识别策略与兜底预案：perception/policy
 * - 场景策略包：perception/strategy-*
 * - 中央控制器与调度协议：perception/controller
 * - Vue 门面/overlay/Scope：perception/runtime
 *
 * 本文件保留焦点权重常量、动效词表与两个内置策略预案（连点守卫/数据变化提示）。
 */
import { ref, computed, watch, onUnmounted, type ComputedRef, type Ref } from 'vue';

export * from './perception/signals';
export * from './perception/policy';
export * from './perception/strategy-types';
export {
  createStrategyRegistry,
  type StrategyRegistry,
} from './perception/strategy-registry';
export { applyStrategies, type ApplyStrategiesResult } from './perception/strategy-engine';
export { createProxyTracker, type ProxyTracker } from './perception/strategy-proxies';
export {
  BUILTIN_STRATEGIES,
  BUILTIN_STRATEGY_IDS,
  getBuiltinStrategy,
  assertBuiltinIdsHaveNoAffectTokens,
} from './perception/strategy-builtins';
export {
  defineStrategy,
  when,
  createStrategySet,
  type StrategyBuilder,
  type CreateStrategySetOptions,
} from './perception/strategy-dx';
export {
  createPerceptionController,
  type PerceptionController,
  type PerceptionEventType,
  type PerceptionEventMap,
  type OverlayStackEvent,
  type OverlayLayer,
  type OpenOverlayOptions,
  type SignalInput,
  type CreatePerceptionControllerOptions,
} from './perception/controller';
export {
  UI_PERCEPTION_KEY,
  UI_PERCEPTION_SCOPE_ID_KEY,
  usePerception,
  installPerception,
  providePerceptionScope,
  useOverlayLayer,
  useScrollLock,
  type UseOverlayLayerOptions,
  type OverlayLayerApi,
  type InstallPerceptionOptions,
  type ProvidePerceptionScopeOptions,
} from './perception/runtime';

/* ---------------- 焦点权重（perception §4.1） ---------------- */

export const FOCUS_WEIGHTS = {
  /** W0 默认内容 */
  REST: 'rest',
  /** W1 可交互提示（hover、drop 目标、新数据） */
  AFFORDED: 'afforded',
  /** W2 当前主焦点 / 持久选中 */
  PRIMARY: 'primary',
  /** W3 overlay-host */
  ELEVATED: 'elevated',
  /** W4 非焦点背景（overlay 打开 / 非 overlay 降焦） */
  DEEMPHASIZED: 'deemphasized',
} as const;

export type FocusWeightLegacy = (typeof FOCUS_WEIGHTS)[keyof typeof FOCUS_WEIGHTS];

/** 权重级 → 根元素 class（W4 overlay 场景另由全局 [data-ui-overlay-active] 联动） */
export const FOCUS_WEIGHT_CLASS: Record<FocusWeightLegacy, string> = {
  rest: '',
  afforded: 'ocp-weight-afforded',
  primary: 'ocp-weight-selected',
  elevated: 'ocp-weight-elevated',
  deemphasized: 'ocp-weight-deemphasized',
};

/* ---------------- motion trigger 受控词表（perception §5） ---------------- */

export { SIGNAL_KINDS as MOTION_TRIGGERS } from './perception/signals';
export type { SignalKind as MotionTrigger } from './perception/signals';

/* ---------------- 复合-连点守卫（perception §3.1，内置策略预案） ---------------- */

export interface RepeatGuardOptions {
  /** 重复判定窗口（ms），默认 800 */
  windowMs?: number;
  /** 外部锁定（如父级 loading）；为 true 时同样忽略触发 */
  locked?: Ref<boolean>;
}

export interface RepeatGuardReturn {
  /** 是否处于提交中（窗口内或外部锁定） */
  pending: ComputedRef<boolean>;
  /** 包装事件处理：窗口内重复调用被忽略，参数类型原样保留 */
  guard: <A extends unknown[]>(fn: (...args: A) => void) => (...args: A) => void;
  /** 提前释放（如提交失败需立刻允许重试时由调用方决定） */
  release: () => void;
}

/**
 * 连点同一可提交控件：首次触发后进入 pending，窗口内重复点击忽略，
 * 不叠加脉冲；窗口结束自动释放（async 动效场景可由外部 locked 接管）。
 */
export function useRepeatGuard(options: RepeatGuardOptions = {}): RepeatGuardReturn {
  const { windowMs = 800, locked } = options;
  const inWindow = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const pending = computed(() => inWindow.value || (locked?.value ?? false));

  function clear() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function release() {
    clear();
    inWindow.value = false;
  }

  function guard<A extends unknown[]>(fn: (...args: A) => void): (...args: A) => void {
    return (...args: A) => {
      if (pending.value) return;
      inWindow.value = true;
      clear();
      timer = setTimeout(() => {
        inWindow.value = false;
        timer = null;
      }, windowMs);
      fn(...args);
    };
  }

  onUnmounted(clear);

  return { pending, guard, release };
}

/* ---------------- 数据变化 W1 单次提示（perception §3.2 / §4.3，内置策略预案） ---------------- */

export interface ChangeFlashReturn {
  /** 是否应挂载 ocp-weight-flash class */
  flashing: Ref<boolean>;
  /** 数据变化时调用（通常 watch 列表/行数据） */
  flash: () => void;
}

/** 回落时长（ms），与 --focus-weight-flash-duration 对齐；单一事实源，避免双处硬编码 */
const FLASH_DURATION_MS = 600;

/**
 * systemChannel 原位 patch 后，变化单元 W0 → W1 → W0 单次提示，
 * ~600ms 内回落（--focus-weight-flash-duration）；不重排、不抢焦点。
 * reduced-motion 下 class 仍挂载但 CSS 动画为 none，变化感知由文案承担。
 */
export function useChangeFlash(): ChangeFlashReturn {
  const flashing = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function clear() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function flash() {
    clear();
    flashing.value = true;
    // 与 --focus-weight-flash-duration 对齐；CSS 动画结束即回落
    timer = setTimeout(() => {
      flashing.value = false;
      timer = null;
    }, FLASH_DURATION_MS);
  }

  onUnmounted(clear);

  return { flashing, flash };
}

/**
 * 监听数据源，引用变化时触发一次 flash（list_update 信号的标准接法）。
 * 首帧（挂载）不触发，避免初始加载误报为数据变化。
 */
export function watchChangeFlash<T>(source: Ref<T>): ChangeFlashReturn {
  const api = useChangeFlash();
  let first = true;
  watch(
    source,
    () => {
      if (first) {
        first = false;
        return;
      }
      api.flash();
    },
    { deep: false },
  );
  return api;
}
