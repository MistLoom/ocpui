import { ref, onMounted, onUnmounted } from 'vue';

const QUERY = '(prefers-reduced-motion: reduce)';

/** 是否应降级动效（@ocpui/docs/spec/foundation/motion-system.md） */
export function useReducedMotion() {
  const reduced = ref(false);

  let mq: MediaQueryList | undefined;

  function sync() {
    if (typeof window === 'undefined' || !window.matchMedia) {
      reduced.value = false;
      return;
    }
    mq = window.matchMedia(QUERY);
    reduced.value = mq.matches;
  }

  function onChange() {
    reduced.value = mq?.matches ?? false;
  }

  // setup 阶段立即读取，避免首帧动效闪烁
  sync();

  onMounted(() => {
    sync();
    mq?.addEventListener('change', onChange);
  });

  onUnmounted(() => {
    mq?.removeEventListener('change', onChange);
  });

  return reduced;
}

/** 非组件上下文读取（一次性） */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}
