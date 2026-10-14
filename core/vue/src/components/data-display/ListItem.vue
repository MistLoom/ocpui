<!--
ListItem 列表项组件

## 组件说明
列表项组件，用于展示列表中的单个项目

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | '' | 列表项标题 |
| description | string | '' | 列表项描述 |
| icon | string | '' | 列表项图标 |
| extra | string | '' | 列表项额外信息 |
| clickable | boolean | false | 是否可点击（触发动作，不保留选中态） |
| selectable | boolean | false | 是否可选中（W2 持久焦点权重，配 aria-selected） |
| selected | boolean | false | 选中态（selectable 时生效） |
| disabled | boolean | false | 是否禁用 |
| customClass | string | '' | 自定义类名 |

## 事件
| 事件名 | 参数 | 说明 |
|-------|------|------|
| click | event: MouseEvent | 点击事件 |

## 使用示例
```vue
<template>
  <List>
    <ListItem
      title="列表项标题"
      description="列表项描述"
      icon="📌"
      extra="额外信息"
      :clickable="true"
      @click="handleClick"
    />
  </List>
</template>

<script setup lang="ts">
import List from './List.vue';
import ListItem from './ListItem.vue';

const handleClick = (event) => {
};
</script>
```
-->
<template>
  <div
    :class="itemClass"
    data-part="list-item"
    :role="selectable ? 'option' : clickable ? 'button' : undefined"
    :tabindex="(clickable || selectable) && !disabled ? 0 : undefined"
    :aria-selected="selectable ? selected : undefined"
    :aria-disabled="disabled || undefined"
    @click="handleClick"
    @keydown.enter.prevent="handleKeydown"
    @keydown.space.prevent="handleKeydown"
  >
    <div v-if="$slots.prefix || icon" class="list-item-prefix" data-part="list-item-prefix">
      <slot name="prefix">
        <span class="list-item-icon">{{ icon }}</span>
      </slot>
    </div>
    <div class="list-item-content" data-part="list-item-content">
      <div v-if="title || $slots.title" class="list-item-title" data-part="list-item-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="description || $slots.description" class="list-item-description" data-part="list-item-description">
        <slot name="description">{{ description }}</slot>
      </div>
      <slot />
    </div>
    <div v-if="$slots.suffix || extra" class="list-item-suffix" data-part="list-item-suffix">
      <slot name="suffix">
        <span class="list-item-extra">{{ extra }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';

interface Props {
  title?: string;
  description?: string;
  icon?: string;
  extra?: string;
  clickable?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  /** 数据变化 W1 单次提示（systemChannel patch 后由外部置 true，~600ms 回落） */
  flash?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  icon: '',
  extra: '',
  clickable: false,
  selectable: false,
  selected: false,
  disabled: false,
  flash: false,
  customClass: '',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

// 注入父组件上下文
const listContext = inject('listContext', { size: 'default', split: true });

const itemClass = computed(() => {
  const classes = ['list-item'];
  // 焦点权重语法（perception §4）：可选中载体挂 ocp-selectable，选中态由全局 W2 样式承接
  if (props.clickable || props.selectable) {
    classes.push('list-item--clickable', 'ocp-selectable');
  }
  if (props.selectable && props.selected) {
    classes.push('ocp-weight-selected');
  }
  if (props.flash) {
    classes.push('ocp-weight-flash');
  }
  if (props.disabled) {
    classes.push('list-item--disabled');
  }
  if (listContext.size !== 'default') {
    classes.push(`list-item--${listContext.size}`);
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const handleClick = (event: MouseEvent) => {
  if (props.disabled) return;
  if (props.clickable || props.selectable) {
    emit('click', event);
  }
};

const handleKeydown = () => {
  if ((!props.clickable && !props.selectable) || props.disabled) return;
  emit('click', new MouseEvent('click'));
};
</script>

<style scoped>
.list-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--list-row-padding-y, var(--space-3)) var(--space-4);
  transition: var(--transition-wash);
}

.list-item:has(.list-item-description) {
  align-items: flex-start;
}

.list-item:has(.list-item-description) .list-item-prefix {
  margin-top: 2px;
}

.list-item--clickable {
  cursor: pointer;
}

/* hover(W1) / 选中(W2) 样式统一由 themes/shared/focus-weight.css 的
   .ocp-selectable:hover / .ocp-weight-selected 承担，禁止组件私有选中色 */

.list-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-item-prefix {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: hsl(var(--text-muted));
}

.list-item-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.list-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-item-title {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  line-height: 1.5;
}

.list-item-description {
  font-size: 13px;
  color: hsl(var(--text-secondary));
  line-height: 1.5;
}

.list-item-suffix {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.list-item-extra {
  font-size: 13px;
  color: hsl(var(--text-muted));
}

.list-item--small {
  padding: 8px 12px;
}

.list-item--large {
  padding: 16px 20px;
}

.list-item--small .list-item-prefix {
  width: 20px;
  height: 20px;
}

.list-item--small .list-item-icon {
  font-size: 16px;
  width: 20px;
}

.list-item--large .list-item-prefix {
  width: 28px;
  height: 28px;
}

.list-item--large .list-item-icon {
  font-size: 24px;
  width: 28px;
}

.list-item--small .list-item-title {
  font-size: 13px;
}

.list-item--small .list-item-description {
  font-size: 12px;
}

.list-item--large .list-item-title {
  font-size: 15px;
}

.list-item--large .list-item-description {
  font-size: 14px;
}
</style>
