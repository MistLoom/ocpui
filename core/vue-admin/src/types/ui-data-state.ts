/**
 * 业务数据区域状态（T2+ Shell/Block）。
 * 规范：@ocpui/docs/spec/foundation/state-system.md
 */
export type UiDataState =
  | 'initial'
  | 'loading'
  | 'ready'
  | 'empty'
  | 'partial_error'
  | 'error'
  | 'forbidden'
  | 'submitting'
  | 'success'
  | 'success_followup';

/** AdminWorkList 等 Shell 常用子集 */
export type UiDataStateCore = 'loading' | 'ready' | 'empty' | 'error';

/** T0 控件交互态（非 10 态） */
export type UiInteractionState =
  | 'default'
  | 'hover'
  | 'focus'
  | 'active'
  | 'disabled'
  | 'loading';

export const UI_DATA_STATES: readonly UiDataState[] = [
  'initial',
  'loading',
  'ready',
  'empty',
  'partial_error',
  'error',
  'forbidden',
  'submitting',
  'success',
  'success_followup',
] as const;

export function isUiDataState(value: string): value is UiDataState {
  return (UI_DATA_STATES as readonly string[]).includes(value);
}

/** 将 UiDataState 映射为 AdminWorkList 布尔 props（渐进迁移） */
export function adminWorkListFlagsFromState(state: UiDataState) {
  return {
    loading: state === 'initial' || state === 'loading' || state === 'submitting',
    isError: state === 'error' || state === 'partial_error',
    isEmpty: state === 'empty',
    isForbidden: state === 'forbidden',
  };
}
