<template>
  <div :class="spaceClass" :style="spaceStyle" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';

/**
 * 间距组件，用于控制子元素之间的间距
 * 
 * @props direction - 排列方向，可选 'horizontal' | 'vertical'，支持响应式配置
 * @props size - 间距大小，可选 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number，支持响应式配置
 * @props align - 对齐方式，可选 'start' | 'center' | 'end' | 'baseline' | 'stretch'，支持响应式配置
 * @props wrap - 是否换行，支持响应式配置
 * @props fill - 是否填充容器
 * @props customClass - 自定义类名
 * 
 * @usage
 * <Space size="md" direction="horizontal">
 *   <Button>按钮1</Button>
 *   <Button>按钮2</Button>
 * </Space>
 */

// 响应式窗口宽度
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

// 监听窗口大小变化
const handleResize = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth;
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
});

interface BreakpointProps<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
}

// 获取响应式属性值
const getResponsiveValue = <T>(value: T | BreakpointProps<T>, defaultValue: T): T => {
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }
  
  const width = windowWidth.value;
  if (width < 640) {
    return (value as BreakpointProps<T>).xs || defaultValue;
  } else if (width < 768) {
    return (value as BreakpointProps<T>).sm || (value as BreakpointProps<T>).xs || defaultValue;
  } else if (width < 1024) {
    return (value as BreakpointProps<T>).md || (value as BreakpointProps<T>).sm || (value as BreakpointProps<T>).xs || defaultValue;
  } else if (width < 1280) {
    return (value as BreakpointProps<T>).lg || (value as BreakpointProps<T>).md || (value as BreakpointProps<T>).sm || (value as BreakpointProps<T>).xs || defaultValue;
  } else if (width < 1536) {
    return (value as BreakpointProps<T>).xl || (value as BreakpointProps<T>).lg || (value as BreakpointProps<T>).md || (value as BreakpointProps<T>).sm || (value as BreakpointProps<T>).xs || defaultValue;
  } else {
    return (value as BreakpointProps<T>).xxl || (value as BreakpointProps<T>).xl || (value as BreakpointProps<T>).lg || (value as BreakpointProps<T>).md || (value as BreakpointProps<T>).sm || (value as BreakpointProps<T>).xs || defaultValue;
  }
};

interface Props {
  direction?: 'horizontal' | 'vertical' | BreakpointProps<'horizontal' | 'vertical'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number | BreakpointProps<'xs' | 'sm' | 'md' | 'lg' | 'xl' | number>;
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch' | BreakpointProps<'start' | 'center' | 'end' | 'baseline' | 'stretch'>;
  wrap?: boolean | BreakpointProps<boolean>;
  fill?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  size: 'md',
  align: 'center',
  wrap: false,
  fill: false,
  customClass: '',
});

const NAMED_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
type NamedSize = (typeof NAMED_SIZES)[number];

const isNamedSize = (value: unknown): value is NamedSize =>
  typeof value === 'string' && (NAMED_SIZES as readonly string[]).includes(value);

const spaceClass = computed(() => {
  const direction = getResponsiveValue(props.direction, 'horizontal');
  const wrap = getResponsiveValue(props.wrap, false);
  const size = getResponsiveValue(props.size, 'md');

  const classes = ['space', `space-${direction}`];
  if (wrap) {
    classes.push('space-wrap');
  }
  if (props.fill) {
    classes.push('space-fill');
  }
  if (isNamedSize(size)) {
    classes.push(`space-size-${size}`);
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const spaceStyle = computed(() => {
  const size = getResponsiveValue(props.size, 'md');
  const align = getResponsiveValue(props.align, 'center');

  const style: Record<string, string> = {
    alignItems: align,
  };

  if (typeof size === 'number') {
    style.gap = `${size}px`;
  }

  return style;
});
</script>

<style scoped>
.space {
  display: flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.space-horizontal {
  flex-direction: row;
}

.space-vertical {
  flex-direction: column;
}

.space-wrap {
  flex-wrap: wrap;
}

.space-fill > * {
  flex: 1;
}

.space-size-xs {
  gap: var(--space-1);
}

.space-size-sm {
  gap: var(--space-2);
}

.space-size-md {
  gap: var(--space-4);
}

.space-size-lg {
  gap: var(--space-6);
}

.space-size-xl {
  gap: var(--space-8);
}

@media (max-width: 767.98px) {
  .space-horizontal {
    flex-wrap: wrap;
  }
}
</style>