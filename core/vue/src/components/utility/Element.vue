<!--
Element 组件

公开属性：
- tag: ElementTag - HTML 标签类型
- type: ElementType - 文本颜色类型
- size: ElementSize - 文本尺寸
- strong: boolean - 是否加粗
- code: boolean - 是否为代码样式
- mark: boolean - 是否为标记样式
- delete: boolean - 是否为删除线样式
- underline: boolean - 是否为下划线样式
- disabled: boolean - 是否为禁用状态
- align: TextAlign - 文本对齐方式
- lineHeight: string | number - 行高
- letterSpacing: string | number - 字间距
- textTransform: TextTransform - 文本转换
- fontWeight: string | number - 字体权重
- fontStyle: FontStyle - 字体样式
- customClass: string - 自定义类名
- style: Record<string, string> - 自定义样式
-->
<template>
  <component
    :is="tag"
    :class="elementClass"
    :style="elementStyle"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export type ElementTag =
  | 'div'
  | 'span'
  | 'p'
  | 'a'
  | 'button'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'aside'
  | 'main'
  | 'nav';

export type ElementType = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type ElementSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type FontStyle = 'normal' | 'italic' | 'oblique';

interface Props {
  tag?: ElementTag;
  type?: ElementType;
  size?: ElementSize;
  strong?: boolean;
  code?: boolean;
  mark?: boolean;
  delete?: boolean;
  underline?: boolean;
  disabled?: boolean;
  align?: TextAlign;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textTransform?: TextTransform;
  fontWeight?: string | number;
  fontStyle?: FontStyle;
  customClass?: string;
  style?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'div',
  type: 'default',
  size: 'md',
  strong: false,
  code: false,
  mark: false,
  delete: false,
  underline: false,
  disabled: false,
  align: 'left',
  textTransform: 'none',
  fontStyle: 'normal',
  customClass: '',
  style: () => ({}),
});

const elementClass = computed(() => {
  const classes = ['element'];

  if (props.type !== 'default') {
    classes.push(`element--${props.type}`);
  }

  if (props.size !== 'md') {
    classes.push(`element--${props.size}`);
  }

  if (props.strong) classes.push('element--strong');
  if (props.code) classes.push('element--code');
  if (props.mark) classes.push('element--mark');
  if (props.delete) classes.push('element--delete');
  if (props.underline) classes.push('element--underline');
  if (props.disabled) classes.push('element--disabled');

  if (props.align && props.align !== 'left') {
    classes.push(`element--align-${props.align}`);
  }

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes.join(' ');
});

const elementStyle = computed(() => {
  const style: Record<string, string> = { ...props.style };

  if (props.lineHeight !== undefined && props.lineHeight !== null) {
    style.lineHeight = typeof props.lineHeight === 'number' ? props.lineHeight.toString() : props.lineHeight;
  }

  if (props.letterSpacing !== undefined && props.letterSpacing !== null) {
    style.letterSpacing = typeof props.letterSpacing === 'number' ? `${props.letterSpacing}px` : props.letterSpacing;
  }

  if (props.textTransform && props.textTransform !== 'none') {
    style.textTransform = props.textTransform;
  }

  if (props.fontWeight) {
    style.fontWeight = typeof props.fontWeight === 'number' ? props.fontWeight.toString() : props.fontWeight;
  }

  if (props.fontStyle && props.fontStyle !== 'normal') {
    style.fontStyle = props.fontStyle;
  }

  return style;
});
</script>

<style scoped>
.element {
  font-family: var(--font-sans);
  line-height: 1.6;
  color: hsl(var(--text));
}

.element--primary { color: hsl(var(--primary)); }
.element--success { color: hsl(var(--success)); }
.element--warning { color: hsl(var(--warning)); }
.element--error { color: hsl(var(--error)); }
.element--info { color: hsl(var(--info)); }

.element--xs { font-size: var(--font-size-xs); }
.element--sm { font-size: var(--font-size-sm); }
.element--md { font-size: var(--font-size-base); }
.element--lg { font-size: var(--font-size-lg); }
.element--xl { font-size: var(--font-size-xl); }

.element--strong { font-weight: 600; }

.element--code {
  font-family: var(--font-mono, 'Consolas', 'Monaco', 'Courier New', monospace);
  font-size: 0.9em;
  background: hsl(var(--surface-container-high));
  color: hsl(var(--primary));
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid hsl(var(--border));
}

.element--mark {
  background: hsl(var(--warning) / 0.2);
  color: hsl(var(--warning));
  padding: 2px 4px;
  border-radius: var(--radius-sm);
}

.element--delete {
  color: hsl(var(--text-muted));
  text-decoration: line-through;
}

.element--underline {
  text-decoration: underline;
}

.element--disabled {
  color: hsl(var(--text-muted));
  cursor: not-allowed;
  opacity: 0.6;
}

.element--align-center { text-align: center; }
.element--align-right { text-align: right; }
.element--align-justify { text-align: justify; }
</style>
