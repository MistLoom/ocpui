import { inject, computed, toValue, type ComputedRef } from 'vue';
import { UI_LOCALE_KEY } from '../types';
import { defaultLocales, resolveLocalePath, hasLocalePath, type UiLocaleMessages } from '../locale';

export type UiTParams = Record<string, string | number>;
/** 第二参：插值参数对象，或键缺失时使用的兜底文案字符串 */
export type UiTArg = UiTParams | string;

export interface UseUiTReturn {
  uiT: (key: string, paramsOrFallback?: UiTArg) => string;
  /** 判断键是否存在且可解析为文案 */
  te: (key: string) => boolean;
  locale: ComputedRef<UiLocaleMessages>;
}

function interpolate(
  template: string,
  params?: UiTParams,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    params[k] != null ? String(params[k]) : `{${k}}`,
  );
}

/**
 * 组件库文案解析。不依赖 vue-i18n。
 * 键路径相对于组件库 locale 根（如 dataEntry.select.clear）。
 * 第二参传对象时为插值参数；传字符串时为键缺失的兜底文案。
 */
export function useUiT(): UseUiTReturn {
  const injected = inject(UI_LOCALE_KEY, defaultLocales['zh-CN']);

  const locale = computed(() => toValue(injected) ?? defaultLocales['zh-CN']);

  const uiT = (key: string, arg?: UiTArg): string => {
    const fallback = typeof arg === 'string' ? arg : undefined;
    const params = arg && typeof arg === 'object' ? arg : undefined;
    const resolved = resolveLocalePath(locale.value, key);
    if (resolved) return interpolate(resolved, params);
    // 显式兜底文案优先；否则回退末段键名
    if (fallback !== undefined) return interpolate(fallback, params);
    const tail = key.split('.').pop() ?? key;
    return interpolate(tail, params);
  };

  const te = (key: string): boolean => hasLocalePath(locale.value, key);

  return { uiT, te, locale };
}
