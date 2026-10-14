/**
 * 图标名称解析
 * 菜单/配置存 Lucide PascalCase（LayoutDashboard）或 kebab-case（file-text），
 * 统一归一化后在 lucide-vue-next 中查找组件（含官方别名如 FileEdit、FormInput）。
 * 旧项目遗留名走 ICON_NAME_ALIASES，禁止在组件内再堆 SVG 字典。
 */
import type { Component } from 'vue';
import * as Lucide from 'lucide-vue-next';

const lucideExports = Lucide as unknown as Record<string, unknown>;

const NON_ICON_EXPORTS = new Set([
  'createLucideIcon',
  'icons',
  'default',
]);

/** 业务/旧项目别名 → Lucide kebab 名 */
export const ICON_NAME_ALIASES: Record<string, string> = {
  delete: 'trash-2',
  close: 'x',
  error: 'circle-x',
  success: 'circle-check',
  loading: 'loader-2',
  edit: 'pencil',
  'edit-2': 'pencil',
  'menu-fold': 'panel-left-close',
  'menu-unfold': 'panel-left-open',
  'star-filled': 'star',
  'star-half': 'star-half',
  'heart-filled': 'heart',
  fullscreen: 'maximize',
  'fullscreen-exit': 'minimize',
  'more-vertical': 'ellipsis-vertical',
  'more-horizontal': 'ellipsis',
  message: 'message-square',
  announcement: 'megaphone',
  'user-activity': 'user-check',
  'error-circle': 'circle-alert',
  'file-excel': 'file-spreadsheet',
  'file-pdf': 'file-text',
  stop: 'square',
  chat: 'message-square',
  data: 'database',
  workflow: 'git-branch',
  system: 'settings',
  model: 'box',
  agent: 'bot',
  channel: 'activity',
  permission: 'shield-check',
  skill: 'star',
  scheduler: 'clock',
  workspace: 'layout-grid',
  log: 'clipboard-list',
  app: 'app-window',
  'app-store': 'layout-grid',
  layout: 'layout-dashboard',
  dashboard: 'layout-dashboard',
  sort: 'list-filter',
  export: 'download',
  'alert-triangle': 'triangle-alert',
  'alert-circle': 'circle-alert',
  'help-circle': 'circle-help',
  'check-circle': 'circle-check',
  'x-circle': 'circle-x',
  'check-square': 'square-check',
  'pause-circle': 'circle-pause',
  refresh: 'refresh-cw',
  'bar-chart': 'chart-column',
  grid: 'layout-grid',
  audio: 'music',
  'upload-cloud': 'cloud-upload',
  claw: 'paw-print',
  dot: 'circle',
};

/** 需实心绘制的名称（归一化后） */
export const FILLED_ICON_NAMES = new Set([
  'star-filled',
  'star-half',
  'heart-filled',
  'dot',
]);

function stripLucideAffixes(name: string): string {
  return name.replace(/^Lucide/, '').replace(/Icon$/, '');
}

/** PascalCase / kebab-case / snake_case → kebab-case */
export function toKebabIconName(name: string): string {
  const stripped = stripLucideAffixes(name.trim());
  if (!stripped) return '';
  return stripped
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .replace(/(\d)([A-Za-z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

/** kebab-case / PascalCase / LucideXxxIcon → PascalCase */
export function toPascalIconName(name: string): string {
  const stripped = stripLucideAffixes(name.trim());
  if (!stripped) return '';
  if (!/[-_\s]/.test(stripped) && /[A-Z]/.test(stripped)) {
    return stripped;
  }
  return stripped
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

function isVueComponent(value: unknown): value is Component {
  return typeof value === 'function' || (typeof value === 'object' && value !== null);
}

function lookupLucide(name: string): Component | null {
  const pascal = toPascalIconName(name);
  if (!pascal) return null;

  const candidates = [pascal, `${pascal}Icon`, `Lucide${pascal}`];
  for (const key of candidates) {
    if (NON_ICON_EXPORTS.has(key)) continue;
    const mod = lucideExports[key];
    if (isVueComponent(mod)) return mod;
  }
  return null;
}

export function isFilledIconName(name: string): boolean {
  return FILLED_ICON_NAMES.has(toKebabIconName(name));
}

/**
 * 解析 Lucide 组件：先按原名查找，未命中再走业务别名。
 */
export function resolveLucideIcon(name: string): Component | null {
  if (!name.trim()) return null;
  const kebab = toKebabIconName(name);
  const direct = lookupLucide(kebab) ?? lookupLucide(name);
  if (direct) return direct;
  const alias = ICON_NAME_ALIASES[kebab];
  if (alias) return lookupLucide(alias);
  return null;
}
