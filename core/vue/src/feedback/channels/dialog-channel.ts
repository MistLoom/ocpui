import { ref, type Ref } from 'vue';
import type { ConfirmType } from '../../components/feedback/confirm-dialog.types';

export interface DialogConfirmOptions {
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface DialogShowOptions extends DialogConfirmOptions {
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
  maskClosable?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

export interface DialogQueueItem {
  id: string;
  visible: boolean;
  title: string;
  content: string;
  confirmText: string;
  cancelText: string;
  type: ConfirmType;
  size: 'sm' | 'md' | 'lg';
  maskClosable: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  resolve?: (value: boolean) => void;
}

export interface UiDialogFeedback {
  confirm(opts: DialogConfirmOptions): Promise<boolean>;
  show(opts: DialogShowOptions): { close: () => void };
}

let seed = 0;

/** OverlayHost 消费的命令式弹窗队列 */
export const dialogQueue: Ref<DialogQueueItem[]> = ref([]);

function pushItem(
  partial: Omit<DialogQueueItem, 'id' | 'visible'>,
  resolve?: (value: boolean) => void,
): string {
  const id = `ocp-dialog-${++seed}`;
  dialogQueue.value = [
    ...dialogQueue.value,
    {
      id,
      visible: true,
      ...partial,
      resolve,
    },
  ];
  return id;
}

export function removeDialogItem(id: string, result: boolean): void {
  const item = dialogQueue.value.find((i) => i.id === id);
  if (!item) return;
  item.visible = false;
  item.resolve?.(result);
  window.setTimeout(() => {
    dialogQueue.value = dialogQueue.value.filter((i) => i.id !== id);
  }, 280);
}

export function createDialogChannel(): UiDialogFeedback {
  return {
    confirm(opts: DialogConfirmOptions): Promise<boolean> {
      return new Promise((resolve) => {
        pushItem(
          {
            title: opts.title ?? '确认',
            content: opts.content ?? '确定要执行此操作吗？',
            confirmText: opts.confirmText ?? '确定',
            cancelText: opts.cancelText ?? '取消',
            type: opts.type ?? 'default',
            size: 'sm',
            maskClosable: false,
            onConfirm: opts.onConfirm,
            onCancel: opts.onCancel,
          },
          resolve,
        );
      });
    },
    show(opts: DialogShowOptions): { close: () => void } {
      const id = pushItem({
        title: opts.title ?? '',
        content: opts.content ?? '',
        confirmText: opts.confirmText ?? '确定',
        cancelText: opts.cancelText ?? '取消',
        type: opts.type ?? 'default',
        size: opts.size ?? 'md',
        maskClosable: opts.maskClosable ?? true,
        onConfirm: opts.onConfirm,
        onCancel: opts.onCancel,
      });
      return { close: () => removeDialogItem(id, false) };
    },
  };
}
