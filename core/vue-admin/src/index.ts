export { default as AdminPage } from './components/layout/AdminPage.vue';
export { default as AdminWorkList } from './components/layout/AdminWorkList.vue';
export { default as AdminFilterToolbar } from './components/layout/AdminFilterToolbar.vue';
export { default as SizeScope } from './components/layout/SizeScope.vue';
export { default as LayoutSider } from './components/layout/LayoutSider.vue';
export { default as DataTable } from './components/data-display/DataTable.vue';
export { default as AdminAppShell } from './components/shell/AdminAppShell.vue';
export { default as AdminSidebar } from './components/shell/AdminSidebar.vue';
export { default as AdminBrand } from './components/shell/AdminBrand.vue';
export { default as AdminNavGroup } from './components/shell/AdminNavGroup.vue';
export { default as AdminNavItem } from './components/shell/AdminNavItem.vue';
export { default as AdminRuntimeCard } from './components/shell/AdminRuntimeCard.vue';
export { default as AdminProfileTrigger } from './components/shell/AdminProfileTrigger.vue';
export { default as AdminTopbar } from './components/shell/AdminTopbar.vue';
export { default as AdminAccountPanel } from './components/shell/AdminAccountPanel.vue';
export { default as AdminAccountAction } from './components/shell/AdminAccountAction.vue';
export { default as AdminNotificationPanel } from './components/shell/AdminNotificationPanel.vue';
export { default as AdminNotificationItem } from './components/shell/AdminNotificationItem.vue';
export { default as AdminTaskList } from './components/data-display/AdminTaskList.vue';
export { default as AdminTaskItem } from './components/data-display/AdminTaskItem.vue';
export { default as AdminCompactList } from './components/data-display/AdminCompactList.vue';
export { default as AdminCompactItem } from './components/data-display/AdminCompactItem.vue';
export { default as AdminStatusStrip } from './components/data-display/AdminStatusStrip.vue';
export { default as AdminStatusCell } from './components/data-display/AdminStatusCell.vue';
export { default as AdminHealthList } from './components/data-display/AdminHealthList.vue';
export { default as AdminHealthItem } from './components/data-display/AdminHealthItem.vue';
export { default as AdminSectionNote } from './components/data-display/AdminSectionNote.vue';
export { default as AdminTreeList } from './components/data-display/AdminTreeList.vue';
export { default as AdminTreeRow } from './components/data-display/AdminTreeRow.vue';
export { default as AdminRowActionTip } from './components/data-display/AdminRowActionTip.vue';
export * from './components/business';
export type {
  UiDataState,
  UiDataStateCore,
  UiInteractionState,
} from './types/ui-data-state';
export {
  UI_DATA_STATES,
  isUiDataState,
  adminWorkListFlagsFromState,
} from './types/ui-data-state';
export { useUiRegionState } from './composables/useUiRegionState';
export type {
  UseUiRegionStateOptions,
  UiRegionStateResult,
} from './composables/useUiRegionState';
export * from './patterns';
