/**
 * 滑动指示器：同类控件间选中态「跟随」位移（水系近场衔接）。
 * 消费方提供轨道与激活项元素；返回 transform/width 样式。
 */
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  type CSSProperties,
  type Ref,
} from 'vue';
import { useReducedMotion } from './useReducedMotion';

export interface UseSlidingIndicatorOptions {
  /** 指示条过渡；默认走 token */
  transition?: string;
}

export interface UseSlidingIndicatorReturn {
  indicatorStyle: Ref<CSSProperties>;
  update: () => void;
}

export function useSlidingIndicator(
  trackRef: Ref<HTMLElement | null | undefined>,
  activeElRef: Ref<HTMLElement | null | undefined>,
  options: UseSlidingIndicatorOptions = {},
): UseSlidingIndicatorReturn {
  const reduced = useReducedMotion();
  const indicatorStyle = ref<CSSProperties>({
    width: '0px',
    transform: 'translate3d(0,0,0)',
    opacity: 0,
  });

  let ro: ResizeObserver | null = null;

  function resolveTransition(): string {
    if (reduced.value) return 'none';
    return (
      options.transition ??
      'transform var(--duration-normal, 0.22s) var(--ease-out-soft, var(--ease-standard)), width var(--duration-normal, 0.22s) var(--ease-out-soft, var(--ease-standard)), opacity var(--duration-fast, 0.14s) var(--ease-standard)'
    );
  }

  function update() {
    const track = trackRef.value;
    const active = activeElRef.value;
    if (!track || !active) {
      indicatorStyle.value = {
        width: '0px',
        transform: 'translate3d(0,0,0)',
        opacity: 0,
        transition: resolveTransition(),
      };
      return;
    }
    const tr = track.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    const left = ar.left - tr.left + track.scrollLeft;
    indicatorStyle.value = {
      width: `${ar.width}px`,
      transform: `translate3d(${left}px, 0, 0)`,
      opacity: 1,
      transition: resolveTransition(),
    };
  }

  function bindObserver() {
    ro?.disconnect();
    ro = null;
    if (typeof ResizeObserver === 'undefined') return;
    const track = trackRef.value;
    if (!track) return;
    ro = new ResizeObserver(() => update());
    ro.observe(track);
    if (activeElRef.value) ro.observe(activeElRef.value);
  }

  onMounted(() => {
    nextTick(() => {
      update();
      bindObserver();
    });
    window.addEventListener('resize', update);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', update);
    ro?.disconnect();
    ro = null;
  });

  watch([trackRef, activeElRef, reduced], () => {
    nextTick(() => {
      update();
      bindObserver();
    });
  });

  return { indicatorStyle, update };
}
