import type { ShellDispatchRole, ShellFocusPolicy } from '../types';

/** Shell 调度角色（@ocpui/docs/spec/foundation/container-chain.md） */
export const SHELL_DISPATCH_ROLES = {
  FOCUS_HOST: 'focus-host',
  CHROME_HOST: 'chrome-host',
  CONTENT_HOST: 'content-host',
  OVERLAY_HOST: 'overlay-host',
} as const satisfies Record<string, ShellDispatchRole>;

/** 调度优先级（高 → 低） */
export const DISPATCH_PRIORITY = [
  'focus',
  'presentation',
  'element',
  'style',
  'motion',
  'atmosphere',
] as const;

export interface UiDispatchAttrs {
  'data-ui-dispatch-role'?: ShellDispatchRole;
  'data-ui-focus-policy'?: ShellFocusPolicy;
}

/** 为 Shell/overlay 生成标准 data 属性 */
export function shellDispatchAttrs(
  role: ShellDispatchRole,
  focusPolicy?: ShellFocusPolicy,
): UiDispatchAttrs {
  const attrs: UiDispatchAttrs = { 'data-ui-dispatch-role': role };
  if (focusPolicy) attrs['data-ui-focus-policy'] = focusPolicy;
  return attrs;
}
