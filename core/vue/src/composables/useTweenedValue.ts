import { onMounted, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import { useReducedMotion } from './useReducedMotion';
import { useRafLoop } from './useRafLoop';

export type TweenEasing = (t: number) => number;

/** 组件库常用缓动，单一事实源，避免各数值动画私有实现 */
export const TWEEN_EASINGS = {
  linear: (t: number) => t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
} as const;

export type TweenEasingName = keyof typeof TWEEN_EASINGS;

export interface UseTweenedValueOptions {
  /** 动画时长 ms，默认 600 */
  duration?: MaybeRefOrGetter<number>;
  /** 缓动，默认 easeOutQuart */
  easing?: TweenEasingName | TweenEasing;
  /** 挂载起始值；默认取 source 首值（挂载即显示目标值，不从 0 动） */
  initial?: number;
  /** 挂载时是否从 initial 动到目标值，默认 false */
  animateOnMount?: boolean;
  /** 减动效偏好；默认注入 useReducedMotion */
  reducedMotion?: MaybeRefOrGetter<boolean>;
  /** 每次补间开始回调（减动效直跳不触发） */
  onStart?: (target: number) => void;
  /** 每次补间自然结束回调（中途被打断不触发） */
  onFinish?: (target: number) => void;
}

export interface UseTweenedValueReturn {
  value: Ref<number>;
  /** 立即跳到目标值（不产生动画） */
  snapTo: (target: number) => void;
  /** 从当前显示值重新补间到目标值 */
  play: () => void;
  /** 是否正在补间 */
  isAnimating: Ref<boolean>;
}

function resolveEasing(easing: UseTweenedValueOptions['easing']): TweenEasing {
  if (typeof easing === 'function') return easing;
  return TWEEN_EASINGS[easing ?? 'easeOutQuart'];
}

/**
 * 数值补间：随 source 变化在 duration 内插值。
 *
 * - rAF 经 useRafLoop 统一管理，卸载自动取消，SSR 安全；
 * - prefers-reduced-motion / 手动减动效时直接跳到目标值；
 * - 中途 source 再变，从当前显示值平滑转向新目标，不叠加帧循环。
 */
export function useTweenedValue(
  source: MaybeRefOrGetter<number>,
  options: UseTweenedValueOptions = {},
): UseTweenedValueReturn {
  const duration = options.duration ?? 600;
  const easing = resolveEasing(options.easing);
  // 显式传入时不初始化 useReducedMotion（便于在非组件作用域/SSR 测试中使用）
  const reducedMotion = options.reducedMotion ?? useReducedMotion();

  const initial = options.initial ?? toValue(source);
  const value = ref(initial);
  const isAnimating = ref(false);

  let startValue = initial;
  let targetValue = toValue(source);
  let startTime: number | null = null;

  const loop = useRafLoop((time, controls) => {
    if (startTime === null) startTime = time;
    const ms = Math.max(0, toValue(duration));
    const progress = ms === 0 ? 1 : Math.min((time - startTime) / ms, 1);
    value.value = startValue + (targetValue - startValue) * easing(progress);
    if (progress >= 1) {
      controls.stop();
      isAnimating.value = false;
      options.onFinish?.(targetValue);
    }
  });

  function snapTo(target: number): void {
    loop.stop();
    isAnimating.value = false;
    startTime = null;
    targetValue = target;
    startValue = target;
    value.value = target;
  }

  function play(): void {
    animateTo(targetValue);
  }

  function animateTo(target: number): void {
    targetValue = target;
    if (toValue(reducedMotion)) {
      snapTo(target);
      return;
    }
    startValue = value.value;
    startTime = null;
    isAnimating.value = true;
    options.onStart?.(target);
    loop.start();
  }

  watch(
    () => toValue(source),
    (target, old) => {
      if (old === target) return;
      animateTo(target);
    },
  );

  if (options.animateOnMount) {
    onMounted(play);
  }

  return { value, snapTo, play, isAnimating };
}
