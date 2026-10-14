/**
 * View Transitions API 主题切换
 */
import { ref, computed } from 'vue';
import type { ColorMode } from '../index';
import { getSystemTheme } from '../index';
import { useTheme } from './useTheme';

const isTransitioning = ref(false);

const isViewTransitionsSupported =
  typeof document !== 'undefined' && 'startViewTransition' in document;

type StartViewTransitionFn = (updateCallback: () => void) => {
  finished: Promise<void>;
};

const getEffectiveMode = (mode: ColorMode): 'light' | 'dark' =>
  mode === 'system' ? getSystemTheme() : mode;

const setTransitionPosition = (x: number, y: number): void => {
  document.documentElement.style.setProperty('--transition-x', `${x}px`);
  document.documentElement.style.setProperty('--transition-y', `${y}px`);
};

const clearTransitionPosition = (): void => {
  document.documentElement.style.removeProperty('--transition-x');
  document.documentElement.style.removeProperty('--transition-y');
};

export function useThemeTransition() {
  const { colorMode, setColorMode, isDark } = useTheme();

  const setModeWithTransition = async (
    mode: ColorMode,
    clickEvent?: MouseEvent,
  ): Promise<boolean> => {
    if (typeof window === 'undefined' || isTransitioning.value) return false;

    const currentEffectiveMode = getEffectiveMode(colorMode.value);
    const newEffectiveMode = getEffectiveMode(mode);

    if (currentEffectiveMode === newEffectiveMode) {
      return setColorMode(mode);
    }

    if (!isViewTransitionsSupported) {
      return setColorMode(mode);
    }

    isTransitioning.value = true;

    try {
      const clientX = clickEvent?.clientX ?? window.innerWidth / 2;
      const clientY = clickEvent?.clientY ?? window.innerHeight / 2;
      setTransitionPosition(clientX, clientY);

      const startTransition = (document as unknown as { startViewTransition?: StartViewTransitionFn })
        .startViewTransition;
      if (!startTransition) {
        clearTransitionPosition();
        return setColorMode(mode);
      }

      const transition = startTransition.call(document, () => {
        setColorMode(mode, { sync: true });
      });

      await transition.finished;

      clearTransitionPosition();
      return true;
    } catch (error) {
      console.error('Theme transition failed:', error);
      clearTransitionPosition();
      return setColorMode(mode);
    } finally {
      isTransitioning.value = false;
    }
  };

  const toggleModeWithTransition = async (clickEvent?: MouseEvent): Promise<boolean> => {
    const newMode: ColorMode = isDark.value ? 'light' : 'dark';
    return setModeWithTransition(newMode, clickEvent);
  };

  const setModeInstant = (mode: ColorMode): boolean => {
    if (typeof window === 'undefined') return false;
    return setColorMode(mode);
  };

  return {
    isTransitioning: computed(() => isTransitioning.value),
    currentMode: colorMode,
    isDark,
    setModeWithTransition,
    toggleModeWithTransition,
    setModeInstant,
    isViewTransitionsSupported,
  };
}

export type { ColorMode };
