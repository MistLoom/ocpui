// @ocpSourceVersion @ocpui/vue@0.1.0
// Provide/Inject Symbol Keys
// 集中管理所有组件库的 provide/inject keys，避免使用字符串字面量

// Note: POPUP_PANEL_CLOSE_KEY and POPUP_PANEL_VISIBLE_KEY are defined in popupPanel.ts

// Theme
export const THEME_KEY = Symbol('theme');

// Config Provider
export const CONFIG_PROVIDER_KEY = Symbol('configProvider');

// Grid
export const GRID_CONTEXT_KEY = Symbol('gridContext');
export const GRID_ITEM_KEY = Symbol('gridItem');

// Collapse
export const COLLAPSE_ACTIVE_KEY = Symbol('collapseActiveKey');
export const COLLAPSE_ACCORDION_KEY = Symbol('collapseAccordion');
export const COLLAPSE_UPDATE_KEY = Symbol('collapseUpdateActiveKey');
export const COLLAPSE_IS_ACTIVE_KEY = Symbol('collapseIsActive');

// Tabs
export const TABS_ACTIVE_KEY = Symbol('tabsActiveKey');
export const TABS_REGISTRATION_KEY = Symbol('tabsRegistration');

// Form
export const FORM_CONTEXT_KEY = Symbol('formContext');
export const FORM_ITEM_CONTEXT_KEY = Symbol('formItemContext');

// 尺寸上下文（AdminPage toolbar / ConfigProvider 等）
export const SIZE_CONTEXT_KEY = Symbol('sizeContext');

// Tree
export const TREE_CONTEXT_KEY = Symbol('treeContext');
export const TREE_PROPS_KEY = Symbol('treeProps');

// List
export const LIST_CONTEXT_KEY = Symbol('listContext');

// Timeline
export const TIMELINE_CONTEXT_KEY = Symbol('timelineContext');

// MediaQuery
export const MEDIA_QUERY_KEY = Symbol('mediaQuery');

// Responsive Layout
export const RESPONSIVE_LAYOUT_KEY = Symbol('responsiveLayout');
