import { onClickOutside } from '@vueuse/core';
import { toValue, watch, onUnmounted, type MaybeRefOrGetter, type Ref } from 'vue';
import { usePerception } from '../../system/perception/runtime';
import type { OverlayLayer } from '../../system/perception/controller';

export interface FloatingLayerTriggerHandlers {
  /** 绑到触发器 click */
  onTriggerClick: () => void;
  /** 绑到触发器 mouseenter */
  onTriggerEnter: () => void;
  /** 绑到触发器 mouseleave */
  onTriggerLeave: () => void;
  /** 绑到浮层 mouseenter（hover 模式取消关闭计时） */
  onPanelEnter: () => void;
  /** 绑到浮层 mouseleave */
  onPanelLeave: () => void;
  /** 绑到浮层 click（阻止冒泡触发外部关闭） */
  onPanelClick: (event: MouseEvent) => void;
  /** 显式取消悬停计时（卸载/外部关闭时） */
  cancelHover: () => void;
}

export interface UseFloatingLayerOptions {
  /** 当前是否可见 */
  visible: MaybeRefOrGetter<boolean>;
  /** 浮层根（click-outside 判定） */
  panelRef: Ref<HTMLElement | null | undefined>;
  /** 触发器根（click-outside 忽略）；多个可传数组 */
  triggerRef: MaybeRefOrGetter<HTMLElement | HTMLElement[] | null | undefined>;
  trigger?: MaybeRefOrGetter<'click' | 'hover' | 'manual'>;
  /** hover 打开延时 ms */
  showDelay?: MaybeRefOrGetter<number>;
  /** hover 关闭延时 ms */
  hideDelay?: MaybeRefOrGetter<number>;
  closeOnClickOutside?: MaybeRefOrGetter<boolean>;
  closeOnEscape?: MaybeRefOrGetter<boolean>;
  /**
   * 是否登记到感知 non-modal 浮层栈（Esc 按栈顶派发 + 焦点恢复）。
   * click 浮层默认 true；hover tooltip 等高频瞬现浮层传 false。
   */
  registerStack?: MaybeRefOrGetter<boolean>;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * 非模态浮层的统一交互原语（下拉 / Popover / Tooltip / 菜单共用）。
 *
 * 收敛重复样板并保证生命周期/竞态正确：
 * - hover 打开/关闭延时（浮层与触发器之间移动不误关），卸载自动清计时；
 * - click-outside（@vueuse onClickOutside，正确处理 toggle 同帧开/关竞态）；
 * - Esc：登记 non-modal 栈时由感知控制器按栈顶统一派发（仅最顶层接收），
 *   未登记时退化为浮层自身监听；
 * - 入栈层打开记录触发元素、关闭恢复焦点；不锁页、不 W4、不 inert（非模态）。
 *
 * 不含定位（见 useFloatingPosition）。
 */
export function useFloatingLayer(options: UseFloatingLayerOptions): FloatingLayerTriggerHandlers {
  const controller = usePerception();
  let showTimer: ReturnType<typeof setTimeout> | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  /** non-modal 栈层句柄（登记时） */
  let layer: OverlayLayer | null = null;
  /** 打开展示前的焦点元素，关闭时恢复 */
  let triggerElement: HTMLElement | null = null;

  function clearShow(): void {
    if (showTimer !== null) {
      clearTimeout(showTimer);
      showTimer = null;
    }
  }
  function clearHide(): void {
    if (hideTimer !== null) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }
  function cancelHover(): void {
    clearShow();
    clearHide();
  }

  function shouldRegister(): boolean {
    return toValue(options.registerStack ?? (toValue(options.trigger ?? 'click') === 'click'));
  }

  /** 登记 non-modal 栈：仅参与 Esc 按栈与焦点恢复，不加锁/降焦/inert */
  function acquireLayer(): void {
    if (layer || !shouldRegister()) return;
    triggerElement =
      typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    layer = controller.openOverlay({
      modal: false,
      lockScroll: false,
      deemphasis: false,
      isolate: false,
      closeOnEscape: toValue(options.closeOnEscape ?? true),
      onRequestClose: () => options.onClose(),
    });
  }

  function releaseLayer(restoreFocus = true): void {
    if (!layer) return;
    layer.close();
    layer = null;
    if (
      restoreFocus &&
      triggerElement &&
      triggerElement.isConnected &&
      typeof triggerElement.focus === 'function'
    ) {
      triggerElement.focus();
    }
    triggerElement = null;
  }

  function scheduleShow(): void {
    clearHide();
    if (showTimer !== null) return;
    showTimer = setTimeout(() => {
      showTimer = null;
      if (!toValue(options.visible)) options.onOpen();
    }, toValue(options.showDelay) ?? 150);
  }

  function scheduleHide(): void {
    clearShow();
    if (hideTimer !== null) return;
    hideTimer = setTimeout(() => {
      hideTimer = null;
      if (toValue(options.visible)) options.onClose();
    }, toValue(options.hideDelay) ?? 200);
  }

  function isHover(): boolean {
    return toValue(options.trigger ?? 'click') === 'hover';
  }

  const onTriggerClick = (): void => {
    if (isHover()) return;
    if (toValue(options.visible)) options.onClose();
    else options.onOpen();
  };
  const onTriggerEnter = (): void => {
    if (isHover()) scheduleShow();
  };
  const onTriggerLeave = (): void => {
    if (isHover()) scheduleHide();
  };
  const onPanelEnter = (): void => {
    if (isHover()) clearHide();
  };
  const onPanelLeave = (): void => {
    if (isHover()) scheduleHide();
  };
  const onPanelClick = (event: MouseEvent): void => {
    event.stopPropagation();
  };

  // 外部点击关闭：仅可见时以 panel 为激活目标（target 为 null 时不监听），忽略触发器；
  // onClickOutside 内部处理 toggle 同帧开/关竞态。
  onClickOutside(
    () => (toValue(options.visible) ? options.panelRef.value : null),
    () => {
      if (toValue(options.visible) && toValue(options.closeOnClickOutside ?? true)) {
        options.onClose();
      }
    },
    {
      // onClickOutside 要求 ignore 为数组；单元素 triggerRef 必须包一层
      ignore: () => {
        const trigger = toValue(options.triggerRef);
        if (!trigger) return [];
        return Array.isArray(trigger) ? trigger : [trigger];
      },
    },
  );

  // 可见性同步 non-modal 栈：入栈后 Esc 由控制器按栈顶派发；出栈恢复焦点
  watch(
    () => toValue(options.visible),
    (val) => {
      if (val) {
        acquireLayer();
      } else {
        cancelHover();
        releaseLayer();
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    cancelHover();
    releaseLayer(false);
  });

  return {
    onTriggerClick,
    onTriggerEnter,
    onTriggerLeave,
    onPanelEnter,
    onPanelLeave,
    onPanelClick,
    cancelHover,
  };
}
