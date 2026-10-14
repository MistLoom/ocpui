import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import type { DocReadingPrefs } from '@ocpui/markdown-core';

export const DOC_READING_PREFS_KEY = 'ocp-doc-prefs';

export type DocFontSizePreset = 'sm' | 'md' | 'lg';
export type DocLeadingPreset = 'compact' | 'normal' | 'relaxed';

export interface DocReadingPrefsState {
  fontSize: DocFontSizePreset;
  measure: number;
  leading: DocLeadingPreset;
}

export const DOC_READING_DEFAULTS: DocReadingPrefsState = {
  fontSize: 'md',
  measure: 72,
  leading: 'normal',
};

const FONT_SIZE_MAP: Record<DocFontSizePreset, string> = {
  sm: '0.9375rem',
  md: '1rem',
  lg: '1.125rem',
};

const LEADING_MAP: Record<DocLeadingPreset, string> = {
  compact: '1.6',
  normal: '1.75',
  relaxed: '1.9',
};

function loadPrefs(): DocReadingPrefsState {
  if (typeof localStorage === 'undefined') {
    return { ...DOC_READING_DEFAULTS };
  }
  try {
    const raw = localStorage.getItem(DOC_READING_PREFS_KEY);
    if (!raw) {
      return { ...DOC_READING_DEFAULTS };
    }
    const parsed = JSON.parse(raw) as Partial<DocReadingPrefsState>;
    return {
      fontSize: parsed.fontSize ?? DOC_READING_DEFAULTS.fontSize,
      measure: clampMeasure(parsed.measure ?? DOC_READING_DEFAULTS.measure),
      leading: parsed.leading ?? DOC_READING_DEFAULTS.leading,
    };
  } catch {
    return { ...DOC_READING_DEFAULTS };
  }
}

function savePrefs(prefs: DocReadingPrefsState): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(DOC_READING_PREFS_KEY, JSON.stringify(prefs));
}

function clampMeasure(value: number): number {
  return Math.min(88, Math.max(60, Math.round(value)));
}

export function docReadingPrefsToCssVars(prefs: DocReadingPrefsState): Record<string, string> {
  return {
    '--doc-measure': `${clampMeasure(prefs.measure)}ch`,
    '--doc-font-size': FONT_SIZE_MAP[prefs.fontSize],
    '--doc-leading': LEADING_MAP[prefs.leading],
  };
}

export function toDocReadingPrefsPayload(prefs: DocReadingPrefsState): DocReadingPrefs {
  return {
    measure: `${clampMeasure(prefs.measure)}ch`,
    fontSize: FONT_SIZE_MAP[prefs.fontSize],
    leading: LEADING_MAP[prefs.leading],
  };
}

export interface UseDocReadingPrefsReturn {
  prefs: Ref<DocReadingPrefsState>;
  cssVars: ComputedRef<Record<string, string>>;
  reset: () => void;
}

const sharedPrefs = ref<DocReadingPrefsState>(loadPrefs());
let persistInitialized = false;

function ensurePersistWatch() {
  if (persistInitialized) {
    return;
  }
  persistInitialized = true;

  watch(
    sharedPrefs,
    (value) => {
      savePrefs(value);
    },
    { deep: true },
  );

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== DOC_READING_PREFS_KEY) {
        return;
      }
      sharedPrefs.value = loadPrefs();
    });
  }
}

/** 测试专用：重置共享偏好状态 */
export function resetDocReadingPrefsForTests(): void {
  sharedPrefs.value = { ...DOC_READING_DEFAULTS };
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(DOC_READING_PREFS_KEY);
  }
}

export function useDocReadingPrefs(): UseDocReadingPrefsReturn {
  ensurePersistWatch();

  const cssVars = computed(() => docReadingPrefsToCssVars(sharedPrefs.value));

  function reset() {
    sharedPrefs.value = { ...DOC_READING_DEFAULTS };
  }

  return { prefs: sharedPrefs, cssVars, reset };
}
