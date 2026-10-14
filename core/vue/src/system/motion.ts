import { useReducedMotion } from '../composables/useReducedMotion';
import {
  ANIMATION,
  motionTierDuration,
  type MotionTierId,
} from '../themes/animation-tokens';
import { KIND_PRESETS } from './perception/policy';
import type { SignalKind } from './perception/signals';

/** 动效目的（@ocpui/docs/spec/foundation/motion-system.md） */
export type MotionPurpose =
  | 'explain_focus'
  | 'explain_state'
  | 'explain_spatial_origin'
  | 'explain_progress';

/** trigger → purpose 基线（perception §5 典型映射） */
const TRIGGER_PURPOSE: Record<SignalKind, MotionPurpose> = {
  pointer_hover: 'explain_focus',
  pointer_press: 'explain_focus',
  user_select: 'explain_focus',
  user_submit: 'explain_progress',
  overlay_open: 'explain_spatial_origin',
  expand_panel: 'explain_spatial_origin',
  list_update: 'explain_state',
  focus_transfer: 'explain_focus',
  system_event: 'explain_progress',
};

export interface MotionPreset {
  /** 来源感知信号（trigger 驱动解析时存在） */
  trigger?: SignalKind;
  purpose: MotionPurpose;
  tier: MotionTierId | 'none';
  /** CSS transition 字符串 */
  transition: string;
  /** 时长，供 JS 定时器使用 */
  durationMs: number;
  /** 是否已降级 */
  reduced: boolean;
}

const PURPOSE_TRANSITION: Record<MotionPurpose, keyof typeof ANIMATION.TRANSITION> = {
  explain_focus: 'MICRO',
  explain_state: 'TRANSFORM',
  explain_spatial_origin: 'MODAL',
  explain_progress: 'MICRO',
};

const TIER_MS: Record<MotionTierId, number> = {
  micro: ANIMATION.DURATION.FAST_MS,
  light: ANIMATION.DURATION.NORMAL_MS,
  medium: ANIMATION.DURATION.MEDIUM_MS,
  heavy: ANIMATION.DURATION.SLOW_MS,
  scene: ANIMATION.DURATION.ENTRANCE_MS,
};

/**
 * 动效系统门面：按 purpose/tier 返回 transition，自动响应 prefers-reduced-motion。
 */
export function useUiMotion() {
  const reduced = useReducedMotion();

  function resolve(purpose: MotionPurpose, tier: MotionTierId = 'light'): MotionPreset {
    if (reduced.value) {
      return {
        purpose,
        tier: 'none',
        transition: 'none',
        durationMs: 0,
        reduced: true,
      };
    }
    const transitionKey = PURPOSE_TRANSITION[purpose];
    return {
      purpose,
      tier,
      transition: ANIMATION.TRANSITION[transitionKey],
      durationMs: TIER_MS[tier],
      reduced: false,
    };
  }

  /**
   * trigger 驱动解析：tier/purpose 默认取自感知词表基线（perception §5 一致性原则：
   * 同一 trigger 全库共享 tier/ease），可显式覆盖；例外须在 registry decisions[] 留痕。
   */
  function resolveTrigger(
    trigger: SignalKind,
    override?: { purpose?: MotionPurpose; tier?: MotionTierId },
  ): MotionPreset {
    const preset = resolve(
      override?.purpose ?? TRIGGER_PURPOSE[trigger],
      override?.tier ?? (KIND_PRESETS[trigger].tier === 'none' ? 'light' : KIND_PRESETS[trigger].tier),
    );
    return { ...preset, trigger };
  }

  function tierDuration(tier: MotionTierId): string {
    return motionTierDuration(tier);
  }

  return { resolve, resolveTrigger, tierDuration, reduced };
}
