&lt;!--
Flex 弹性布局组件

## 公开属性
- tag: string - 渲染的 HTML 标签，默认值为 'div'
- direction: 'row' | 'row-reverse' | 'column' | 'column-reverse' -  flex 方向，默认值为 'row'
- justify: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' - 主轴对齐方式，默认值为 'start'
- align: 'start' | 'end' | 'center' | 'baseline' | 'stretch' - 交叉轴对齐方式，默认值为 'stretch'
- wrap: 'nowrap' | 'wrap' | 'wrap-reverse' - 换行方式，默认值为 'nowrap'
- gap: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number - 间距，默认值为 undefined
- rowGap: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number - 行间距，默认值为 undefined
- columnGap: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number - 列间距，默认值为 undefined
- flex: string | number - flex 属性值，默认值为 undefined
- inline: boolean - 是否为内联 flex，默认值为 false
- center: boolean - 是否居中对齐，默认值为 false
- vertical: boolean - 是否为垂直方向，默认值为 false
- customClass: string - 自定义类名，默认值为 ''

## 处理器
- 无特定处理器

## 使用方式
```vue
&lt;Flex direction="row" justify="between" align="center" gap="md"&gt;
  &lt;div&gt;Item 1&lt;/div&gt;
  &lt;div&gt;Item 2&lt;/div&gt;
  &lt;div&gt;Item 3&lt;/div&gt;
&lt;/Flex&gt;
```
--&gt;
<template>
  <component
    :is="tag"
    :class="flexClass"
    :style="flexStyle"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type FlexGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

interface Props {
  tag?: string;
  direction?: FlexDirection;
  justify?: FlexJustify;
  align?: FlexAlign;
  wrap?: FlexWrap;
  gap?: FlexGap;
  rowGap?: FlexGap;
  columnGap?: FlexGap;
  flex?: string | number;
  inline?: boolean;
  center?: boolean;
  vertical?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'div',
  direction: 'row',
  justify: 'start',
  align: 'stretch',
  wrap: 'nowrap',
  gap: undefined,
  rowGap: undefined,
  columnGap: undefined,
  flex: undefined,
  inline: false,
  center: false,
  vertical: false,
  customClass: '',
});

const gapMap: Record<string, string> = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

const getGapValue = (gap: FlexGap | undefined): string => {
  if (gap === undefined) return '';
  if (typeof gap === 'number') return `${gap}px`;
  return gapMap[gap] || gap;
};

const flexClass = computed(() => {
  const classes = [];
  
  if (props.customClass) {
    classes.push(props.customClass);
  }
  
  return classes;
});

const flexStyle = computed(() => {
  const style: Record<string, string> = {};
  
  // Display
  style.display = props.inline ? 'inline-flex' : 'flex';
  
  // Direction
  if (props.vertical) {
    style.flexDirection = 'column';
  } else if (props.direction !== 'row') {
    style.flexDirection = props.direction;
  }
  
  // Justify content
  if (props.center) {
    style.justifyContent = 'center';
  } else if (props.justify !== 'start') {
    const justifyMap: Record<string, string> = {
      start: 'flex-start',
      end: 'flex-end',
      center: 'center',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly',
    };
    style.justifyContent = justifyMap[props.justify] || props.justify;
  }
  
  // Align items
  if (props.center) {
    style.alignItems = 'center';
  } else if (props.align !== 'stretch') {
    const alignMap: Record<string, string> = {
      start: 'flex-start',
      end: 'flex-end',
      center: 'center',
      baseline: 'baseline',
      stretch: 'stretch',
    };
    style.alignItems = alignMap[props.align] || props.align;
  }
  
  // Flex wrap
  if (props.wrap !== 'nowrap') {
    style.flexWrap = props.wrap;
  }
  
  // Gap
  if (props.gap !== undefined) {
    style.gap = getGapValue(props.gap);
  }
  
  if (props.rowGap !== undefined) {
    style.rowGap = getGapValue(props.rowGap);
  }
  
  if (props.columnGap !== undefined) {
    style.columnGap = getGapValue(props.columnGap);
  }
  
  // Flex
  if (props.flex !== undefined) {
    style.flex = String(props.flex);
  }
  
  return style;
});
</script>

<style scoped>
.flex {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
