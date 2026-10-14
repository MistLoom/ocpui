// Toast 相关类型定义
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';

export interface ToastOptions {
  type?: ToastType;
  message: string;
  duration?: number;
  closable?: boolean;
}
