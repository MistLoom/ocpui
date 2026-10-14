&lt;!--
LayoutHeader 布局头部组件

## 公开属性
- height: string | number - 头部高度，默认值为 64
- customClass: string - 自定义类名，默认值为 ''

## 公开方法
- 无特定公开方法

## 事件
- 无特定事件

## 使用方式
```vue
&lt;Layout&gt;
  &lt;LayoutHeader height="64"&gt;头部区域&lt;/LayoutHeader&gt;
  &lt;LayoutContent&gt;内容区域&lt;/LayoutContent&gt;
  &lt;LayoutFooter&gt;页脚区域&lt;/LayoutFooter&gt;
&lt;/Layout&gt;
```
--&gt;
<template>
  <header :class="headerClass" :style="headerStyle" v-bind="$attrs">
    <slot />
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  height?: string | number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: 64,
  customClass: '',
});

const headerClass = computed(() => {
  const classes = ['layout-header'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const headerStyle = computed(() => {
  const style: Record<string, string> = {};
  if (typeof props.height === 'number') {
    style.height = `${props.height}px`;
  } else if (props.height) {
    style.height = props.height;
  }
  return style;
});
</script>

<style scoped>
.layout-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: hsl(var(--surface));
  border-bottom: 1px solid hsl(var(--border));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>