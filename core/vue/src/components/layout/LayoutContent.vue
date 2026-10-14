&lt;!--
LayoutContent 布局内容组件

## 公开属性
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
  &lt;LayoutFooter&gt;页脚&lt;/LayoutFooter&gt;
&lt;/Layout&gt;
```
--&gt;
<template>
  <main :class="contentClass" v-bind="$attrs">
    <slot />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  customClass: '',
});

const contentClass = computed(() => {
  const classes = ['layout-content'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});
</script>

<style scoped>
.layout-content {
  flex: auto;
  min-height: 0;
  padding: 16px; /* 移动端 Compact */
  background: hsl(var(--background));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

@media (min-width: 640px) {
  .layout-content {
    padding: 16px; /* 平板 Compact */
  }
}

@media (min-width: 768px) {
  .layout-content {
    padding: 20px; /* 平板 Medium */
  }
}

@media (min-width: 1024px) {
  .layout-content {
    padding: 24px; /* 桌面 Expanded */
  }
}
</style>