import { ref, watch, type Ref } from 'vue';

/** 防抖 ref 值 */
export function useDebouncedRef<T>(source: Ref<T>, delayMs = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(source, (value) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      debounced.value = value;
    }, delayMs);
  });

  return debounced;
}
