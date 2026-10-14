&lt;!--
ResponsiveLayout 响应式布局组件

## 公开属性
- breakpoints: BreakpointConfig - 断点配置，默认值为标准断点配置
- customClass: string - 自定义类名，默认值为 ''

## 公开方法
- 无特定公开方法

## 事件
- breakpoint-change: 断点变化时触发，参数为 (breakpoint: Breakpoint, width: number)

## 使用方式
```vue
&lt;ResponsiveLayout @breakpoint-change="handleBreakpointChange"&gt;
  &lt;template #default="{ breakpoint, isMobile, isTablet, isDesktop }"&gt;
    &lt;div v-if="isMobile"&gt;移动设备布局&lt;/div&gt;
    &lt;div v-else-if="isTablet"&gt;平板布局&lt;/div&gt;
    &lt;div v-else-if="isDesktop"&gt;桌面端布局&lt;/div&gt;
  &lt;/template&gt;
&lt;/ResponsiveLayout&gt;

&lt;!-- 自定义断点 --&gt;
&lt;ResponsiveLayout :breakpoints="{ xs: 0, sm: 768, md: 1024, lg: 1280, xl: 1600, xxl: 1920 }"&gt;
  &lt;div&gt;自定义断点布局&lt;/div&gt;
&lt;/ResponsiveLayout&gt;
```
--&gt;
<template>
  <div :class="responsiveLayoutClass" v-bind="$attrs">
    <slot :breakpoint="currentBreakpoint" :isMobile="isMobile" :isTablet="isTablet" :isDesktop="isDesktop" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue';

// 断点定义
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface BreakpointConfig {
  xs?: number;  // < 640px
  sm?: number;  // >= 640px
  md?: number;  // >= 768px
  lg?: number;  // >= 1024px
  xl?: number;  // >= 1280px
  xxl?: number; // >= 1536px
}

interface Props {
  breakpoints?: BreakpointConfig;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  breakpoints: () => ({
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
  }),
  customClass: '',
});

const emit = defineEmits<{
  'breakpoint-change': [breakpoint: Breakpoint, width: number];
}>();

// 当前视口宽度
const windowWidth = ref(0);
const currentBreakpoint = ref<Breakpoint>('xs');

// 计算当前断点
const calculateBreakpoint = (width: number): Breakpoint => {
  const bp = props.breakpoints;
  if (bp.xxl && width >= bp.xxl) return 'xxl';
  if (bp.xl && width >= bp.xl) return 'xl';
  if (bp.lg && width >= bp.lg) return 'lg';
  if (bp.md && width >= bp.md) return 'md';
  if (bp.sm && width >= bp.sm) return 'sm';
  return 'xs';
};

// 更新断点
const updateBreakpoint = () => {
  if (typeof window === 'undefined') return;
  const width = window.innerWidth;
  windowWidth.value = width;
  const newBreakpoint = calculateBreakpoint(width);
  
  if (newBreakpoint !== currentBreakpoint.value) {
    currentBreakpoint.value = newBreakpoint;
    emit('breakpoint-change', newBreakpoint, width);
  }
};

// 计算属性
const isMobile = computed(() => ['xs', 'sm'].includes(currentBreakpoint.value));
const isTablet = computed(() => currentBreakpoint.value === 'md');
const isDesktop = computed(() => ['lg', 'xl', 'xxl'].includes(currentBreakpoint.value));

const responsiveLayoutClass = computed(() => {
  const classes = [
    'responsive-layout',
    `responsive-layout--${currentBreakpoint.value}`,
  ];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

// 提供给子组件
provide('responsiveLayout', {
  breakpoint: currentBreakpoint,
  windowWidth,
  isMobile,
  isTablet,
  isDesktop,
});

// 生命周期
let resizeObserver: ResizeObserver | null = null;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  updateBreakpoint();
  
  // 使用 ResizeObserver 监听窗口变化
  if (typeof window !== 'undefined') {
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateBreakpoint, 100);
      });
      resizeObserver.observe(document.body);
    } else {
      // 降级方案
      window.addEventListener('resize', updateBreakpoint);
    }
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  } else if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateBreakpoint);
  }
  if (resizeTimer) clearTimeout(resizeTimer);
});

// 监听 props 变化
watch(() => props.breakpoints, () => {
  updateBreakpoint();
}, { deep: true });

// 暴露给父组件
defineExpose({
  breakpoint: currentBreakpoint,
  windowWidth,
  isMobile,
  isTablet,
  isDesktop,
  updateBreakpoint,
});
</script>

<style scoped>
.responsive-layout {
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
