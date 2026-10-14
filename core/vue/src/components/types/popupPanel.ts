// PopupPanel 的 provide/inject keys
// 单独放在 types 目录中，避免在 .vue 文件的 <script setup> 中导出

export const POPUP_PANEL_CLOSE_KEY = Symbol('popupPanelClose');
export const POPUP_PANEL_VISIBLE_KEY = Symbol('popupPanelVisible');
