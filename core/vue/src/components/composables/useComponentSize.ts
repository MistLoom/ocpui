import { computed, inject, unref, type ComputedRef, type Ref } from 'vue';
import type { ComponentSize } from '../types/common';
import { FORM_CONTEXT_KEY, FORM_ITEM_CONTEXT_KEY, SIZE_CONTEXT_KEY } from '../types/keys';

export const SIZE_HEIGHT_PX: Record<ComponentSize, number> = {
  sm: 32,
  md: 36,
  lg: 40,
};

interface SizeBearer {
  size?: ComponentSize | string;
}

function readSize(bearer: SizeBearer | ComputedRef<SizeBearer> | null | undefined): ComponentSize | undefined {
  if (!bearer) return undefined;
  const value = unref(bearer);
  const raw = value?.size;
  if (!raw) return undefined;
  if (raw === 'xs') return 'sm';
  if (raw === 'small') return 'sm';
  if (raw === 'medium') return 'md';
  if (raw === 'large') return 'lg';
  if (raw === 'sm' || raw === 'md' || raw === 'lg') return raw;
  return undefined;
}

/**
 * 解析控件尺寸：显式 prop > FormItem > Form > 容器（如 AdminPage toolbar）> 默认 md
 */
export function useComponentSize(
  propSize?: Ref<ComponentSize | string | undefined> | ComputedRef<ComponentSize | string | undefined> | ComponentSize | string,
): ComputedRef<ComponentSize> {
  const formContext = inject<SizeBearer | null>(FORM_CONTEXT_KEY, null);
  const formItemContext = inject<SizeBearer | ComputedRef<SizeBearer> | null>(FORM_ITEM_CONTEXT_KEY, null);
  const sizeContext = inject<SizeBearer | ComputedRef<SizeBearer> | null>(SIZE_CONTEXT_KEY, null);

  return computed(() => {
    const fromProp =
      typeof propSize === 'object' && propSize !== null && 'value' in propSize
        ? propSize.value
        : propSize;

    if (fromProp === 'xs') return 'sm';
    if (fromProp === 'small') return 'sm';
    if (fromProp === 'medium') return 'md';
    if (fromProp === 'large') return 'lg';
    if (fromProp === 'sm' || fromProp === 'md' || fromProp === 'lg') {
      return fromProp;
    }

    return (
      readSize(formItemContext) ||
      readSize(formContext) ||
      readSize(sizeContext) ||
      'md'
    );
  });
}
