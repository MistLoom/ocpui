<!--
List 列表组件

## 组件说明
列表组件，用于展示一系列相关的项目

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| bordered | boolean | false | 是否显示边框 |
| split | boolean | true | 是否显示分割线 |
| size | 'small' \| 'default' \| 'large' | 'default' | 列表大小 |
| loading | boolean | false | 是否加载状态 |
| customClass | string | '' | 自定义类名 |

## 事件
无

## 使用示例
```vue
<template>
  <List :bordered="true" size="small">
    <ListItem>
      列表项 1
    </ListItem>
    <ListItem>
      列表项 2
    </ListItem>
    <ListItem>
      列表项 3
    </ListItem>
  </List>
</template>

<script setup lang="ts">
import List from './List.vue';
import ListItem from './ListItem.vue';
</script>
```
-->
<template>
  <div :class="listClass" :style="listStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';

interface Props {
  bordered?: boolean;
  split?: boolean;
  size?: 'small' | 'default' | 'large';
  loading?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false,
  split: true,
  size: 'default',
  loading: false,
  customClass: '',
});

// 提供上下文给子组件
provide('listContext', {
  size: props.size,
  split: props.split,
});

const listClass = computed(() => {
  const classes = ['list'];
  if (props.bordered) {
    classes.push('list--bordered');
  }
  if (props.split) {
    classes.push('list--split');
  }
  if (props.size !== 'default') {
    classes.push(`list--${props.size}`);
  }
  if (props.loading) {
    classes.push('list--loading');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const listStyle = computed(() => {
  return {};
});
</script>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  background: hsl(var(--surface-container-high));
  border-radius: 8px;
  overflow: hidden;
}

.list--bordered {
  border: 1px solid hsl(var(--border));
}

.list--split :deep(.list-item) + :deep(.list-item) {
  border-top: 1px solid hsl(var(--border) / 0.5);
}

.list--small :deep(.list-item) {
  padding: 8px 12px;
}

.list--large :deep(.list-item) {
  padding: 16px 20px;
}

.list--loading {
  opacity: 0.6;
  pointer-events: none;
}
</style>
