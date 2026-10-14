&lt;!--
GridItem 网格项组件

## 公开属性
- colSpan: ColSpan | ResponsiveValue&lt;ColSpan&gt; - 列跨度，默认值为 undefined
- rowSpan: number - 行跨度，默认值为 undefined
- colStart: number - 列起始位置，默认值为 undefined
- colEnd: number - 列结束位置，默认值为 undefined
- rowStart: number - 行起始位置，默认值为 undefined
- rowEnd: number - 行结束位置，默认值为 undefined
- align: 'start' | 'end' | 'center' | 'stretch' - 自身垂直对齐方式，默认值为 undefined
- justify: 'start' | 'end' | 'center' | 'stretch' - 自身水平对齐方式，默认值为 undefined
- customClass: string - 自定义类名，默认值为 ''

## 公开方法
- 无特定公开方法

## 事件
- 无特定事件

## 使用方式
```vue
&lt;Grid cols="4" gap="md"&gt;
  &lt;GridItem colSpan="2"&gt;占用 2 列&lt;/GridItem&gt;
  &lt;GridItem colSpan="1"&gt;占用 1 列&lt;/GridItem&gt;
  &lt;GridItem colSpan="1"&gt;占用 1 列&lt;/GridItem&gt;
  &lt;GridItem colSpan="4" rowSpan="2"&gt;占用 4 列 2 行&lt;/GridItem&gt;
&lt;/Grid&gt;

&lt;!-- 响应式网格项 --&gt;
&lt;Grid :cols="{ xs: 1, sm: 2, md: 4 }"&gt;
  &lt;GridItem :colSpan="{ xs: 1, sm: 1, md: 2 }"&gt;响应式项&lt;/GridItem&gt;
  &lt;GridItem :colSpan="{ xs: 1, sm: 1, md: 2 }"&gt;响应式项&lt;/GridItem&gt;
&lt;/Grid&gt;
```
--&gt;
<template>
  <div :class="gridItemClass" :style="gridItemStyle" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { GRID_CONTEXT_KEY } from '@ocpui/vue/types';
import { useBreakpoint } from '../../composables/useBreakpoint';
import { resolveResponsiveValue, type ResponsiveValue } from '../../composables/resolveResponsiveValue';

type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 'auto' | 'full';
type RowSpan = number;

interface Props {
  colSpan?: ColSpan | ResponsiveValue<ColSpan>;
  rowSpan?: RowSpan;
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  align?: 'start' | 'end' | 'center' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'stretch';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  colSpan: undefined,
  rowSpan: undefined,
  colStart: undefined,
  colEnd: undefined,
  rowStart: undefined,
  rowEnd: undefined,
  align: undefined,
  justify: undefined,
  customClass: '',
});

const { currentBreakpoint } = useBreakpoint();

const _gridContext = inject(GRID_CONTEXT_KEY, { cols: 4 });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
void _gridContext;

const resolvedColSpan = computed((): ColSpan | undefined => {
  if (props.colSpan === undefined) return undefined;
  return resolveResponsiveValue(props.colSpan, currentBreakpoint.value);
});

const gridItemClass = computed(() => {
  const classes = ['grid-item'];

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes;
});

const getSpanValue = (span: ColSpan | undefined): string => {
  if (span === undefined) return '';
  if (span === 'auto') return 'auto';
  if (span === 'full') return '1 / -1';
  return `span ${span} / span ${span}`;
};

const gridItemStyle = computed(() => {
  const style: Record<string, string> = {};

  if (resolvedColSpan.value !== undefined) {
    style.gridColumn = getSpanValue(resolvedColSpan.value);
  }

  if (props.rowSpan !== undefined) {
    style.gridRow = `span ${props.rowSpan} / span ${props.rowSpan}`;
  }

  if (props.colStart !== undefined) {
    style.gridColumnStart = String(props.colStart);
  }
  if (props.colEnd !== undefined) {
    style.gridColumnEnd = String(props.colEnd);
  }

  if (props.rowStart !== undefined) {
    style.gridRowStart = String(props.rowStart);
  }
  if (props.rowEnd !== undefined) {
    style.gridRowEnd = String(props.rowEnd);
  }

  if (props.align !== undefined) {
    style.alignSelf = props.align;
  }

  if (props.justify !== undefined) {
    style.justifySelf = props.justify;
  }

  return style;
});
</script>

<style scoped>
.grid-item {
  min-width: 0;
  min-height: 0;
}
</style>
