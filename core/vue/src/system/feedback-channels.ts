import { useUiFeedback } from '../feedback/useUiFeedback';
import type { UiActionFeedback, UiSystemFeedback } from '../feedback/feedback-bridge';

/**
 * 用户动作通道：确认、校验、内联反馈
 * @see @ocpui/docs/spec/foundation/interaction-network.md
 */
export function useUiActionFeedback(): UiActionFeedback {
  return useUiFeedback().action;
}

/**
 * 系统事件通道：推送、全局加载、后台同步
 */
export function useUiSystemFeedback(): UiSystemFeedback {
  return useUiFeedback().system;
}
