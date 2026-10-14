import { computed, onMounted, onUnmounted, reactive } from 'vue';

/** 与主题 variables.css 断点一致 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export const THEME_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

const BREAKPOINT_ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

const MEDIA_QUERIES: Record<Exclude<Breakpoint, 'xs'>, string> = {
  sm: `(min-width: ${THEME_BREAKPOINTS.sm}px)`,
  md: `(min-width: ${THEME_BREAKPOINTS.md}px)`,
  lg: `(min-width: ${THEME_BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${THEME_BREAKPOINTS.xl}px)`,
  xxl: `(min-width: ${THEME_BREAKPOINTS.xxl}px)`,
};

/** SSR 默认：桌面端 lg */
const SSR_MATCHES: Record<Breakpoint, boolean> = {
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: false,
  xxl: false,
};

// 显式 boolean 映射，避免字面量窄化导致键写入退化为 never
const matches = reactive<Record<Breakpoint, boolean>>({ ...SSR_MATCHES });

function mediaQuerySupported(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

let subscriberCount = 0;
const mediaQueryLists = new Map<Exclude<Breakpoint, 'xs'>, MediaQueryList>();
const changeHandlers = new Map<Exclude<Breakpoint, 'xs'>, () => void>();

function syncMatches() {
  if (!mediaQuerySupported()) {
    matches.sm = SSR_MATCHES.sm;
    matches.md = SSR_MATCHES.md;
    matches.lg = SSR_MATCHES.lg;
    matches.xl = SSR_MATCHES.xl;
    matches.xxl = SSR_MATCHES.xxl;
    return;
  }

  (Object.keys(MEDIA_QUERIES) as Exclude<Breakpoint, 'xs'>[]).forEach((bp) => {
    matches[bp] = window.matchMedia(MEDIA_QUERIES[bp]).matches;
  });
}

function setupListeners() {
  if (!mediaQuerySupported()) return;

  syncMatches();

  (Object.keys(MEDIA_QUERIES) as Exclude<Breakpoint, 'xs'>[]).forEach((bp) => {
    const mql = window.matchMedia(MEDIA_QUERIES[bp]);
    mediaQueryLists.set(bp, mql);

    const handler = () => {
      matches[bp] = mql.matches;
    };
    changeHandlers.set(bp, handler);
    mql.addEventListener('change', handler);
  });
}

function teardownListeners() {
  mediaQueryLists.forEach((mql, bp) => {
    const handler = changeHandlers.get(bp);
    if (handler) {
      mql.removeEventListener('change', handler);
    }
  });
  mediaQueryLists.clear();
  changeHandlers.clear();
}

const currentBreakpoint = computed((): Breakpoint => {
  for (let i = BREAKPOINT_ORDER.length - 1; i >= 0; i--) {
    const bp = BREAKPOINT_ORDER[i];
    if (matches[bp]) return bp;
  }
  return 'xs';
});

const isMobile = computed(() => currentBreakpoint.value === 'xs' || currentBreakpoint.value === 'sm');
const isTablet = computed(() => currentBreakpoint.value === 'md');
const isDesktop = computed(() =>
  currentBreakpoint.value === 'lg'
  || currentBreakpoint.value === 'xl'
  || currentBreakpoint.value === 'xxl',
);

/** 响应式断点检测，基于 matchMedia */
export function useBreakpoint() {
  if (mediaQuerySupported() && subscriberCount === 0) {
    syncMatches();
  }

  onMounted(() => {
    subscriberCount += 1;
    if (subscriberCount === 1) {
      setupListeners();
    } else {
      syncMatches();
    }
  });

  onUnmounted(() => {
    subscriberCount -= 1;
    if (subscriberCount <= 0) {
      subscriberCount = 0;
      teardownListeners();
    }
  });

  return {
    matches,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
  };
}
