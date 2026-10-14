import { getCurrentInstance, inject } from 'vue';
import { toast } from '../components/utility/toast';
import { createDialogChannel } from './channels/dialog-channel';
import { createLoadingChannel } from './channels/loading-channel';
import { createNotifyChannel } from './channels/notify-channel';
import {
  UI_FEEDBACK_KEY,
  type UiFeedbackContext,
  type UiMessageFeedback,
  type UiActionFeedback,
  type UiSystemFeedback,
} from './feedback-bridge';

const fallbackDialog = createDialogChannel();
const fallbackNotify = createNotifyChannel(toast);
const fallbackLoading = createLoadingChannel();

const fallbackAction: UiActionFeedback = { dialog: fallbackDialog, message: toast };
const fallbackSystem: UiSystemFeedback = { notify: fallbackNotify, loading: fallbackLoading };

const fallback: UiFeedbackContext = {
  action: fallbackAction,
  system: fallbackSystem,
  message: toast,
  dialog: fallbackDialog,
  notify: fallbackNotify,
  loading: fallbackLoading,
};

/**
 * 注入 UiRoot 提供的反馈上下文；未挂载 UiRoot 时降级为 toast 单例。
 */
export function useUiFeedback(): UiFeedbackContext {
  if (!getCurrentInstance()) return fallback;
  const provided = inject<UiFeedbackContext | undefined>(UI_FEEDBACK_KEY);
  return provided ?? fallback;
}

/** 仅 message 通道快捷方式 */
export function useUiMessage(): UiMessageFeedback {
  return useUiFeedback().message;
}
