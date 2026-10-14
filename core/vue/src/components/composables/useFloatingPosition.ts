import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement,
  type Middleware,
  type ReferenceElement,
} from '@floating-ui/dom';
import { onUnmounted, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';

export type FloatingPlacement =
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  // 物理侧别名（LTR 下映射到 start/end；RTL 在 G 阶段按 dir 解析）
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'top-right';

const PLACEMENT_MAP: Record<string, Placement> = {
  bottom: 'bottom',
  'bottom-start': 'bottom-start',
  'bottom-end': 'bottom-end',
  'bottom-left': 'bottom-start',
  'bottom-right': 'bottom-end',
  top: 'top',
  'top-start': 'top-start',
  'top-end': 'top-end',
  'top-left': 'top-start',
  'top-right': 'top-end',
  left: 'left',
  'left-start': 'left-start',
  'left-end': 'left-end',
  right: 'right',
  'right-start': 'right-start',
  'right-end': 'right-end',
};

export function resolveFloatingPlacement(placement: FloatingPlacement): Placement {
  return PLACEMENT_MAP[placement] ?? 'bottom-start';
}

/** 视口坐标虚拟锚点（图表 crosshair、虚拟 hover 点等无 DOM reference 的场景） */
export interface VirtualAnchor {
  x: number;
  y: number;
}

export function isVirtualAnchor(value: unknown): value is VirtualAnchor {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as VirtualAnchor).x === 'number' &&
    typeof (value as VirtualAnchor).y === 'number'
  );
}

/** 虚拟锚点转 floating-ui 引用元素；实时读取坐标，autoUpdate 期间不固化 */
function toVirtualElement(anchor: VirtualAnchor): ReferenceElement {
  return {
    getBoundingClientRect: () => ({
      x: anchor.x,
      y: anchor.y,
      width: 0,
      height: 0,
      top: anchor.y,
      left: anchor.x,
      right: anchor.x,
      bottom: anchor.y,
    }),
  } as ReferenceElement;
}

export interface UseFloatingPositionOptions {
  /** 锚定元素或虚拟锚点 */
  reference: MaybeRefOrGetter<HTMLElement | VirtualAnchor | null | undefined>;
  floating: MaybeRefOrGetter<HTMLElement | null | undefined>;
  placement?: MaybeRefOrGetter<FloatingPlacement>;
  offsetPx?: MaybeRefOrGetter<number>;
  /** 面板宽度对齐触发器（仅元素锚点生效） */
  matchWidth?: MaybeRefOrGetter<boolean>;
  maxHeight?: MaybeRefOrGetter<number | undefined>;
  /**
   * 可见状态（主要用于虚拟锚点）：true 时启动 autoUpdate，false 时停止；
   * 元素锚点通常由消费方在打开/关闭时手动 start/stop，可不传。
   */
  visible?: MaybeRefOrGetter<boolean>;
  /** flip/shift 视口留白；虚拟锚点默认更紧凑 */
  viewportPadding?: MaybeRefOrGetter<number>;
  onUpdate?: (coords: { x: number; y: number; placement: Placement }) => void;
}

/**
 * 统一浮层锚定定位（@floating-ui/dom）。
 *
 * - 元素锚点：打开期间 autoUpdate，防首开假尺寸与滚动/resize 错位，支持 matchWidth/maxHeight；
 * - 虚拟锚点：用于图表 tooltip，需配合 Teleport 挂 body 避免 overflow 裁切；
 * - 首帧隐藏，坐标就绪再显示，避免闪动；卸载自动停止 autoUpdate。
 */
export function useFloatingPosition(options: UseFloatingPositionOptions) {
  let stopAutoUpdate: (() => void) | null = null;

  /** 触发器内优先用第一个子元素（Select 的 selector）作为参考 */
  function resolveElementReference(referenceEl: HTMLElement): HTMLElement {
    return (referenceEl.firstElementChild as HTMLElement | null) ?? referenceEl;
  }

  async function update(): Promise<void> {
    const referenceRaw = toValue(options.reference);
    const floatingEl = toValue(options.floating);
    if (!referenceRaw || !floatingEl) return;

    const virtual = isVirtualAnchor(referenceRaw);
    const reference: ReferenceElement = virtual
      ? toVirtualElement(referenceRaw)
      : resolveElementReference(referenceRaw);

    const placement = resolveFloatingPlacement(toValue(options.placement) ?? 'bottom');
    const padding = toValue(options.viewportPadding) ?? (virtual ? 8 : 16);
    const offsetValue = toValue(options.offsetPx) ?? (virtual ? 8 : 4);
    const matchWidth = toValue(options.matchWidth) ?? false;
    const maxHeight = toValue(options.maxHeight);

    const middleware: Middleware[] = [
      offset(offsetValue),
      flip({ padding }),
      shift({ padding }),
    ];

    if (!virtual && (matchWidth || (typeof maxHeight === 'number' && maxHeight > 0))) {
      middleware.push(
        size({
          apply({ rects, availableHeight, elements }) {
            const next: Record<string, string> = {};
            if (matchWidth) {
              next.width = `${rects.reference.width}px`;
              next.minWidth = `${rects.reference.width}px`;
            }
            if (typeof maxHeight === 'number' && maxHeight > 0) {
              next.maxHeight = `${Math.min(maxHeight, availableHeight)}px`;
            }
            Object.assign(elements.floating.style, next);
          },
        }),
      );
    }

    const { x, y, placement: resolved } = await computePosition(reference, floatingEl, {
      placement,
      strategy: 'fixed',
      middleware,
    });

    Object.assign(floatingEl.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      // 尺寸/坐标就绪后再显示，避免首帧无坐标闪动
      visibility: 'visible',
      opacity: '1',
    });

    options.onUpdate?.({ x, y, placement: resolved });
  }

  function start(): void {
    stop();
    const referenceRaw = toValue(options.reference);
    const floatingEl = toValue(options.floating);
    if (!referenceRaw || !floatingEl) return;

    const reference: ReferenceElement = isVirtualAnchor(referenceRaw)
      ? toVirtualElement(referenceRaw)
      : resolveElementReference(referenceRaw);

    // 首帧隐藏，等 computePosition 完成
    floatingEl.style.visibility = 'hidden';
    floatingEl.style.opacity = '0';

    stopAutoUpdate = autoUpdate(
      reference,
      floatingEl,
      () => {
        void update();
      },
      {
        ancestorScroll: true,
        ancestorResize: true,
        elementResize: true,
        layoutShift: true,
      },
    );
  }

  function stop(): void {
    stopAutoUpdate?.();
    stopAutoUpdate = null;
  }

  if (options.visible !== undefined) {
    // 虚拟锚点：可见时启动（flush post，确保 v-if 的浮层 DOM 已挂载）；
    // 锚点移动直接重算（虚拟 reference 不触发 autoUpdate）
    watch(
      () => toValue(options.visible),
      (val) => {
        if (val) start();
        else stop();
      },
      { flush: 'post' },
    );
    watch(
      () => toValue(options.reference),
      () => {
        if (toValue(options.visible) && isVirtualAnchor(toValue(options.reference))) {
          void update();
        }
      },
      { deep: true },
    );
  }

  onUnmounted(stop);

  return { update, start, stop };
}
