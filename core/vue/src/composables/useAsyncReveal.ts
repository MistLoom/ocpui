import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  type Ref,
  type ComputedRef,
  computed,
} from 'vue';

/** 有头浏览：客户端确认数据就绪前保持 pending */
export type AsyncRevealBrowsePolicy = 'interactive' | 'hydrate';

export type AsyncRevealRefreshOnMount = 'if-empty' | 'always' | 'never';

export type AsyncRevealMode = 'public' | 'live';

export type AsyncShellPendingInput = {
  mode: AsyncRevealMode;
  browse: AsyncRevealBrowsePolicy;
  isClient: boolean;
  asyncPending: boolean;
  clientBrowseReady: boolean;
  data: unknown;
  error: unknown;
  asyncStatus?: string;
};

/**
 * 计算内容区是否应显示 pending（骨架/进度），与 Nuxt useAsyncData 契约对齐。
 */
export function resolveAsyncShellPending(input: AsyncShellPendingInput): boolean {
  if (input.asyncPending) return true;

  if (input.browse === 'interactive') {
    if (input.error) return false;
    if (!input.isClient) {
      return input.data == null;
    }
    return !input.clientBrowseReady;
  }

  if (!input.isClient) return false;
  if (input.asyncStatus === 'idle') return true;
  if (input.mode === 'live' && input.data == null && !input.error) return true;
  return false;
}

export type UseClientBrowseRevealOptions = {
  browse: AsyncRevealBrowsePolicy;
  refreshOnMount?: AsyncRevealRefreshOnMount;
  /** 当前 key 是否已有可展示数据 */
  hasUsableData: () => boolean;
  pending: Ref<boolean>;
  refresh: () => Promise<unknown>;
};

/**
 * interactive 浏览：挂载后按需 refresh，并在完成前保持 clientBrowseReady=false。
 */
export function useClientBrowseReveal(options: UseClientBrowseRevealOptions): Ref<boolean> {
  const refreshOnMount = options.refreshOnMount ?? 'if-empty';
  const clientBrowseReady = ref(
    options.browse !== 'interactive' || !import.meta.client,
  );

  if (options.browse === 'interactive' && import.meta.client) {
    onMounted(() => {
      const usable = options.hasUsableData();
      const shouldRefresh =
        refreshOnMount === 'always'
        || (refreshOnMount === 'if-empty' && !usable);

      if (!shouldRefresh) {
        clientBrowseReady.value = true;
        return;
      }

      clientBrowseReady.value = false;
      void options.refresh().finally(() => {
        if (!options.pending.value) {
          clientBrowseReady.value = true;
        }
      });
    });

    watch(
      () => options.pending.value,
      (pending) => {
        if (pending) {
          clientBrowseReady.value = false;
          return;
        }
        clientBrowseReady.value = true;
      },
    );
  }

  return clientBrowseReady;
}

/** documentElement 级 reveal 门控（多实例引用计数） */
let revealPendingCount = 0;
let revealFallbackTimer: ReturnType<typeof setTimeout> | undefined;

export const OCP_ASYNC_REVEAL_READY_CLASS = 'ocp-async-reveal-ready';

export function syncAsyncRevealDocumentClass(): void {
  if (!import.meta.client) return;
  const ready = revealPendingCount <= 0;
  document.documentElement.classList.toggle(OCP_ASYNC_REVEAL_READY_CLASS, ready);
}

export function asyncRevealRegisterPending(active: boolean): void {
  if (!import.meta.client) return;
  if (active) {
    revealPendingCount += 1;
    document.documentElement.classList.remove(OCP_ASYNC_REVEAL_READY_CLASS);
    if (revealFallbackTimer) clearTimeout(revealFallbackTimer);
    revealFallbackTimer = setTimeout(() => {
      revealPendingCount = 0;
      syncAsyncRevealDocumentClass();
    }, 12000);
  } else {
    revealPendingCount = Math.max(0, revealPendingCount - 1);
    if (revealPendingCount === 0 && revealFallbackTimer) {
      clearTimeout(revealFallbackTimer);
      revealFallbackTimer = undefined;
    }
    syncAsyncRevealDocumentClass();
  }
}

/** 首屏脚本：默认未 ready，避免 SSR 缓存内容先闪现 */
export const OCP_ASYNC_REVEAL_BOOT_SCRIPT = `(function(){try{document.documentElement.classList.remove('${OCP_ASYNC_REVEAL_READY_CLASS}');}catch(e){}})();`;

export function useAsyncRevealDocumentGate(
  shellPending: Ref<boolean> | ComputedRef<boolean>,
  interactiveReveal: Ref<boolean> | ComputedRef<boolean>,
): void {
  if (!import.meta.client) return;

  watch(
    () => interactiveReveal.value && shellPending.value,
    (active) => {
      asyncRevealRegisterPending(active);
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    if (interactiveReveal.value && shellPending.value) {
      asyncRevealRegisterPending(false);
    }
  });
}

export function useAsyncShellPending(input: () => AsyncShellPendingInput): ComputedRef<boolean> {
  return computed(() => resolveAsyncShellPending(input()));
}
