<!--
Descriptions 描述列表组件

## 组件说明
描述列表组件，用于展示键值对信息，支持多种布局和样式

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | '' | 描述列表标题 |
| items | DescriptionsItem[] | [] | 描述项数据 |
| column | number | 3 | 列数 |
| layout | 'horizontal' \| 'vertical' | 'horizontal' | 布局方式 |
| colon | boolean | true | 是否显示冒号 |
| labelWidth | string | '' | 标签宽度 |
| bordered | boolean | false | 是否显示边框 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | 尺寸 |
| customClass | string | '' | 自定义类名 |

## 事件
无

## 使用示例
```vue
<template>
  <Descriptions
    title="用户信息"
    :items="userInfo"
    :column="2"
    :bordered="true"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Descriptions from './Descriptions.vue';

const userInfo = ref([
  { label: '姓名', value: '张三' },
  { label: '年龄', value: 20 },
  { label: '地址', value: '北京市' },
  { label: '邮箱', value: 'zhangsan@example.com' }
]);
</script>
```
-->
<template>
  <div :class="descriptionsClass" :data-column="column">
    <div v-if="title" class="descriptions-header">
      <h3 class="descriptions-title">{{ title }}</h3>
    </div>
    <div class="descriptions-body" :style="bodyStyle">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="descriptions-item"
        :style="getItemStyle(item)"
      >
        <div class="descriptions-label" :style="labelStyle">
          <span>{{ item.label }}</span>
          <span v-if="colon" class="descriptions-colon">:</span>
        </div>
        <div class="descriptions-content" :style="contentStyle">
          <slot v-if="$slots[`content-${index}`]" :name="`content-${index}`" :item="item" />
          <template v-else>{{ item.value || '-' }}</template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type DescriptionsLayout = 'horizontal' | 'vertical';

interface DescriptionsItem {
  label: string;
  value?: string | number;
  span?: number;
}

interface Props {
  title?: string;
  items?: DescriptionsItem[];
  column?: number;
  layout?: DescriptionsLayout;
  colon?: boolean;
  labelWidth?: string;
  bordered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  items: () => [],
  column: 3,
  layout: 'horizontal',
  colon: true,
  labelWidth: '',
  bordered: false,
  size: 'md',
  customClass: '',
});

const descriptionsClass = computed(() => {
  const classes = [
    'descriptions',
    `descriptions--${props.layout}`,
    `descriptions--${props.size}`,
  ];
  if (props.bordered) classes.push('descriptions--bordered');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const bodyStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.column}, 1fr)`,
}));

const labelStyle = computed(() => {
  if (props.labelWidth) {
    return { width: props.labelWidth };
  }
  return {};
});

const contentStyle = computed(() => ({}));

const getItemStyle = (item: DescriptionsItem) => {
  if (item.span) {
    return { gridColumn: `span ${item.span}` };
  }
  return {};
};
</script>

<style scoped>
.descriptions {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: hsl(var(--surface));
  border-radius: 16px;
  overflow: hidden;
}

.descriptions--bordered {
  border: 1px solid hsl(var(--border));
}

.descriptions-header {
  padding: 16px 20px;
  border-bottom: 1px solid hsl(var(--border));
}

.descriptions-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--text));
}

.descriptions-body {
  display: grid;
  gap: 0;
}

.descriptions-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 20px;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
}

.descriptions-item:last-child {
  border-bottom: none;
}

/* 最后一列不显示右边框 */
.descriptions--bordered .descriptions-item:last-child {
  border-right: none;
}

.descriptions--vertical .descriptions-item {
  flex-direction: column;
}

.descriptions-label {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.descriptions--horizontal .descriptions-label {
  margin-right: 12px;
}

.descriptions--vertical .descriptions-label {
  margin-bottom: 6px;
}

.descriptions-colon {
  margin-left: 2px;
}

.descriptions-content {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text));
  word-break: break-word;
}

.descriptions--sm .descriptions-item {
  padding: 8px 16px;
}

.descriptions--sm .descriptions-title {
  font-size: 14px;
}

.descriptions--sm .descriptions-label,
.descriptions--sm .descriptions-content {
  font-size: 13px;
}

.descriptions--lg .descriptions-item {
  padding: 16px 24px;
}

.descriptions--lg .descriptions-title {
  font-size: 18px;
}

.descriptions--lg .descriptions-label,
.descriptions--lg .descriptions-content {
  font-size: 15px;
}
/* 响应式样式 */
@media (max-width: 767.98px) {
  .descriptions-body {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .descriptions--bordered .descriptions-item:nth-child(3n) {
    border-right: 1px solid hsl(var(--border) / 0.5);
  }
  
  .descriptions--bordered .descriptions-item:nth-child(2n) {
    border-right: none;
  }
}

@media (max-width: 575.98px) {
  .descriptions {
    border-radius: 12px;
  }
  
  .descriptions-body {
    grid-template-columns: 1fr !important;
  }
  
  .descriptions-header {
    padding: 12px 16px;
  }
  
  .descriptions-item {
    padding: 10px 16px;
  }
  
  .descriptions-title {
    font-size: 14px;
  }
  
  .descriptions-label,
  .descriptions-content {
    font-size: 14px;
  }
  
  .descriptions--sm .descriptions-item {
    padding: 8px 14px;
  }
  
  .descriptions--lg .descriptions-item {
    padding: 12px 18px;
  }
  
  .descriptions--bordered .descriptions-item {
    border-right: none;
  }
}
</style>
