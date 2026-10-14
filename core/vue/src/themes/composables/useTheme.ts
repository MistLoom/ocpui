/**
 * 主题状态 composable（包内真相源）
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { ThemeSettings, ColorMode, ThemeStyleId, ThemeInfo, ApplyThemeOptions } from '../index';
import {
  getCurrentThemeConfig,
  saveThemeConfig,
  applyTheme,
  getSystemTheme,
  setThemeStyle,
  toggleThemeStyle,
  AVAILABLE_THEMES,
} from '../index';

type ColorTheme = 'light' | 'dark';

const themeState = ref<ColorTheme>('light');
const themeStyleState = ref<ThemeStyleId>('editorial');
const colorModeState = ref<ColorMode>('light');
let isInitialized = false;

function initThemeState() {
  if (isInitialized || typeof window === 'undefined') return;
  const config = getCurrentThemeConfig();
  themeState.value = config.mode === 'system' ? getSystemTheme() : (config.mode as ColorTheme);
  themeStyleState.value = config.themeStyle;
  colorModeState.value = config.mode;
  isInitialized = true;
}

export function useTheme() {
  initThemeState();

  const setColorThemeMode = (newTheme: ColorTheme) => {
    if (typeof window === 'undefined') return false;

    const config = getCurrentThemeConfig();
    const newConfig: ThemeSettings = { ...config, mode: newTheme as ColorMode };

    if (saveThemeConfig(newConfig) && applyTheme(newConfig)) {
      themeState.value = newTheme;
      colorModeState.value = newTheme as ColorMode;
      return true;
    }
    return false;
  };

  const setTheme = setColorThemeMode;

  const toggleTheme = () => {
    const newTheme = themeState.value === 'light' ? 'dark' : 'light';
    return setColorThemeMode(newTheme);
  };

  const followSystem = () => {
    if (typeof window === 'undefined') return false;

    const config = getCurrentThemeConfig();
    const newConfig: ThemeSettings = { ...config, mode: 'system' };
    const newTheme = getSystemTheme();

    if (saveThemeConfig(newConfig) && applyTheme(newConfig)) {
      themeState.value = newTheme;
      colorModeState.value = 'system';
      return true;
    }
    return false;
  };

  const setThemeStyleMode = (style: ThemeStyleId): boolean => {
    if (setThemeStyle(style)) {
      themeStyleState.value = style;
      return true;
    }
    return false;
  };

  const toggleThemeStyleMode = (): ThemeStyleId | null => {
    const result = toggleThemeStyle();
    if (result) {
      themeStyleState.value = result;
    }
    return result;
  };

  const availableThemes = computed<ThemeInfo[]>(() => AVAILABLE_THEMES);
  const currentThemeInfo = computed<ThemeInfo>(() => {
    return AVAILABLE_THEMES.find((t) => t.id === themeStyleState.value) || AVAILABLE_THEMES[0];
  });

  const colorMode = computed<ColorMode>(() => colorModeState.value);

  const setColorMode = (mode: ColorMode, options?: ApplyThemeOptions): boolean => {
    if (typeof window === 'undefined') return false;

    const config = getCurrentThemeConfig();
    const newConfig: ThemeSettings = { ...config, mode };
    const effectiveMode = mode === 'system' ? getSystemTheme() : mode;

    if (saveThemeConfig(newConfig) && applyTheme(newConfig, undefined, options)) {
      themeState.value = effectiveMode;
      colorModeState.value = mode;
      return true;
    }
    return false;
  };

  const isDark = computed(() => themeState.value === 'dark');
  const isLight = computed(() => themeState.value === 'light');
  const isEditorial = computed(() => themeStyleState.value === 'editorial');
  const isTech = computed(() => themeStyleState.value === 'tech');

  let mediaQuery: MediaQueryList | null = null;
  let systemThemeHandler: ((e: MediaQueryListEvent) => void) | null = null;

  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    initThemeState();

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemThemeHandler = (e: MediaQueryListEvent) => {
      if (colorModeState.value === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        themeState.value = newTheme;
        applyTheme(getCurrentThemeConfig());
      }
    };
    mediaQuery.addEventListener('change', systemThemeHandler);
  });

  onUnmounted(() => {
    if (mediaQuery && systemThemeHandler) {
      mediaQuery.removeEventListener('change', systemThemeHandler);
      mediaQuery = null;
      systemThemeHandler = null;
    }
  });

  return {
    theme: themeState,
    themeStyle: themeStyleState,
    colorMode,
    setTheme,
    setColorThemeMode,
    setColorMode,
    toggleTheme,
    followSystem,
    setThemeStyle: setThemeStyleMode,
    toggleThemeStyle: toggleThemeStyleMode,
    availableThemes,
    currentThemeInfo,
    isDark,
    isLight,
    isEditorial,
    isTech,
  };
}

export type { ColorTheme, ThemeStyleId };
export type Theme = ColorTheme;
