import { computed, type MaybeRef, type ComputedRef } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface UseThemeClassOptions {
  baseClass?: string;
  mode?: MaybeRef<ThemeMode>;
}

export interface UseThemeClassReturn {
  themeClass: ComputedRef<string>;
  isDarkMode: ComputedRef<boolean>;
  isLightMode: ComputedRef<boolean>;
  themeMode: ComputedRef<ThemeMode>;
}

export function useThemeClass(options: UseThemeClassOptions = {}): UseThemeClassReturn {
  const { baseClass = '', mode = 'auto' } = options;

  const currentMode = computed(() => {
    return typeof mode === 'string' ? mode : mode.value;
  });

  const isDarkMode = computed(() => {
    if (currentMode.value === 'dark') return true;
    if (currentMode.value === 'light') return false;
    return window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
  });

  const isLightMode = computed(() => !isDarkMode.value);

  const themeClass = computed(() => {
    const classes: string[] = [];
    if (baseClass) classes.push(baseClass);
    if (isDarkMode.value) classes.push('dark');
    return classes.join(' ');
  });

  return {
    themeClass,
    isDarkMode,
    isLightMode,
    themeMode: currentMode,
  };
}
