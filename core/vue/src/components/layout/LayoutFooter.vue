&lt;!--
LayoutFooter 布局页脚组件

## 公开属性
- height: string | number - 页脚高度，默认值为 64
- customClass: string - 自定义类名，默认值为 ''

## 公开方法
- 无特定公开方法

## 事件
- 无特定事件

## 使用方式
```vue
&lt;Layout&gt;
  &lt;LayoutHeader&gt;头部&lt;/LayoutHeader&gt;
  &lt;LayoutContent&gt;内容区域&lt;/LayoutContent&gt;
  &lt;LayoutFooter height="64"&gt;页脚区域&lt;/LayoutFooter&gt;
&lt;/Layout&gt;
```
--&gt;
<template>
  <footer :class="footerClass" :style="footerStyle" v-bind="$attrs">
    <slot />
  </footer>
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

const footerClass = computed(() => {
  const classes = ['layout-footer'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const footerStyle = computed(() => {
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
.layout-footer {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background: hsl(var(--surface));
  border-top: 1px solid hsl(var(--border));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  color: hsl(var(--text-muted));
}
</style>