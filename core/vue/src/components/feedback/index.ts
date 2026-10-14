export { default as Modal } from './Modal.vue';
export { default as Drawer } from './Drawer.vue';
export { default as Alert } from './Alert.vue';
export { default as Popover } from './Popover.vue';
export { default as Tooltip } from './Tooltip.vue';
export { default as FloatingHint } from './FloatingHint.vue';
export { default as Popconfirm } from './Popconfirm.vue';
export { default as MessageComponent } from './Message.vue';
export { default as Message } from './Message.vue';
export { default as Loading } from './Loading.vue';
export { default as Notification } from './Notification.vue';
export { default as Result } from './Result.vue';
export { default as Spin } from './Spin.vue';
export { default as LoadingBar } from './LoadingBar.vue';
export { default as Popselect } from './Popselect.vue';
export { default as PopupPanel } from './PopupPanel.vue';

export { default as LoadingOverlay } from './LoadingOverlay.vue';
export { default as ConfirmDialog } from './ConfirmDialog.vue';
export { default as StatusBlock } from './StatusBlock.vue';
export { default as ErrorStateBlock } from './ErrorStateBlock.vue';
export { default as ProcessProgress } from './ProcessProgress.vue';
export { default as AsyncContentShell } from './AsyncContentShell.vue';
export { default as LoadState } from './LoadState.vue';
export { default as RegionLoadingBar } from './RegionLoadingBar.vue';
export { resolveLoadStateVariant } from './resolve-load-state';
export type { LoadStateVariant } from './resolve-load-state';

// 滚动锁/W4 降焦/inert/焦点恢复统一经感知控制器 useOverlayLayer 收口；
// overlayScrollLock 为控制器内部底层，不再对上层导出（见 spec perception §10.4）。
