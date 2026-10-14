import type { Breakpoint } from './useBreakpoint';

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
}

const BREAKPOINT_ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
const BREAKPOINT_KEYS = new Set<string>(BREAKPOINT_ORDER);

/** 判断是否为断点响应式对象 */
export function isResponsiveValue<T>(value: T | ResponsiveValue<T>): value is ResponsiveValue<T> {
  if (typeof value !== 'object' || value === null) return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return true;
  return keys.every((key) => BREAKPOINT_KEYS.has(key));
}

/**
 * 按 mobile-first 级联解析响应式值：当前断点 → 更小断点（xs → sm → … → 当前）
 */
export function resolveResponsiveValue<T>(
  value: T | ResponsiveValue<T>,
  currentBp: string,
): T {
  if (!isResponsiveValue(value)) {
    return value as T;
  }

  const bpIndex = BREAKPOINT_ORDER.indexOf(currentBp as Breakpoint);
  const start = bpIndex >= 0 ? bpIndex : 0;

  for (let i = start; i >= 0; i--) {
    const key = BREAKPOINT_ORDER[i];
    const resolved = value[key];
    if (resolved !== undefined) {
      return resolved;
    }
  }

  for (let i = start + 1; i < BREAKPOINT_ORDER.length; i++) {
    const key = BREAKPOINT_ORDER[i];
    const resolved = value[key];
    if (resolved !== undefined) {
      return resolved;
    }
  }

  return undefined as T;
}
