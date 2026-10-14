<!--
Grid 网格布局组件

## 公开属性
- cols: GridCols | ResponsiveValue<GridCols> - 列数，默认值为 4
- gap: GridGap | ResponsiveValue<GridGap> - 间距，默认值为 'md'
- rowGap: GridGap | ResponsiveValue<GridGap> - 行间距，默认值为 undefined
- colGap: GridGap | ResponsiveValue<GridGap> - 列间距，默认值为 undefined
- align: 'start' | 'end' | 'center' | 'stretch' - 垂直对齐方式，默认值为 'stretch'
- justify: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' - 水平对齐方式，默认值为 'start'
- autoFlow: 'row' | 'column' | 'row dense' | 'column dense' - 自动布局方式，默认值为 'row'
- customClass: string - 自定义类名，默认值为 ''

## 公开方法
- 无特定公开方法

## 事件
- 无特定事件

## 使用方式
```vue
<Grid cols="4" gap="md" align="center" justify="between">
  <GridItem colSpan="2">Item 1</GridItem>
  <GridItem colSpan="1">Item 2</GridItem>
  <GridItem colSpan="1">Item 3</GridItem>
</Grid>

-->
<template>
  <div
    :class="gridClass"
    :style="gridStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { GRID_CONTEXT_KEY } from '@ocpui/vue/types';
import { useBreakpoint } from '../../composables/useBreakpoint';
import { resolveResponsiveValue, type ResponsiveValue } from '../../composables/resolveResponsiveValue';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
type GridAlign = 'start' | 'end' | 'center' | 'stretch';
type GridJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

interface Props {
  cols?: GridCols | ResponsiveValue<GridCols>;
  gap?: GridGap | ResponsiveValue<GridGap>;
  rowGap?: GridGap | ResponsiveValue<GridGap>;
  colGap?: GridGap | ResponsiveValue<GridGap>;
  align?: GridAlign;
  justify?: GridJustify;
  autoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  cols: 4,
  gap: 'md',
  rowGap: undefined,
  colGap: undefined,
  align: 'stretch',
  justify: 'start',
  autoFlow: 'row',
  customClass: '',
});

const { currentBreakpoint } = useBreakpoint();

const gapMap: Record<string, string> = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

const getGapValue = (gap: GridGap | undefined): string => {
  if (gap === undefined) return '';
  if (typeof gap === 'number') return `${gap}px`;
  return gapMap[gap] || gap;
};

const resolvedCols = computed((): GridCols => {
  const value = resolveResponsiveValue(props.cols, currentBreakpoint.value);
  return (value ?? 1) as GridCols;
});

const resolvedGap = computed((): GridGap | undefined =>
  resolveResponsiveValue(props.gap, currentBreakpoint.value),
);

const resolvedRowGap = computed((): GridGap | undefined =>
  props.rowGap === undefined
    ? undefined
    : resolveResponsiveValue(props.rowGap, currentBreakpoint.value),
);

const resolvedColGap = computed((): GridGap | undefined =>
  props.colGap === undefined
    ? undefined
    : resolveResponsiveValue(props.colGap, currentBreakpoint.value),
);

provide(GRID_CONTEXT_KEY, {
  cols: resolvedCols,
});

const gridClass = computed(() => {
  const classes = ['grid'];

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes;
});

const gridStyle = computed(() => {
  const style: Record<string, string> = {};

  style.gridTemplateColumns = `repeat(${resolvedCols.value}, minmax(0, 1fr))`;

  const gap = getGapValue(resolvedGap.value);
  if (gap) {
    style.gap = gap;
  }

  if (resolvedRowGap.value !== undefined) {
    style.rowGap = getGapValue(resolvedRowGap.value);
  }

  if (resolvedColGap.value !== undefined) {
    style.columnGap = getGapValue(resolvedColGap.value);
  }

  if (props.align !== 'stretch') {
    style.alignItems = props.align;
  }

  if (props.justify !== 'start') {
    const justifyMap: Record<string, string> = {
      start: 'start',
      end: 'end',
      center: 'center',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly',
    };
    style.justifyItems = justifyMap[props.justify] || props.justify;
  }

  if (props.autoFlow !== 'row') {
    style.gridAutoFlow = props.autoFlow;
  }

  return style;
});
</script>

<style scoped>
.grid {
  display: grid;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
