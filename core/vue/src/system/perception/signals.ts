/**
 * 感知信号类型体系（F:PERCEPTION 运行时契约）
 *
 * 信号是感知层识别后的一等产物，分三层：
 * 1. SignalSource  信号来源（物理输入），回答"谁发出的"
 * 2. SignalKind    信号语义（受控词表 = motion trigger 词表），回答"发生了什么"
 * 3. SignalIntent  信号产物分类（行为意图），回答"识别成什么"
 *
 * 概率性情绪推断（犹豫/急切/阅读模式）不属于组件库，见 perception.md §3.4；
 * 库内只产出确定性意图（DeterministicIntent）。
 */

/** 信号→动效的受控词表（perception §5），与 registry schema enum 一致 */
export const SIGNAL_KINDS = [
  'pointer_hover',
  'pointer_press',
  'user_select',
  'user_submit',
  'overlay_open',
  'expand_panel',
  'list_update',
  'focus_transfer',
  'system_event',
] as const;

export type SignalKind = (typeof SIGNAL_KINDS)[number];

/** 信号物理来源（interaction-network 双通道：用户事件走通道，系统事件走管道） */
export type SignalSource = 'pointer' | 'keyboard' | 'user' | 'system';

/**
 * 感知识别产物的意图分类。
 * - afford    可交互提示（hover/focus/drop 目标）
 * - activate  持久激活（选中/主焦点 W2）
 * - commit    命令提交（含防重复语义）
 * - reveal    临时空间展开（overlay/折叠面板）
 * - mutate    数据原位变化（不重排、不抢焦点）
 * - navigate  焦点/步骤推进
 * - progress  异步进度
 */
export type SignalIntent =
  | 'afford'
  | 'activate'
  | 'commit'
  | 'reveal'
  | 'mutate'
  | 'navigate'
  | 'progress';

/** 库内可产出的确定性意图；概率性意图归 T4，禁止进 T0–T3 */
export const DETERMINISTIC_INTENTS: readonly SignalIntent[] = [
  'afford',
  'activate',
  'commit',
  'reveal',
  'mutate',
  'navigate',
  'progress',
];

/** 反馈通道归属（interaction-network §1） */
export type FeedbackChannel = 'action' | 'system';

/** 信号载荷：来源载体的可机读描述 */
export interface SignalTarget {
  /** 载体语义 ID（C:xxx）或 dispatchRole */
  carrier?: string;
  /** 可选 DOM 节点，供焦点恢复/trap 使用，不参与序列化 */
  el?: HTMLElement;
}

/** 感知信号（识别产物） */
export interface PerceptionSignal<P = unknown> {
  /** 信号语义，受控词表 */
  kind: SignalKind;
  /** 物理来源 */
  source: SignalSource;
  /** 识别产物：行为意图 */
  intent: SignalIntent;
  /** 反馈通道：用户动作→action，系统/异步→system */
  channel: FeedbackChannel;
  /** 来源载体 */
  target?: SignalTarget;
  /** 信号载荷（如选中项、提交数据、变化单元） */
  payload?: P;
  /** 产生时间戳 */
  at: number;
}

/** 信号识别策略的判定结果 */
export interface SignalDecision {
  /** 是否被本策略识别并收编 */
  recognized: boolean;
  /** 识别后补充/覆盖的产物字段（kind 不可被策略改写） */
  intent?: SignalIntent;
  channel?: FeedbackChannel;
}

/**
 * 信号识别策略：输入一个候选信号，判定是否识别并可修正产物归属。
 * 策略只决定"响应什么、归哪个通道/意图"，不执行视觉/动效（执行归控制器订阅方）。
 */
export type SignalPolicy = (signal: PerceptionSignal) => SignalDecision;

/** 焦点权重级 W0–W4（perception §4.1） */
export type FocusWeight = 'rest' | 'afforded' | 'primary' | 'elevated' | 'deemphasized';

/** 权重转移产物（控制器在信号驱动下生成，供视觉/动效消费） */
export interface WeightTransition {
  /** 失去权重的载体 */
  from?: SignalTarget;
  /** 获得权重的载体 */
  to?: SignalTarget;
  /** 目标权重级 */
  weight: FocusWeight;
  /** 来源信号 */
  cause: SignalKind;
  /** 动效分级（motion-system §3） */
  tier: 'micro' | 'light' | 'medium' | 'heavy' | 'scene' | 'none';
}

/** kind → 默认意图/通道/tier 的内置预案（perception §3/§5） */
export interface KindPreset {
  intent: SignalIntent;
  source: SignalSource;
  channel: FeedbackChannel;
  tier: WeightTransition['tier'];
}
