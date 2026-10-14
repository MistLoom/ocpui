&lt;!--
MediaQuery 媒体查询组件

## 公开属性
- query: MediaQueryType | MediaQueryType[] - 媒体查询条件
- customClass: string - 自定义类名，默认值为 ''

## 公开方法
- 无特定公开方法

## 事件
- 无特定事件

## 使用方式
```vue
&lt;!-- 显示在移动设备上 --&gt;
&lt;MediaQuery query="mobile"&gt;
  &lt;div&gt;移动设备内容&lt;/div&gt;
&lt;/MediaQuery&gt;

&lt;!-- 显示在中等屏幕及以上 --&gt;
&lt;MediaQuery query="&gt;=md"&gt;
  &lt;div&gt;桌面端内容&lt;/div&gt;
&lt;/MediaQuery&gt;

&lt;!-- 显示在特定断点 --&gt;
&lt;MediaQuery query="lg"&gt;
  &lt;div&gt;大屏幕内容&lt;/div&gt;
&lt;/MediaQuery&gt;
```
--&gt;
<template>
  <div v-if="shouldRender" :class="mediaQueryClass" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue';
import type { Breakpoint } from './ResponsiveLayout.vue';

export type MediaQueryType = 
  | 'mobile'      // xs, sm
  | 'tablet'      // md
  | 'desktop'     // lg, xl, xxl
  | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  | '>=xs' | '>=sm' | '>=md' | '>=lg' | '>=xl' | '>=xxl'
  | '<=xs' | '<=sm' | '<=md' | '<=lg' | '<=xl' | '<=xxl';

interface Props {
  query: MediaQueryType | MediaQueryType[];
  customClass?: string;
}

const props = defineProps<Props>();

// 尝试从父组件注入响应式布局上下文
interface ResponsiveContext {
  breakpoint: { value: Breakpoint };
  windowWidth?: { value: number };
  isMobile: { value: boolean };
  isTablet: { value: boolean };
  isDesktop: { value: boolean };
}

const responsiveContext = inject<ResponsiveContext | null>('responsiveLayout', null);

// 本地状态（如果没有父组件上下文）
const localBreakpoint = ref<Breakpoint>('xs');
const localIsMobile = computed(() => ['xs', 'sm'].includes(localBreakpoint.value));
const localIsTablet = computed(() => localBreakpoint.value === 'md');
const localIsDesktop = computed(() => ['lg', 'xl', 'xxl'].includes(localBreakpoint.value));

// 使用上下文或本地状态
const currentBreakpoint = computed(() => responsiveContext?.breakpoint?.value ?? localBreakpoint.value);
const isMobile = computed(() => responsiveContext?.isMobile?.value ?? localIsMobile.value);
const isTablet = computed(() => responsiveContext?.isTablet?.value ?? localIsTablet.value);
const isDesktop = computed(() => responsiveContext?.isDesktop?.value ?? localIsDesktop.value);

// 断点顺序
const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
const breakpointIndex = (bp: Breakpoint) => breakpointOrder.indexOf(bp);

// 检查是否匹配查询条件
const checkQuery = (query: MediaQueryType): boolean => {
  const bp = currentBreakpoint.value;
  
  switch (query) {
    case 'mobile': return isMobile.value;
    case 'tablet': return isTablet.value;
    case 'desktop': return isDesktop.value;
    case 'xs': case 'sm': case 'md': case 'lg': case 'xl': case 'xxl':
      return bp === query;
    case '>=xs': return true;
    case '>=sm': return breakpointIndex(bp) >= 1;
    case '>=md': return breakpointIndex(bp) >= 2;
    case '>=lg': return breakpointIndex(bp) >= 3;
    case '>=xl': return breakpointIndex(bp) >= 4;
    case '>=xxl': return breakpointIndex(bp) >= 5;
    case '<=xs': return breakpointIndex(bp) <= 0;
    case '<=sm': return breakpointIndex(bp) <= 1;
    case '<=md': return breakpointIndex(bp) <= 2;
    case '<=lg': return breakpointIndex(bp) <= 3;
    case '<=xl': return breakpointIndex(bp) <= 4;
    case '<=xxl': return true;
    default: return false;
  }
};

// 是否应该渲染
const shouldRender = computed(() => {
  const queries = Array.isArray(props.query) ? props.query : [props.query];
  return queries.some(checkQuery);
});

const mediaQueryClass = computed(() => {
  const classes = ['media-query'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

// 如果没有父上下文，自己监听窗口变化
let resizeObserver: ResizeObserver | null = null;

const updateBreakpoint = () => {
  if (typeof window === 'undefined') return;
  const width = window.innerWidth;
  if (width >= 1536) localBreakpoint.value = 'xxl';
  else if (width >= 1280) localBreakpoint.value = 'xl';
  else if (width >= 1024) localBreakpoint.value = 'lg';
  else if (width >= 768) localBreakpoint.value = 'md';
  else if (width >= 640) localBreakpoint.value = 'sm';
  else localBreakpoint.value = 'xs';
};

onMounted(() => {
  if (!responsiveContext) {
    updateBreakpoint();
    if (typeof window !== 'undefined') {
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(updateBreakpoint);
        resizeObserver.observe(document.body);
      } else {
        window.addEventListener('resize', updateBreakpoint);
      }
    }
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  } else if (!responsiveContext && typeof window !== 'undefined') {
    window.removeEventListener('resize', updateBreakpoint);
  }
});

// 监听 props 变化
watch(() => props.query, () => {
  // 当 query 变化时，shouldRender 会自动重新计算
});
</script>

<style scoped>
.media-query {
  width: 100%;
}
</style>
