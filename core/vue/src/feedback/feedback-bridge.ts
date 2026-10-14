import type { InjectionKey } from 'vue';
import { toast } from '../components/utility/toast';
import { createDialogChannel, type UiDialogFeedback } from './channels/dialog-channel';
import { createLoadingChannel, type UiLoadingFeedback } from './channels/loading-channel';
import { createNotifyChannel, type UiNotifyFeedback } from './channels/notify-channel';

/** 包内 message 通道契约（toast） */
export interface UiMessageFeedback {
  success(message: string, duration?: number, closable?: boolean): string;
  error(message: string, duration?: number, closable?: boolean): string;
  warning(message: string, duration?: number, closable?: boolean): string;
  info(message: string, duration?: number, closable?: boolean): string;
  remove(id: string | number): void;
  clearAll(): void;
}

export type ErrorResolver = (err: unknown) => string | undefined;

/** 用户动作通道：确认、校验、内联反馈 */
export interface UiActionFeedback {
  dialog: UiDialogFeedback;
  message: UiMessageFeedback;
}

/** 系统事件通道：推送、全局加载、后台同步 */
export interface UiSystemFeedback {
  notify: UiNotifyFeedback;
  loading: UiLoadingFeedback;
}

/** 反馈上下文：由 UiRoot provide；应用层可 register 扩展通道 */
export interface UiFeedbackContext {
  /** 用户动作通道 */
  action: UiActionFeedback;
  /** 系统事件通道 */
  system: UiSystemFeedback;
  /** 兼容扁平访问 */
  message: UiMessageFeedback;
  dialog: UiDialogFeedback;
  notify: UiNotifyFeedback;
  loading: UiLoadingFeedback;
  errorResolver?: ErrorResolver;
  register?(channel: string, impl: unknown): void;
  [channel: string]: unknown;
}

export const UI_FEEDBACK_KEY: InjectionKey<UiFeedbackContext> = Symbol('ocpui.feedback');

export type UiFeedbackBridge = UiFeedbackContext & {
  register(channel: string, impl: unknown): void;
};

export interface CreateUiFeedbackBridgeOptions {
  errorResolver?: ErrorResolver;
}

/** 创建可扩展的反馈桥，默认 message/dialog；notify/loading 由 FeedbackHost 绑定后可用 */
export function createUiFeedbackBridge(
  options: CreateUiFeedbackBridgeOptions = {},
): UiFeedbackBridge {
  const notify = createNotifyChannel(toast);
  const loading = createLoadingChannel();
  const dialog = createDialogChannel();

  const action: UiActionFeedback = { dialog, message: toast };
  const system: UiSystemFeedback = { notify, loading };

  const ctx: UiFeedbackContext = {
    action,
    system,
    message: toast,
    dialog,
    notify,
    loading,
    errorResolver: options.errorResolver,
    register(channel: string, impl: unknown) {
      ctx[channel] = impl;
    },
  };
  return ctx as UiFeedbackBridge;
}

export type {
  DialogConfirmOptions,
  DialogShowOptions,
  UiDialogFeedback,
} from './channels/dialog-channel';
export type { NotifyItem, UiNotifyFeedback } from './channels/notify-channel';
export type { UiLoadingFeedback } from './channels/loading-channel';
