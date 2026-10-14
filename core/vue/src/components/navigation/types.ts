/**
 * Navigation 组件共享类型定义
 *
 * 从 Menu.vue 抽取，便于 navigation/index.ts 统一导出，
 * 规避 TypeScript 无法从 *.vue 重新导出 named type 的限制。
 */

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
  count?: number;
}

export interface BottomNavItem {
  key: string | number;
  label: string;
  icon?: string;
  badge?: string | number;
}

export interface MenuItem {
  key: string | number;
  label: string;
  icon?: string | object | Function;
  iconSvg?: string;
  badge?: string | number;
  disabled?: boolean;
  path?: string;
  permission?: string;
  children?: MenuItem[];
}
