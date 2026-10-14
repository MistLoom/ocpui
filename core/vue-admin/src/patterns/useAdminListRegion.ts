import { computed, type ComputedRef } from 'vue';
import {
  useUiRegionState,
  type UseUiRegionStateOptions,
  type UiRegionStateResult,
} from '../composables/useUiRegionState';
import type { UiDataState } from '../types/ui-data-state';

/** AdminWorkList 绑定 props（regionState 模式） */
export interface AdminWorkListRegionProps {
  regionState: UiDataState;
  errorText?: string;
  forbiddenText?: string;
}

export interface UseAdminListRegionOptions<T>
  extends UseUiRegionStateOptions<T> {
  errorText?: string;
  forbiddenText?: string;
}

export interface AdminListRegionResult<T> extends UiRegionStateResult<T> {
  /** 直接绑定 AdminWorkList 的 props */
  workListProps: ComputedRef<AdminWorkListRegionProps>;
}

/**
 * 列表页标准模式：10 态编排 + AdminWorkList 一键绑定。
 * 规范：@ocpui/docs/spec/guides/shell-composition.md
 */
export function useAdminListRegion<T>(
  options: UseAdminListRegionOptions<T>,
): AdminListRegionResult<T> {
  const { errorText, forbiddenText, ...regionOpts } = options;
  const region = useUiRegionState<T>(regionOpts);

  const workListProps = computed<AdminWorkListRegionProps>(() => ({
    regionState: region.state.value,
    ...(errorText ? { errorText } : {}),
    ...(forbiddenText ? { forbiddenText } : {}),
  }));

  return {
    ...region,
    workListProps,
  };
}
