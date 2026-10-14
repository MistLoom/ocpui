&lt;!--
Divider 组件

公开属性：
- direction: string - 分割线方向 ('horizontal' | 'vertical')
- vertical: boolean - 是否为垂直分割线
- dashed: boolean - 是否为虚线
- text: string - 分割线文本
- position: string - 文本位置 ('left' | 'center' | 'right')
- borderStyle: string - 边框样式 ('solid' | 'dashed' | 'dotted')
- color: string - 分割线颜色
- spacing: number | string - 分割线间距
- thickness: string | number - 分割线厚度
- textStyle: Record&lt;string, string&gt; - 文本样式
- customClass: string - 自定义类名

使用方式：
&lt;template&gt;
  &lt;!-- 水平分割线 --&gt;
  &lt;Divider /&gt;
  
  &lt;!-- 垂直分割线 --&gt;
  &lt;Divider vertical /&gt;
  
  &lt;!-- 虚线分割线 --&gt;
  &lt;Divider dashed /&gt;
  
  &lt;!-- 带文本的分割线 --&gt;
  &lt;Divider text="分割线" /&gt;
  
  &lt;!-- 自定义位置的文本分割线 --&gt;
  &lt;Divider text="左侧" position="left" /&gt;
  &lt;Divider text="右侧" position="right" /&gt;
  
  &lt;!-- 自定义颜色和厚度 --&gt;
  &lt;Divider color="#ff6b6b" thickness="2px" /&gt;
  
  &lt;!-- 自定义间距 --&gt;
  &lt;Divider spacing="24px" /&gt;
  
  &lt;!-- 自定义文本样式 --&gt;
  &lt;Divider text="自定义文本" :textStyle="{ fontSize: '16px', fontWeight: 'bold' }" /&gt;
&lt;/template&gt;
--&gt;

<template>
  <div 
    :class="dividerClass" 
    :style="dividerStyle" 
    role="separator" 
    :aria-orientation="isVertical ? 'vertical' : 'horizontal'"
  >
    <span 
      v-if="hasText && !isVertical" 
      class="divider-text"
      :style="textStyle"
    >
      <slot>{{ text }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

type DividerDirection = 'horizontal' | 'vertical';
type DividerPosition = 'left' | 'center' | 'right';

interface Props {
  direction?: DividerDirection;
  vertical?: boolean;
  dashed?: boolean;
  text?: string;
  position?: DividerPosition;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  spacing?: string | number;
  thickness?: string | number;
  textStyle?: Record<string, string>;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  vertical: false,
  dashed: false,
  text: '',
  position: 'center',
  borderStyle: 'solid',
  color: '',
  spacing: undefined,
  thickness: '1px',
  textStyle: () => ({}),
  customClass: '',
});

const slots = useSlots();

const hasText = computed(() => {
  return props.text || slots.default;
});

const isVertical = computed(() => {
  return props.vertical || props.direction === 'vertical';
});

const dividerClass = computed(() => {
  const classes = ['divider'];
  if (isVertical.value) {
    classes.push('divider--vertical');
  } else {
    classes.push('divider--horizontal');
  }
  if (props.dashed || props.borderStyle === 'dashed') {
    classes.push('divider--dashed');
  } else if (props.borderStyle === 'dotted') {
    classes.push('divider--dotted');
  }
  if (hasText.value && !isVertical.value) {
    classes.push('divider--with-text');
    classes.push(`divider--with-text-${props.position}`);
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const dividerStyle = computed(() => {
  const style: Record<string, string> = {};
  
  // 颜色
  if (props.color) {
    style.borderColor = props.color;
  }
  
  // 厚度
  const thicknessValue = typeof props.thickness === 'number' ? `${props.thickness}px` : props.thickness;
  if (isVertical.value) {
    style.borderLeftWidth = thicknessValue;
  } else {
    style.borderTopWidth = thicknessValue;
  }
  
  // 间距
  if (props.spacing !== undefined) {
    const spacingValue = typeof props.spacing === 'number' ? `${props.spacing}px` : props.spacing;
    if (isVertical.value) {
      style.marginLeft = spacingValue;
      style.marginRight = spacingValue;
    } else {
      style.marginTop = spacingValue;
      style.marginBottom = spacingValue;
    }
  }
  
  return style;
});
</script>

<style scoped>
.divider {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: hsl(var(--text));
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  border-color: hsl(var(--border));
  --divider-color: hsl(var(--border));
}

/* 自定义颜色 */
.divider[style*="border-color"] {
  --divider-color: var(--divider-color, hsl(var(--border)));
}

.divider--horizontal {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 100%;
  margin: 16px 0;
  border-top: 1px solid var(--divider-color);
  clear: both;
}

.divider--vertical {
  display: inline-block;
  height: 1em;
  margin: 0 8px;
  vertical-align: middle;
  border-left: 1px solid var(--divider-color);
  position: relative;
  top: -0.06em;
}

.divider--dashed {
  border-style: dashed;
}

.divider--dotted {
  border-style: dotted;
}

.divider--with-text {
  border-top: none;
  border-top-color: transparent;
  display: flex;
  align-items: center;
}

.divider--with-text::before,
.divider--with-text::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--divider-color);
  transition: background-color 0.2s;
}

.divider--with-text.divider--dashed::before,
.divider--with-text.divider--dashed::after {
  background: repeating-linear-gradient(
    to right,
    var(--divider-color) 0,
    var(--divider-color) 4px,
    transparent 4px,
    transparent 8px
  );
}

.divider--with-text.divider--dotted::before,
.divider--with-text.divider--dotted::after {
  background: repeating-linear-gradient(
    to right,
    var(--divider-color) 0,
    var(--divider-color) 2px,
    transparent 2px,
    transparent 6px
  );
}

.divider--with-text-left::before {
  flex: 0 0 5%;
}

.divider--with-text-right::after {
  flex: 0 0 5%;
}

.divider-text {
  display: inline-block;
  padding: 0 16px;
  color: hsl(var(--text));
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.divider--with-text-left .divider-text {
  padding-left: 0;
}

.divider--with-text-right .divider-text {
  padding-right: 0;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .divider--horizontal {
    margin: 12px 0;
  }
  
  .divider--vertical {
    margin: 0 6px;
  }
  
  .divider-text {
    padding: 0 12px;
    font-size: 13px;
  }
}
</style>
