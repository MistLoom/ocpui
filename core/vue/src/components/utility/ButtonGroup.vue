&lt;!--
ButtonGroup 组件

公开属性：
- size: string - 按钮组尺寸 ('sm' | 'md' | 'lg')
- variant: string - 按钮组样式变体 ('primary' | 'secondary' | 'text')
- vertical: boolean - 是否垂直排列
- customClass: string - 自定义类名
- spacing: number | string - 按钮间距
- alignment: string - 按钮组对齐方式 ('start' | 'center' | 'end')

使用方式：
&lt;template&gt;
  &lt;!-- 基本用法 --&gt;
  &lt;ButtonGroup&gt;
    &lt;Button&gt;Left&lt;/Button&gt;
    &lt;Button&gt;Middle&lt;/Button&gt;
    &lt;Button&gt;Right&lt;/Button&gt;
  &lt;/ButtonGroup&gt;
  
  &lt;!-- 垂直排列 --&gt;
  &lt;ButtonGroup vertical&gt;
    &lt;Button&gt;Top&lt;/Button&gt;
    &lt;Button&gt;Middle&lt;/Button&gt;
    &lt;Button&gt;Bottom&lt;/Button&gt;
  &lt;/ButtonGroup&gt;
  
  &lt;!-- 不同尺寸 --&gt;
  &lt;ButtonGroup size="sm"&gt;
    &lt;Button&gt;Small&lt;/Button&gt;
    &lt;Button&gt;Buttons&lt;/Button&gt;
  &lt;/ButtonGroup&gt;
  
  &lt;!-- 自定义间距 --&gt;
  &lt;ButtonGroup spacing="12px"&gt;
    &lt;Button&gt;Spaced&lt;/Button&gt;
    &lt;Button&gt;Buttons&lt;/Button&gt;
  &lt;/ButtonGroup&gt;
  
  &lt;!-- 对齐方式 --&gt;
  &lt;ButtonGroup alignment="center"&gt;
    &lt;Button&gt;Centered&lt;/Button&gt;
    &lt;Button&gt;Buttons&lt;/Button&gt;
  &lt;/ButtonGroup&gt;
&lt;/template&gt;
--&gt;

<template>
  <div 
    class="button-group" 
    :class="groupClass"
    :style="groupStyle"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'text';
  vertical?: boolean;
  customClass?: string;
  spacing?: number | string;
  alignment?: 'start' | 'center' | 'end';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
  vertical: false,
  customClass: '',
  alignment: 'start',
});

const groupClass = computed(() => {
  const classes: string[] = ['button-group'];
  
  if (props.vertical) {
    classes.push('button-group--vertical');
  } else {
    classes.push('button-group--horizontal');
  }
  
  classes.push(`button-group--${props.size}`);
  classes.push(`button-group--${props.variant}`);
  
  if (props.customClass) {
    classes.push(props.customClass);
  }
  
  return classes;
});

const groupStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.spacing) {
    if (props.vertical) {
      style.gap = typeof props.spacing === 'number' ? `${props.spacing}px` : props.spacing;
    } else {
      style.gap = typeof props.spacing === 'number' ? `${props.spacing}px` : props.spacing;
    }
  }
  
  if (props.alignment) {
    style.justifyContent = props.alignment === 'start' ? 'flex-start' : 
                          props.alignment === 'center' ? 'center' : 'flex-end';
  }
  
  return style;
});
</script>

<style scoped>
.button-group {
  display: inline-flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  gap: 0;
}

.button-group--horizontal {
  flex-direction: row;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.button-group--vertical {
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.button-group--horizontal > button {
  border-radius: 0;
  border-right: 1px solid hsl(var(--border));
  box-shadow: none;
}

.button-group--horizontal > button:last-child {
  border-right: none;
}

.button-group--vertical > button {
  border-radius: 0;
  border-bottom: 1px solid hsl(var(--border));
  box-shadow: none;
}

.button-group--vertical > button:last-child {
  border-bottom: none;
}

.button-group--horizontal > button:first-child {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.button-group--horizontal > button:last-child {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.button-group--vertical > button:first-child {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.button-group--vertical > button:last-child {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.button-group--sm > button {
  font-size: 12px;
  padding: 6px 12px;
}

.button-group--lg > button {
  font-size: 16px;
  padding: 12px 24px;
}

/* 确保按钮在组内的样式正确 */
.button-group > button {
  flex: 1;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.button-group > button:hover {
  z-index: 1;
  position: relative;
}

.button-group > button:active {
  transform: none;
}

/* 带间距的按钮组 */
.button-group:not([style*="gap"]):not([class*="button-group--spaced"]) > button + button {
  margin-left: -1px;
}

.button-group--vertical:not([style*="gap"]) > button + button {
  margin-left: 0;
  margin-top: -1px;
}

/* 响应式样式 */
@media (max-width: 639.98px) {
  .button-group--horizontal:not(.button-group--force-horizontal) {
    flex-direction: column;
  }
  
  .button-group--horizontal:not(.button-group--force-horizontal) > button {
    border-right: none;
    border-bottom: 1px solid hsl(var(--border));
  }
  
  .button-group--horizontal:not(.button-group--force-horizontal) > button:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border-bottom-left-radius: 0;
  }
  
  .button-group--horizontal:not(.button-group--force-horizontal) > button:last-child {
    border-top-right-radius: 0;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
}
</style>