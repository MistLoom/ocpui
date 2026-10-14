&lt;!--
Typography 组件

功能：提供丰富的文本排版选项，支持各种标题、段落、内联文本样式

公开属性：
- type: TypographyType - 文本类型，如 h1-h6, p, span 等，默认为 'p'
- size: string - 文本大小，可选值：xs, sm, md, lg, xl, 2xl, 3xl, 4xl，默认为 'md'
- weight: string - 字体粗细，可选值：normal, medium, semibold, bold, extrabold，默认为 'normal'
- color: TypographyColor - 文本颜色，可选值：primary, secondary, success, warning, error, info, default，默认为 'default'
- align: TypographyAlign - 文本对齐方式，可选值：left, center, right, justify，默认为 'left'
- ellipsis: boolean - 是否显示省略号，默认为 false
- underline: boolean - 是否显示下划线，默认为 false
- delete: boolean - 是否显示删除线，默认为 false
- mark: boolean - 是否显示标记，默认为 false
- code: boolean - 是否显示代码样式，默认为 false
- disabled: boolean - 是否禁用，默认为 false
- copyable: boolean - 是否可复制，默认为 false
- customClass: string - 自定义类名，默认为 ''
- gradient: boolean - 是否显示渐变文本，默认为 false
- gradientStart: string - 渐变起始颜色，默认为 ''
- gradientEnd: string - 渐变结束颜色，默认为 ''
- lineClamp: number - 多行省略行数，默认为 0（不限制）

事件处理器：
- copy: 复制文本时触发，参数为复制的文本内容

使用方式：
&lt;template&gt;
  &lt;!-- 基本使用 --&gt;
  &lt;Typography type="h1"&gt;标题&lt;/Typography&gt;
  
  &lt;!-- 自定义样式 --&gt;
  &lt;Typography size="lg" weight="bold" color="primary"&gt;粗体主色文本&lt;/Typography&gt;
  
  &lt;!-- 特殊效果 --&gt;
  &lt;Typography copyable&gt;可复制文本&lt;/Typography&gt;
  &lt;Typography gradient gradientStart="#4f46e5" gradientEnd="#8b5cf6"&gt;渐变文本&lt;/Typography&gt;
  &lt;Typography ellipsis lineClamp="2"&gt;多行省略文本...&lt;/Typography&gt;
&lt;/template&gt;
--&gt;

<template>
  <component 
    :is="tag" 
    :class="typographyClass" 
    :style="typographyStyle"
    v-bind="$attrs"
    @click="handleClick"
    :aria-label="copyable ? t('components.utility.typography.copyableText') : undefined"
    :aria-disabled="disabled"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

type TypographyType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'small' | 'mark' | 'del' | 'u' | 'strong' | 'code' | 'pre' | 'blockquote';
type TypographyColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default' | 'muted';
type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

interface Props {
  type?: TypographyType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: TypographyColor;
  align?: TypographyAlign;
  ellipsis?: boolean;
  underline?: boolean;
  delete?: boolean;
  mark?: boolean;
  code?: boolean;
  disabled?: boolean;
  copyable?: boolean;
  customClass?: string;
  gradient?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  lineClamp?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'p',
  size: 'md',
  weight: 'normal',
  color: 'default',
  align: 'left',
  ellipsis: false,
  underline: false,
  delete: false,
  mark: false,
  code: false,
  disabled: false,
  copyable: false,
  customClass: '',
  gradient: false,
  gradientStart: '',
  gradientEnd: '',
  lineClamp: 0,
});

const emit = defineEmits<{
  'copy': [text: string];
}>();

const isCopied = ref(false);

const tag = computed(() => {
  if (props.delete) return 'del';
  if (props.mark) return 'mark';
  if (props.code) return 'code';
  return props.type;
});

const typographyClass = computed(() => {
  const classes = ['typography'];
  
  if (props.type) {
    classes.push(`typography--${props.type}`);
  }
  
  if (props.size) {
    classes.push(`typography--${props.size}`);
  }
  
  if (props.weight) {
    classes.push(`typography--${props.weight}`);
  }
  
  if (props.color !== 'default' && !props.gradient) {
    classes.push(`typography--${props.color}`);
  }
  
  if (props.align !== 'left') {
    classes.push(`typography--${props.align}`);
  }
  
  if (props.ellipsis) {
    classes.push('typography--ellipsis');
  }
  
  if (props.underline) {
    classes.push('typography--underline');
  }
  
  if (props.disabled) {
    classes.push('typography--disabled');
  }
  
  if (props.copyable) {
    classes.push('typography--copyable');
  }
  
  if (props.gradient) {
    classes.push('typography--gradient');
  }
  
  if (props.lineClamp > 0) {
    classes.push('typography--line-clamp');
  }
  
  if (props.customClass) {
    classes.push(props.customClass);
  }
  
  return classes.join(' ');
});

const typographyStyle = computed(() => {
  const styles: Record<string, string> = {};
  
  if (props.gradient && props.gradientStart && props.gradientEnd) {
    styles.background = `linear-gradient(90deg, ${props.gradientStart}, ${props.gradientEnd})`;
    styles.webkitBackgroundClip = 'text';
    styles.webkitTextFillColor = 'transparent';
    styles.backgroundClip = 'text';
  }
  
  if (props.lineClamp > 0) {
    styles.display = '-webkit-box';
    styles.webkitLineClamp = props.lineClamp.toString();
    styles.webkitBoxOrient = 'vertical';
  }
  
  return styles;
});

const handleClick = () => {
  if (props.copyable && !props.disabled) {
    copyText();
  }
};

const copyText = async () => {
  try {
    const text = document.createElement('textarea');
    text.value = (document.querySelector('.typography--copyable') as HTMLElement)?.textContent || '';
    document.body.appendChild(text);
    text.select();
    document.execCommand('copy');
    document.body.removeChild(text);
    
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
    
    emit('copy', text.value);
  } catch {
  }
};
</script>

<style scoped>
.typography {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: hsl(var(--text));
  transition: color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.typography--h1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
}

.typography--h2 {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
}

.typography--h3 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
}

.typography--h4 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.45;
}

.typography--h5 {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
}

.typography--h6 {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
}

.typography--p {
  font-size: 14px;
}

.typography--p:last-child {
  margin-bottom: 0;
}

.typography--span {
  font-size: 14px;
}

.typography--small {
  font-size: 12px;
}

.typography--mark {
  background: hsl(var(--warning) / 0.2);
  color: hsl(var(--warning));
  padding: 2px 4px;
  border-radius: 4px;
}

.typography--del {
  color: hsl(var(--text-muted));
  text-decoration: line-through;
}

.typography--u {
  text-decoration: underline;
}

.typography--strong {
  font-weight: 600;
}

.typography--code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  background: hsl(var(--surface-inset));
  color: hsl(var(--primary));
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid hsl(var(--border));
}

.typography--pre {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  background: hsl(var(--surface-inset));
  color: hsl(var(--text));
  padding: 12px;
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.typography--blockquote {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-left: 4px solid hsl(var(--primary));
  background: hsl(var(--surface-inset));
  color: hsl(var(--text-muted));
  font-style: italic;
}

.typography--xs {
  font-size: 12px;
}

.typography--sm {
  font-size: 13px;
}

.typography--md {
  font-size: 14px;
}

.typography--lg {
  font-size: 16px;
}

.typography--xl {
  font-size: 18px;
}

.typography--2xl {
  font-size: 20px;
}

.typography--3xl {
  font-size: 24px;
}

.typography--4xl {
  font-size: 32px;
}

.typography--normal {
  font-weight: 400;
}

.typography--medium {
  font-weight: 500;
}

.typography--semibold {
  font-weight: 600;
}

.typography--bold {
  font-weight: 700;
}

.typography--extrabold {
  font-weight: 800;
}

.typography--primary {
  color: hsl(var(--primary));
}

.typography--secondary {
  color: hsl(var(--text-muted));
}

.typography--muted {
  color: hsl(var(--text-muted));
}

.typography--success {
  color: hsl(var(--success));
}

.typography--warning {
  color: hsl(var(--warning));
}

.typography--error {
  color: hsl(var(--error));
}

.typography--info {
  color: hsl(var(--primary));
}

.typography--left {
  text-align: left;
}

.typography--center {
  text-align: center;
}

.typography--right {
  text-align: right;
}

.typography--justify {
  text-align: justify;
}

.typography--ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.typography--line-clamp {
  overflow: hidden;
  text-overflow: ellipsis;
}

.typography--underline {
  text-decoration: underline;
}

.typography--disabled {
  color: hsl(var(--text-muted));
  cursor: not-allowed;
  opacity: 0.6;
}

.typography--copyable {
  cursor: pointer;
  position: relative;
  user-select: none;
}

.typography--copyable:hover {
  color: hsl(var(--primary));
}

.typography--copyable::after {
  content: '复制';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: hsl(var(--primary));
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  z-index: 10;
}

.typography--copyable:hover::after {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-4px);
}

.typography--gradient {
  display: inline-block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .typography--h1 {
    font-size: 28px;
  }
  
  .typography--h2 {
    font-size: 24px;
  }
  
  .typography--h3 {
    font-size: 20px;
  }
  
  .typography--h4 {
    font-size: 18px;
  }
  
  .typography--4xl {
    font-size: 28px;
  }
  
  .typography--3xl {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .typography--h1 {
    font-size: 24px;
  }
  
  .typography--h2 {
    font-size: 20px;
  }
  
  .typography--h3 {
    font-size: 18px;
  }
  
  .typography--4xl {
    font-size: 24px;
  }
  
  .typography--3xl {
    font-size: 20px;
  }
}
</style>
