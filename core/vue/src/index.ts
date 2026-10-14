// @ocpui/vue 公共 API
export * from './components';
export * from './root';
export * from './themes';
export * from './types';
export * from './locale';
export { useUiT } from './composables/useUiT';
export type { UseUiTReturn } from './composables/useUiT';
export { useUiScenario } from './composables/useUiScenario';
export { useReducedMotion, prefersReducedMotion } from './composables/useReducedMotion';
export {
  useSlidingIndicator,
  type UseSlidingIndicatorOptions,
  type UseSlidingIndicatorReturn,
} from './composables/useSlidingIndicator';
export {
  useBreakpoint,
  THEME_BREAKPOINTS,
  type Breakpoint,
} from './composables/useBreakpoint';
export {
  resolveResponsiveValue,
  isResponsiveValue,
  type ResponsiveValue,
} from './composables/resolveResponsiveValue';
export {
  resolveAsyncShellPending,
  useClientBrowseReveal,
  useAsyncRevealDocumentGate,
  useAsyncShellPending,
  asyncRevealRegisterPending,
  syncAsyncRevealDocumentClass,
  OCP_ASYNC_REVEAL_READY_CLASS,
  OCP_ASYNC_REVEAL_BOOT_SCRIPT,
} from './composables/useAsyncReveal';
export type {
  AsyncRevealBrowsePolicy,
  AsyncRevealRefreshOnMount,
  AsyncRevealMode,
  AsyncShellPendingInput,
  UseClientBrowseRevealOptions,
} from './composables/useAsyncReveal';
export * from './feedback';
export * from './system';
export * from './validation';
export { toast, registerToastContainer } from './components/utility/toast';
export type { ToastOptions, ToastType, ToastPosition } from './components/utility/toast.types';
