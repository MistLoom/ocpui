/**
 * 主题系统配置 - 多主题支持版
 * 内置 tech / editorial；消费方可 registerThemeStyle 注册外部主题（CSS 由消费方提供）
 * 每套主题支持 light/dark/system 颜色模式
 */

export type ColorMode = 'light' | 'dark' | 'system';
/** 主题风格 ID：内置 tech/editorial，或经 registerThemeStyle 注册的消费方 ID */
export type ThemeStyleId = string;
export type BuiltinThemeStyleId = 'tech' | 'editorial';
export type ThemeName = 'default' | 'blue' | 'purple' | 'green' | 'orange' | 'custom';

export interface ThemeSettings {
  mode: ColorMode;
  theme: ThemeName;
  themeStyle: ThemeStyleId;
  followSystem: boolean;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  density: 'compact' | 'comfortable' | 'spacious';
}

export type ThemeConfig = ThemeSettings;

export interface ThemePreview {
  /** 主色预览 */
  primary: string;
  /** 背景色预览 */
  background: string;
  /** 表面色预览 */
  surface: string;
  /** 文字色预览 */
  text: string;
}

export interface ThemeInfo {
  id: ThemeStyleId;
  /** 主题显示名称（兜底文案） */
  name: string;
  /** 主题显示名称的 i18n key（优先） */
  nameKey?: string;
  className: string;
  /** 主题描述（兜底文案） */
  description?: string;
  /** 主题描述的 i18n key（优先） */
  descriptionKey?: string;
  /** 主题图标 SVG 字符串或 Icon name */
  icon?: string;
  /** 主题气质预览色板 */
  preview?: ThemePreview;
}

export interface CustomThemeConfig {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  bg?: string;
  bgElevated?: string;
  card?: string;
  text?: string;
  textMuted?: string;
  border?: string;
  shadow?: string;
}

const BUILTIN_THEMES: ThemeInfo[] = [
  {
    id: 'tech',
    name: '科技',
    nameKey: 'theme.tech.name',
    className: 'theme-tech',
    description: '现代科技风格，精准线条与微妙动效',
    descriptionKey: 'theme.tech.description',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
    preview: {
      primary: 'hsl(220 90% 56%)',
      background: 'hsl(220 20% 99%)',
      surface: 'hsl(0 0% 100%)',
      text: 'hsl(220 30% 10%)',
    },
  },
  {
    id: 'editorial',
    name: '编辑感',
    nameKey: 'theme.editorial.name',
    className: 'theme-editorial',
    description: '轻负担简约配色、柔和圆角与 micro 动效，内容优先',
    descriptionKey: 'theme.editorial.description',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path></svg>',
    preview: {
      primary: 'hsl(195 48% 46%)',
      background: 'hsl(210 12% 98%)',
      surface: 'hsl(0 0% 100%)',
      text: 'hsl(210 18% 14%)',
    },
  },
];

/** 可变注册表：内置主题 + 消费方 registerThemeStyle */
export const AVAILABLE_THEMES: ThemeInfo[] = [...BUILTIN_THEMES];

export const DEFAULT_THEME_STYLE: ThemeStyleId = 'editorial';

export const CURRENT_THEME: ThemeInfo = AVAILABLE_THEMES.find(t => t.id === DEFAULT_THEME_STYLE) || AVAILABLE_THEMES[0];

const BUILTIN_THEME_IDS = new Set<string>(BUILTIN_THEMES.map((t) => t.id));

/**
 * 注册/覆盖外部主题风格。CSS（`.theme-{id}`）须由消费方自行引入。
 * 同 id 再次调用视为替换元数据。
 */
export function registerThemeStyle(info: ThemeInfo): void {
  if (!info?.id?.trim()) {
    throw new Error('registerThemeStyle: id 必填');
  }
  if (!info.className?.trim()) {
    throw new Error(`registerThemeStyle: className 必填（id=${info.id}）`);
  }
  const idx = AVAILABLE_THEMES.findIndex((t) => t.id === info.id);
  if (idx >= 0) {
    AVAILABLE_THEMES[idx] = info;
  } else {
    AVAILABLE_THEMES.push(info);
  }
}

/** 移除已注册的外部主题；内置 tech/editorial 不可移除 */
export function unregisterThemeStyle(id: ThemeStyleId): boolean {
  if (BUILTIN_THEME_IDS.has(id)) return false;
  const idx = AVAILABLE_THEMES.findIndex((t) => t.id === id);
  if (idx < 0) return false;
  AVAILABLE_THEMES.splice(idx, 1);
  return true;
}

export const THEME_STORAGE_KEY = 'theme-config';

/** 应用可覆盖默认 localStorage key（须与 UiRoot storage-key 一致） */
let resolvedThemeStorageKey = THEME_STORAGE_KEY;

export function configureThemeStorageKey(key: string): void {
  resolvedThemeStorageKey = key;
  cachedThemeConfig = null;
}

export function getResolvedThemeStorageKey(): string {
  return resolvedThemeStorageKey;
}

function themeStorageKey(explicit?: string): string {
  return explicit ?? resolvedThemeStorageKey;
}

function isPrimaryThemeStorageKey(key: string): boolean {
  return key === resolvedThemeStorageKey;
}

export const themeColors: Record<ThemeName, { primary: string; primaryLight: string; primaryDark: string }> = {
  default: { primary: '195 48% 46%', primaryLight: '195 35% 94%', primaryDark: '195 48% 40%' },
  blue: { primary: '217 91% 60%', primaryLight: '217 91% 96%', primaryDark: '217 91% 40%' },
  purple: { primary: '270 60% 55%', primaryLight: '270 60% 96%', primaryDark: '270 60% 40%' },
  green: { primary: '142 76% 36%', primaryLight: '142 76% 96%', primaryDark: '142 76% 28%' },
  orange: { primary: '24 95% 53%', primaryLight: '24 95% 96%', primaryDark: '24 95% 40%' },
  custom: { primary: '195 48% 46%', primaryLight: '195 35% 94%', primaryDark: '195 48% 40%' },
};

export const defaultThemeSettings: ThemeSettings = {
  mode: 'light',
  theme: 'default',
  themeStyle: DEFAULT_THEME_STYLE,
  followSystem: true,
  radius: 'lg',
  density: 'comfortable',
};

export const defaultThemeConfig = defaultThemeSettings;

let isThemeInitialized = false;
let currentEffectiveMode: 'light' | 'dark' | null = null;
let currentThemeStyle: ThemeStyleId | null = null;
let cachedThemeConfig: ThemeSettings | null = null;

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function getThemeInfo(themeId: ThemeStyleId): ThemeInfo | undefined {
  return AVAILABLE_THEMES.find(t => t.id === themeId);
}

export function getCurrentThemeConfig(storageKey?: string): ThemeSettings {
  const key = themeStorageKey(storageKey);
  if (typeof window === 'undefined') return defaultThemeSettings;

  if (isPrimaryThemeStorageKey(key) && cachedThemeConfig) {
    return cachedThemeConfig;
  }

  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      const config: ThemeSettings = {
        ...defaultThemeSettings,
        ...parsed,
      };
      if (!AVAILABLE_THEMES.find(t => t.id === config.themeStyle)) {
        config.themeStyle = DEFAULT_THEME_STYLE;
      }
      if (isPrimaryThemeStorageKey(key)) {
        cachedThemeConfig = config;
      }
      return config;
    }
  } catch (e) {
    console.warn('Failed to load theme config:', e);
  }

  if (isPrimaryThemeStorageKey(key)) {
    cachedThemeConfig = defaultThemeSettings;
  }
  return defaultThemeSettings;
}

export function saveThemeConfig(config: ThemeSettings, storageKey?: string): boolean {
  const key = themeStorageKey(storageKey);
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(key, JSON.stringify(config));
    if (isPrimaryThemeStorageKey(key)) {
      cachedThemeConfig = config;
    }
    return true;
  } catch (e) {
    console.warn('Failed to save theme config:', e);
    return false;
  }
}

function removeAllThemeClasses(root: HTMLElement) {
  AVAILABLE_THEMES.forEach(theme => {
    root.classList.remove(theme.className);
    if (document.body) {
      document.body.classList.remove(theme.className);
    }
  });
}

/**
 * 同步执行主题 DOM 更新：class、dark 标记、CSS 变量、data 属性
 * 供 applyTheme 的同步路径与异步 rAF 路径复用，避免逻辑分叉
 */
function applyThemeDOM(
  root: HTMLElement,
  config: ThemeSettings,
  targetTheme: ThemeInfo,
  effectiveMode: 'light' | 'dark',
  customTheme?: CustomThemeConfig,
): void {
  const isDark = effectiveMode === 'dark';

  removeAllThemeClasses(root);
  root.classList.add(targetTheme.className);
  if (document.body) {
    document.body.classList.add(targetTheme.className);
  }

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  if (config.theme === 'custom' && customTheme) {
    root.style.setProperty('--primary', customTheme.primary);
    root.style.setProperty('--primary-light', customTheme.primaryLight);
    root.style.setProperty('--primary-dark', customTheme.primaryDark);

    if (customTheme.bg) root.style.setProperty('--background', customTheme.bg);
    if (customTheme.bgElevated) root.style.setProperty('--background-elevated', customTheme.bgElevated);
    if (customTheme.card) root.style.setProperty('--surface', customTheme.card);
    if (customTheme.text) root.style.setProperty('--text', customTheme.text);
    if (customTheme.textMuted) root.style.setProperty('--text-secondary', customTheme.textMuted);
    if (customTheme.border) root.style.setProperty('--border', customTheme.border);
    if (customTheme.shadow) root.style.setProperty('--shadow', customTheme.shadow);
  }

  const radiusMap: Record<string, string> = {
    none: '0px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    full: '9999px',
  };
  root.style.setProperty('--radius-md', radiusMap[config.radius] || '10px');

  const densityMap: Record<string, { spacing: string; fontSize: string }> = {
    compact: { spacing: '0.5rem', fontSize: '0.875rem' },
    comfortable: { spacing: '1rem', fontSize: '1rem' },
    spacious: { spacing: '1.5rem', fontSize: '1.125rem' },
  };
  const density = densityMap[config.density] || densityMap.comfortable;
  root.style.setProperty('--space-4', density.spacing);
  root.style.setProperty('--font-size-base', density.fontSize);

  root.setAttribute('data-theme', effectiveMode);
  root.setAttribute('data-theme-style', config.themeStyle);
  root.style.colorScheme = effectiveMode;
}

export interface ApplyThemeOptions {
  /** 同步更新 DOM，但仍保留 theme-switching 防抖以禁用全局 transition。
   *  用于 startViewTransition 回调内：真实 DOM 即时变化让快照层捕获差异，
   *  同时 theme-switching 阻止带 transition 的元素各自渐变，避免 reduced-motion 下的颜色闪烁。 */
  sync?: boolean;
}

export function applyTheme(
  config: ThemeSettings,
  customTheme?: CustomThemeConfig,
  options?: ApplyThemeOptions,
): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const root = document.documentElement;
    const effectiveMode = config.mode === 'system' ? getSystemTheme() : config.mode as 'light' | 'dark';
    const targetTheme = getThemeInfo(config.themeStyle) || CURRENT_THEME;

    if (isThemeInitialized && currentEffectiveMode === effectiveMode && currentThemeStyle === config.themeStyle) {
      return true;
    }

    // finalize 必须在 DOM 实际更新之后调用，避免异步路径下 rAF 前状态被误判为已应用，
    // 也保证 applyThemeDOM 抛异常时 currentEffectiveMode 不被污染（后续调用能正确重试）
    const finalize = () => {
      currentEffectiveMode = effectiveMode;
      currentThemeStyle = config.themeStyle;
      isThemeInitialized = true;
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { mode: effectiveMode, themeStyle: config.themeStyle, config }
      }));
    };

    if (options?.sync) {
      // 同步路径：theme-switching 禁用真实 DOM transition，由 View Transition 快照层接管视觉过渡；
      // rAF 双帧后移除，保证下一帧渲染时 class 仍生效
      root.classList.add('theme-switching');
      applyThemeDOM(root, config, targetTheme, effectiveMode, customTheme);
      finalize();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.remove('theme-switching');
        });
      });
    } else {
      // 异步路径：rAF 双帧更新 + theme-switching 禁用过渡，避免主题切换瞬间的中间态闪烁
      root.classList.add('theme-switching');
      requestAnimationFrame(() => {
        applyThemeDOM(root, config, targetTheme, effectiveMode, customTheme);
        finalize();
        requestAnimationFrame(() => {
          root.classList.remove('theme-switching');
        });
      });
    }

    return true;
  } catch (e) {
    console.error('Failed to apply theme:', e);
    return false;
  }
}

export function setThemeStyle(themeStyle: ThemeStyleId): boolean {
  try {
    const config = getCurrentThemeConfig();
    const newConfig = { ...config, themeStyle };
    return saveThemeConfig(newConfig) && applyTheme(newConfig);
  } catch (e) {
    console.error('Failed to set theme style:', e);
    return false;
  }
}

export function toggleColorMode(): ColorMode | null {
  try {
    const config = getCurrentThemeConfig();
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(config.mode);
    const newMode = modes[(currentIndex + 1) % modes.length];

    const newConfig = { ...config, mode: newMode };
    if (saveThemeConfig(newConfig) && applyTheme(newConfig)) {
      return newMode;
    }
    return null;
  } catch (e) {
    console.error('Failed to toggle color mode:', e);
    return null;
  }
}

export function setColorMode(mode: ColorMode): boolean {
  try {
    const config = getCurrentThemeConfig();
    const newConfig = { ...config, mode };
    return saveThemeConfig(newConfig) && applyTheme(newConfig);
  } catch (e) {
    console.error('Failed to set color mode:', e);
    return false;
  }
}

export function getThemeConfig(): ThemeInfo {
  const config = getCurrentThemeConfig();
  return getThemeInfo(config.themeStyle) || CURRENT_THEME;
}

export function getCurrentThemeId(): 'light' | 'dark' {
  const config = getCurrentThemeConfig();
  return config.mode === 'system' ? getSystemTheme() : config.mode as 'light' | 'dark';
}

export function getCurrentThemeStyle(): ThemeStyleId {
  const config = getCurrentThemeConfig();
  return config.themeStyle;
}

export function applyColorMode(mode: 'light' | 'dark' | 'system') {
  const config = getCurrentThemeConfig();
  const newConfig = { ...config, mode };
  saveThemeConfig(newConfig);
  applyTheme(newConfig);
}

export function applyThemeLegacy(mode?: 'light' | 'dark') {
  const config = getCurrentThemeConfig();
  const newMode = mode || getCurrentThemeId();
  const newConfig = { ...config, mode: newMode };
  saveThemeConfig(newConfig);
  applyTheme(newConfig);
}

export function toggleThemeStyle(): ThemeStyleId | null {
  try {
    const config = getCurrentThemeConfig();
    const currentIndex = AVAILABLE_THEMES.findIndex(t => t.id === config.themeStyle);
    const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
    const nextTheme = AVAILABLE_THEMES[nextIndex];
    if (setThemeStyle(nextTheme.id)) {
      return nextTheme.id;
    }
    return null;
  } catch (e) {
    console.error('Failed to toggle theme style:', e);
    return null;
  }
}

export * from './composables';
