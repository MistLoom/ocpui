import { inject, readonly, type DeepReadonly, ref, type Ref } from 'vue';
import { POPUP_PANEL_CLOSE_KEY, POPUP_PANEL_VISIBLE_KEY } from '../types/popupPanel';

/**
 * 在PopupPanel的子组件中使用，获取关闭面板的方法和可见状态
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePopupPanel } from '@ocpui/vue/composables/usePopupPanel';
 *
 * const { close, visible } = usePopupPanel();
 *
 * const handleClick = () => {
 *   // 执行操作
 *   doSomething();
 *   // 关闭面板
 *   close();
 * };
 * </script>
 *
 * <template>
 *   <div @click="handleClick">点击关闭面板</div>
 * </template>
 * ```
 */
export function usePopupPanel() {
  const close = inject<(value?: boolean) => void>(POPUP_PANEL_CLOSE_KEY, () => {
    console.warn('[usePopupPanel] close function not found, make sure component is inside PopupPanel');
  });

  const visible = inject<DeepReadonly<Ref<boolean>>>(POPUP_PANEL_VISIBLE_KEY, readonly(ref(false)));

  return {
    close,
    visible,
  };
}

// 辅助函数：用于在模板中直接关闭面板
export function useClosePopup() {
  const close = inject<(value?: boolean) => void>(POPUP_PANEL_CLOSE_KEY, () => {
    console.warn('[useClosePopup] close function not found, make sure component is inside PopupPanel');
  });

  return close;
}

// 辅助函数：用于在模板中直接获取面板可见状态
export function usePopupVisible() {
  const visible = inject<DeepReadonly<Ref<boolean>>>(POPUP_PANEL_VISIBLE_KEY, readonly(ref(false)));

  return visible;
}
