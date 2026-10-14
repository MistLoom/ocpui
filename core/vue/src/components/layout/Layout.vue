<!--
Layout 布局组件

## 公开属性
- hasSider: boolean - 是否包含侧边栏，默认值为 false
- customClass: string - 自定义类名，默认值为 ''

## 公开方法
- 无特定公开方法

## 事件
- 无特定事件

## 使用方式
```vue
<Layout>
  <LayoutHeader>头部</LayoutHeader>
  <LayoutContent>内容</LayoutContent>
  <LayoutFooter>页脚</LayoutFooter>
</Layout>

### 包含侧边栏的布局
<Layout hasSider>
  <LayoutSider>侧边栏</LayoutSider>
  <Layout>
    <LayoutHeader>头部</LayoutHeader>
    <LayoutContent>内容</LayoutContent>
    <LayoutFooter>页脚</LayoutFooter>
  </Layout>
</Layout>
```
-->
<template>
  <div :class="layoutClass" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

interface Props {
  hasSider?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  hasSider: false,
  customClass: '',
});

const slots = useSlots();

const layoutClass = computed(() => {
  const classes = ['layout'];

  const hasSiderSlot = slots.default && slots.default().some(vnode => {
    if (!vnode) return false;
    // VNode.type 可能是 string / symbol / Component 对象，仅对象类型携带 name/__name
    const type = vnode.type;
    if (typeof type !== 'object' || type === null) return false;
    const def = type as Record<string, unknown>;
    return def.name === 'LayoutSider' || def.__name === 'LayoutSider';
  });

  if (props.hasSider || hasSiderSlot) {
    classes.push('layout--has-sider');
  }

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes;
});
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  flex: auto;
  min-height: 100%;
  background: hsl(var(--background));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 嵌套布局时的样式 */
.layout .layout {
  min-height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.layout--has-sider {
  flex-direction: row;
}

/* 响应式样式 */
@media (max-width: 767.98px) {
  .layout--has-sider {
    flex-direction: column;
  }

  /* 确保主内容区域在移动端正常显示 */
  .layout {
    min-height: 100vh;
  }
}
</style>
