import zhCN from './zh-CN';
import zhTW from './zh-TW';
import en from './en';

export type UiLocaleMessages = Record<string, unknown>;

export const defaultLocales: Record<string, UiLocaleMessages> = {
  'zh-CN': zhCN as UiLocaleMessages,
  'zh-TW': zhTW as UiLocaleMessages,
  en: en as UiLocaleMessages,
};

/** 深度合并 locale（消费方覆盖包默认文案） */
export function mergeUiLocale(
  base: UiLocaleMessages,
  override?: UiLocaleMessages,
): UiLocaleMessages {
  if (!override) return base;
  const out: UiLocaleMessages = { ...base };
  for (const key of Object.keys(override)) {
    const bv = base[key];
    const ov = override[key];
    if (
      bv &&
      ov &&
      typeof bv === 'object' &&
      typeof ov === 'object' &&
      !Array.isArray(bv) &&
      !Array.isArray(ov)
    ) {
      out[key] = mergeUiLocale(bv as UiLocaleMessages, ov as UiLocaleMessages);
    } else {
      out[key] = ov;
    }
  }
  return out;
}

/** 按点路径取值；组件内键以 components. 开头，locale 文件不含该前缀 */
function walkLocalePath(messages: UiLocaleMessages, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function resolveLocalePath(
  messages: UiLocaleMessages,
  path: string,
): string | undefined {
  const direct = walkLocalePath(messages, path);
  if (direct) return direct;
  if (path.startsWith('components.')) {
    return walkLocalePath(messages, path.slice('components.'.length));
  }
  return undefined;
}

/** 判断键路径是否能解析为文案字符串 */
export function hasLocalePath(messages: UiLocaleMessages, path: string): boolean {
  return resolveLocalePath(messages, path) !== undefined;
}
