<!--
GradientText 组件

公开属性：
- colors: string[] - 渐变色数组
- direction: GradientDirection - 渐变方向
- size: TextSize - 文本尺寸
- weight: TextWeight - 字体权重
- fontSize: string - 自定义字体大小（CSS 长度单位）
- lineHeight: string | number - 行高
- letterSpacing: string | number - 字间距
- align: TextAlign - 文本对齐方式
- decoration: TextDecoration - 文本装饰
- animate: boolean - 是否启用动画效果
- darkColors: string[] - 暗色模式下的渐变色数组
- customClass: string - 自定义类名
-->
<template>
  <span
    :class="gradientTextClass"
    :style="gradientTextStyle"
    v-bind="$attrs"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

export type GradientDirection =
  | 'to right'
  | 'to left'
  | 'to bottom'
  | 'to top'
  | 'to bottom right'
  | 'to bottom left'
  | 'to top right'
  | 'to top left';

export type GradientTextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type GradientTextWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextDecoration = 'none' | 'underline' | 'overline' | 'line-through';

interface Props {
  colors?: string[];
  direction?: GradientDirection;
  size?: GradientTextSize;
  weight?: GradientTextWeight;
  fontSize?: string;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  align?: TextAlign;
  decoration?: TextDecoration;
  animate?: boolean;
  darkColors?: string[];
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => ['hsl(var(--primary))', 'hsl(var(--info))'],
  direction: 'to right',
  size: 'md',
  weight: 'semibold',
  decoration: 'none',
  animate: false,
  customClass: '',
});

const isDarkMode = ref(false);
let observer: MutationObserver | null = null;

const checkDarkMode = () => {
  if (typeof document === 'undefined') return;
  isDarkMode.value = document.documentElement.classList.contains('dark');
};

const gradientTextClass = computed(() => {
  const classes = ['gradient-text', `gradient-text--${props.size}`, `gradient-text--${props.weight}`];

  if (props.animate) {
    classes.push('gradient-text--animate');
  }

  if (props.align && props.align !== 'left') {
    classes.push(`gradient-text--align-${props.align}`);
  }

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes.join(' ');
});

const gradientTextStyle = computed(() => {
  const style: Record<string, string> = {};

  // 选择颜色数组（根据暗色模式）
  const currentColors = isDarkMode.value && props.darkColors?.length ? props.darkColors : props.colors;

  if (currentColors?.length) {
    style.background = `linear-gradient(${props.direction}, ${currentColors.join(', ')})`;
    style.webkitBackgroundClip = 'text';
    style.webkitTextFillColor = 'transparent';
    style.backgroundClip = 'text';
  }

  if (props.fontSize) {
    style.fontSize = props.fontSize;
  }

  if (props.lineHeight !== undefined && props.lineHeight !== null) {
    style.lineHeight = typeof props.lineHeight === 'number' ? props.lineHeight.toString() : props.lineHeight;
  }

  if (props.letterSpacing !== undefined && props.letterSpacing !== null) {
    style.letterSpacing = typeof props.letterSpacing === 'number' ? `${props.letterSpacing}px` : props.letterSpacing;
  }

  if (props.decoration && props.decoration !== 'none') {
    style.textDecoration = props.decoration;
  }

  return style;
});

onMounted(() => {
  if (typeof document === 'undefined') return;
  checkDarkMode();
  // 通过 MutationObserver 监听 dark 类变化，避免硬编码事件名
  observer = new MutationObserver(checkDarkMode);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<style scoped>
.gradient-text {
  display: inline-block;
  font-family: var(--font-sans);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-text--xs { font-size: var(--font-size-xs); }
.gradient-text--sm { font-size: var(--font-size-sm); }
.gradient-text--md { font-size: var(--font-size-base); }
.gradient-text--lg { font-size: var(--font-size-lg); }
.gradient-text--xl { font-size: var(--font-size-xl); }
.gradient-text--2xl { font-size: var(--font-size-2xl); }
.gradient-text--3xl { font-size: var(--font-size-3xl); }

.gradient-text--normal { font-weight: 400; }
.gradient-text--medium { font-weight: 500; }
.gradient-text--semibold { font-weight: 600; }
.gradient-text--bold { font-weight: 700; }
.gradient-text--extrabold { font-weight: 800; }

.gradient-text--align-center { text-align: center; }
.gradient-text--align-right { text-align: right; }
.gradient-text--align-justify { text-align: justify; }

.gradient-text--animate {
  background-size: 200% 200%;
  animation: gradient-text-animation var(--duration-slower, 3s) var(--ease-in-out, ease) infinite;
}

@keyframes gradient-text-animation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .gradient-text--animate {
    animation: none;
  }
}
</style>
