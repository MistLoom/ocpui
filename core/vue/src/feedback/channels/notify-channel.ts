import type { ToastPosition, ToastType } from '../../components/utility/toast.types';
import type { UiMessageFeedback } from '../feedback-bridge';

export interface RefLike<T> {
  value: T;
}

export interface NotifyItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
  closable: boolean;
  position: ToastPosition;
}

export interface NotifyHostBindings {
  notifications: RefLike<NotifyItem[]>;
  removeNotification: (id: string) => void;
}

export interface UiNotifyFeedback {
  show(opts: {
    type?: ToastType;
    title?: string;
    message: string;
    duration?: number;
    closable?: boolean;
    position?: ToastPosition;
  }): { id: string; close: () => void };
  success(title: string, message: string, duration?: number): { id: string; close: () => void };
  warning(title: string, message: string, duration?: number): { id: string; close: () => void };
  error(title: string, message: string, duration?: number): { id: string; close: () => void };
  info(title: string, message: string, duration?: number): { id: string; close: () => void };
  clearAll(): void;
}

let host: NotifyHostBindings | null = null;
let notifySeed = 0;

export function bindNotifyHost(refs: NotifyHostBindings): void {
  host = refs;
}

export function createNotifyChannel(fallbackMessage: UiMessageFeedback): UiNotifyFeedback {
  const channel: UiNotifyFeedback = {
    show(opts) {
      if (!host) {
        const type = opts.type ?? 'info';
        fallbackMessage[type](opts.message, opts.duration);
        return { id: '', close: () => {} };
      }
      const id = `notify-${Date.now()}-${notifySeed++}`;
      const item: NotifyItem = {
        id,
        type: opts.type ?? 'info',
        title: opts.title ?? '',
        message: opts.message,
        duration: opts.duration ?? 4500,
        closable: opts.closable ?? true,
        position: opts.position ?? 'top-right',
      };
      host.notifications.value = [...host.notifications.value, item];
      return {
        id,
        close: () => host?.removeNotification(id),
      };
    },
    success(title, message, duration) {
      return channel.show({ type: 'success', title, message, duration });
    },
    warning(title, message, duration) {
      return channel.show({ type: 'warning', title, message, duration });
    },
    error(title, message, duration) {
      return channel.show({ type: 'error', title, message, duration });
    },
    info(title, message, duration) {
      return channel.show({ type: 'info', title, message, duration });
    },
    clearAll() {
      host?.notifications.value.forEach((n) => host?.removeNotification(n.id));
      if (host) host.notifications.value = [];
    },
  };
  return channel;
}
