import { ref, computed, type MaybeRef, type ComputedRef } from 'vue';

export interface UseLoadingOptions {
  initialLoading?: boolean;
  disabled?: MaybeRef<boolean>;
}

export interface UseLoadingReturn {
  isLoading: ComputedRef<boolean>;
  loadingClass: ComputedRef<string>;
  startLoading: () => void;
  stopLoading: () => void;
  toggleLoading: () => void;
}

export function useLoading(options: UseLoadingOptions = {}): UseLoadingReturn {
  const { initialLoading = false, disabled = false } = options;

  const isLoading = ref(initialLoading);
  const isDisabled = computed(() => {
    return typeof disabled === 'boolean' ? disabled : disabled.value;
  });

  const loadingClass = computed(() => {
    if (isDisabled.value) return '';
    return isLoading.value ? 'loading' : '';
  });

  const startLoading = () => {
    if (!isDisabled.value) {
      isLoading.value = true;
    }
  };

  const stopLoading = () => {
    isLoading.value = false;
  };

  const toggleLoading = () => {
    if (isDisabled.value) return;
    isLoading.value = !isLoading.value;
  };

  return {
    isLoading: computed(() => isLoading.value),
    loadingClass,
    startLoading,
    stopLoading,
    toggleLoading,
  };
}
