import { ref, shallowRef, type Ref } from 'vue';
import type { UiDataState } from '../types/ui-data-state';

export interface UseUiRegionStateOptions<T> {
  /** 拉取区域数据 */
  fetch: () => Promise<T>;
  /** 判定空数据；默认 !data 或 (Array.isArray && length===0) */
  isEmpty?: (data: T) => boolean;
  /** 将异常映射为 error | partial_error | forbidden */
  mapError?: (err: unknown) => UiDataState;
  /** 初始态，默认 initial */
  initialState?: UiDataState;
}

export interface UiRegionStateResult<T> {
  state: Ref<UiDataState>;
  data: Ref<T | undefined>;
  error: Ref<unknown>;
  refresh: () => Promise<void>;
  setState: (next: UiDataState) => void;
  runSubmit: <R>(task: () => Promise<R>) => Promise<R>;
}

function defaultIsEmpty<T>(data: T): boolean {
  if (data == null) return true;
  if (Array.isArray(data)) return data.length === 0;
  return false;
}

function defaultMapError(): UiDataState {
  return 'error';
}

/**
 * Shell 级区域状态编排：10 态语义 + 提交中/成功后续。
 * 规范：@ocpui/docs/spec/foundation/state-system.md
 */
export function useUiRegionState<T>(
  options: UseUiRegionStateOptions<T>,
): UiRegionStateResult<T> {
  const state = ref<UiDataState>(options.initialState ?? 'initial');
  const data = shallowRef<T | undefined>();
  const error = shallowRef<unknown>();

  const isEmpty = options.isEmpty ?? defaultIsEmpty;
  const mapError = options.mapError ?? defaultMapError;

  async function refresh() {
    state.value = 'loading';
    error.value = undefined;
    try {
      const result = await options.fetch();
      data.value = result;
      state.value = isEmpty(result) ? 'empty' : 'ready';
    } catch (err) {
      error.value = err;
      state.value = mapError(err);
    }
  }

  function setState(next: UiDataState) {
    state.value = next;
  }

  async function runSubmit<R>(task: () => Promise<R>): Promise<R> {
    state.value = 'submitting';
    try {
      const result = await task();
      state.value = 'success';
      return result;
    } catch (err) {
      error.value = err;
      state.value = mapError(err);
      throw err;
    }
  }

  return { state, data, error, refresh, setState, runSubmit };
}
