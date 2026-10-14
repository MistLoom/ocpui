import type { ToastOptions, ToastType } from './toast.types';

interface ToastContainerInstance {
  add: (options: ToastOptions) => string;
  remove: (id: string | number) => void;
  clearAll: () => void;
}

let containerInstance: ToastContainerInstance | null = null;

export const registerToastContainer = (instance: ToastContainerInstance) => {
  containerInstance = instance;
};

const createToastMethod = (type: ToastType) => {
  return (message: string, duration?: number, closable?: boolean): string => {
    if (!containerInstance) {
      console.warn('[Toast] Container not registered, make sure <ToastContainer /> is mounted');
      return '';
    }
    return containerInstance.add({
      type,
      message,
      duration,
      closable,
    });
  };
};

/**
 * Toast 轻提示服务
 *
 * 使用方式：
 * ```ts
 * import { toast } from '@ocpui/vue';
 *
 * // 基础用法
 * toast.success('操作成功');
 * toast.error('操作失败');
 * toast.warning('警告提示');
 * toast.info('普通提示');
 *
 * // 自定义显示时间（毫秒）
 * toast.success('保存成功', 5000); // 5秒后关闭
 *
 * // 手动关闭
 * toast.info('请手动关闭', 0, true); // duration=0 表示不自动关闭
 *
 * // 关闭指定 Toast
 * const id = toast.info('处理中...', 0);
 * toast.remove(id); // 手动关闭
 *
 * // 关闭所有 Toast
 * toast.clearAll();
 * ```
 */
export const toast = {
  /**
   * 成功提示
   * @param message 提示内容
   * @param duration 显示时长（毫秒），默认 3000
   * @param closable 是否可手动关闭，默认 true
   */
  success: createToastMethod('success'),

  /**
   * 错误提示
   * @param message 提示内容
   * @param duration 显示时长（毫秒），默认 3000
   * @param closable 是否可手动关闭，默认 true
   */
  error: createToastMethod('error'),

  /**
   * 警告提示
   * @param message 提示内容
   * @param duration 显示时长（毫秒），默认 3000
   * @param closable 是否可手动关闭，默认 true
   */
  warning: createToastMethod('warning'),

  /**
   * 信息提示
   * @param message 提示内容
   * @param duration 显示时长（毫秒），默认 3000
   * @param closable 是否可手动关闭，默认 true
   */
  info: createToastMethod('info'),

  /**
   * 关闭指定 Toast
   * @param id Toast ID
   */
  remove: (id: string | number): void => {
    containerInstance?.remove(id);
  },

  /**
   * 关闭所有 Toast
   */
  clearAll: (): void => {
    containerInstance?.clearAll();
  },
};

export default toast;
