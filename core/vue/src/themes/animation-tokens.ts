/**
 * 统一动画配置常量 (Animation Constants)
 * 
 * TypeScript版本，供组件逻辑中使用
 * 与 animation-tokens.css 保持同步
 */

// 先定义独立的常量对象，避免循环引用
// 时长与 contract/variables.css 的 tier 分级对齐（motion-system §3）：
// micro 50–150 / light 150–300 / medium 300–500 / heavy 500–1000
const DURATION_CONST = {
  INSTANT: '0.1s',
  FAST: '0.15s',    // micro
  NORMAL: '0.2s',   // light
  MEDIUM: '0.4s',   // medium
  SLOW: '0.6s',     // heavy
  ENTRANCE: '0.5s',
  PAGE: '0.7s',

  SPIN: '1s',
  PULSE: '2s',
  BLINK: '1s',

  /* 毫秒版本（用于 rAF、setTimeout 等） */
  INSTANT_MS: 100,
  FAST_MS: 150,
  NORMAL_MS: 200,
  MEDIUM_MS: 400,
  SLOW_MS: 600,
  ENTRANCE_MS: 500,
  PAGE_MS: 700,
} as const;

const EASING_CONST = {
  STANDARD: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  OUT_EXPO: 'cubic-bezier(0.16, 1, 0.3, 1)',
  IN_EXPO: 'cubic-bezier(0.7, 0, 0.84, 0)',
  LINEAR: 'linear',
  STEP_END: 'step-end',
} as const;

/** 运行时过渡优先读 CSS 变量，便于 L2 theme 压档 / 换缓动 */
const TRANSITION_CONST = {
  MICRO: 'var(--transition-micro)',
  BASE: 'var(--transition-wash, var(--transition-micro))',
  TRANSFORM: 'var(--transition-transform)',
  LAYOUT: `width ${DURATION_CONST.SLOW} ${EASING_CONST.IN_OUT}, height ${DURATION_CONST.SLOW} ${EASING_CONST.IN_OUT}`,
  EXPAND: 'var(--transition-expand)',
  MODAL: 'var(--transition-modal)',
  DRAWER: 'var(--transition-drawer)',
  DROPDOWN: 'var(--transition-dropdown)',
  TOOLTIP: 'var(--transition-dropdown)',
  INK: 'var(--transition-ink)',
  WASH: 'var(--transition-wash)',
} as const;

export const ANIMATION = {
  /* ============================================
     动画时长 (Duration)
     ============================================ */
  DURATION: DURATION_CONST,

  /* ============================================
     缓动函数 (Easing Functions)
     ============================================ */
  EASING: EASING_CONST,

  /* ============================================
     预设过渡 (Transition Presets)
     推荐在组件中使用这些预设
     ============================================ */
  TRANSITION: TRANSITION_CONST,

  /* ============================================
     CSS变量名映射
     用于动态样式设置
     ============================================ */
  CSS_VARS: {
    DURATION: {
      INSTANT: '--duration-instant',
      FAST: '--duration-fast',
      NORMAL: '--duration-normal',
      MEDIUM: '--duration-medium',
      SLOW: '--duration-slow',
      ENTRANCE: '--duration-entrance',
      PAGE: '--duration-page',
    },
    EASING: {
      STANDARD: '--ease-standard',
      IN_OUT: '--ease-in-out',
      OUT_EXPO: '--ease-out-expo',
      IN_EXPO: '--ease-in-expo',
      ENTER: '--ease-enter',
      EXIT: '--ease-exit',
    },
    PRESETS: {
      MICRO: '--transition-micro',
      BASE: '--transition-base',
      TRANSFORM: '--transition-transform',
      LAYOUT: '--transition-layout',
      MODAL: '--transition-modal',
      DRAWER: '--transition-drawer',
      INK: '--transition-ink',
      WASH: '--transition-wash',
    }
  } as const,
} as const;

export type AnimationDuration = keyof typeof ANIMATION.DURATION;
export type AnimationEasing = keyof typeof ANIMATION.EASING;
export type AnimationTransition = keyof typeof ANIMATION.TRANSITION;

/**
 * OCP 动效分级（@ocpui/docs/spec/foundation/motion-system.md）→ 现有 DURATION 映射
 */
export const MOTION_TIER = {
  micro: DURATION_CONST.FAST,
  light: DURATION_CONST.NORMAL,
  medium: DURATION_CONST.MEDIUM,
  heavy: DURATION_CONST.SLOW,
  scene: DURATION_CONST.ENTRANCE,
} as const;

export type MotionTierId = keyof typeof MOTION_TIER;

export function motionTierDuration(tier: MotionTierId): string {
  return MOTION_TIER[tier];
}

/**
 * 获取预设过渡字符串
 * @param preset 预设名称
 * @returns CSS transition 字符串
 */
export function getTransition(preset: AnimationTransition): string {
  return ANIMATION.TRANSITION[preset];
}

/**
 * 构建自定义过渡字符串（仅包含GPU友好属性）
 * @param options 过渡选项
 * @returns CSS transition 字符串
 */
export function buildOptimizedTransition(options: {
  properties?: ('transform' | 'opacity')[];
  duration?: string;
  easing?: string;
}): string {
  const {
    properties = ['transform', 'opacity'],
    duration = ANIMATION.DURATION.NORMAL,
    easing = ANIMATION.EASING.STANDARD,
  } = options;

  return properties
    .map(prop => `${prop} ${duration} ${easing}`)
    .join(', ');
}

/**
 * 获取动画时长（毫秒）
 * @param duration 时长名称
 * @returns 毫秒数
 */
export function getDurationMs(duration: Extract<AnimationDuration, 'INSTANT' | 'FAST' | 'NORMAL' | 'MEDIUM' | 'SLOW' | 'ENTRANCE' | 'PAGE'>): number {
  return ANIMATION.DURATION[`${duration}_MS` as keyof typeof ANIMATION.DURATION] as number;
}
