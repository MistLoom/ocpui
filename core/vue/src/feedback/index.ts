export {
  UI_FEEDBACK_KEY,
  createUiFeedbackBridge,
  type UiFeedbackBridge,
  type UiFeedbackContext,
  type UiActionFeedback,
  type UiSystemFeedback,
  type UiMessageFeedback,
  type ErrorResolver,
  type DialogConfirmOptions,
  type DialogShowOptions,
  type UiDialogFeedback,
  type NotifyItem,
  type UiNotifyFeedback,
  type UiLoadingFeedback,
} from './feedback-bridge';
export { useUiFeedback, useUiMessage } from './useUiFeedback';
export { default as OverlayHost } from './OverlayHost.vue';
export {
  bindNotifyHost,
  createNotifyChannel,
} from './channels/notify-channel';
export {
  bindLoadingHost,
  createLoadingChannel,
} from './channels/loading-channel';
export {
  dialogQueue,
  removeDialogItem,
  createDialogChannel,
} from './channels/dialog-channel';
