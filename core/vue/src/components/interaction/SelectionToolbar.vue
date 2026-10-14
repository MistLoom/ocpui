&lt;!--
SelectionToolbar 选择工具栏组件

## 组件说明
用于显示选择状态和提供批量操作按钮的工具栏组件。

## 公开属性
- visible: boolean - 是否显示工具栏
- count: number - 已选择的项目数量
- selectedItems: any[] - 已选择的项目数组
- actions: ToolbarAction[] - 操作按钮配置数组
- position: 'top' | 'bottom' - 工具栏位置，默认为 'top'
- customClass: string - 自定义类名

## 事件
- action-click: 操作按钮点击时触发，参数为 (action, items)
- clear: 清除选择时触发

## 使用方式
```vue
&lt;SelectionToolbar
  :visible="showToolbar"
  :count="selectedCount"
  :selected-items="selectedItems"
  :actions="toolbarActions"
  @action-click="handleToolbarAction"
  @clear="handleClear"
/&gt;
```

## 操作按钮配置类型
```typescript
interface ToolbarAction {
  key: string;          // 操作唯一标识
  label: string;        // 操作按钮文本
  icon?: string;        // 操作按钮图标
  variant?: string;     // 按钮变体
  disabled?: boolean;   // 是否禁用
  handler?: (items: any[]) =&gt; void;  // 点击处理函数
}
```
--&gt;

<template>
  <Transition name="selection-toolbar">
    <div v-if="visible" :class="toolbarClass">
      <p class="selection-count">
        {{ selectedLabel }}
      </p>

      <div class="selection-actions">
        <slot name="actions" :count="count" :selected="selectedItems">
          <Button
            v-for="action in actions"
            :key="action.key"
            :variant="action.variant || 'secondary'"
            size="sm"
            :disabled="action.disabled"
            @click="handleActionClick(action)"
          >
            <Icon v-if="typeof action.icon === 'string'" :name="action.icon" :size="14" />
            {{ action.label }}
          </Button>
        </slot>
      </div>

      <span class="selection-divider" aria-hidden="true" />

      <Button
        variant="text"
        size="sm"
        class="selection-clear"
        @click="handleClear"
      >
        <Icon name="x" :size="16" />
        {{ t('components.interaction.selectionToolbar.clear') }}
      </Button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button, Icon } from '../utility';
import type { ToolbarAction } from '../types';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

export interface SelectionToolbarProps {
  visible: boolean;
  count: number;
  selectedItems?: any[];
  actions?: ToolbarAction[];
  position?: 'top' | 'bottom';
  customClass?: string;
}

const props = withDefaults(defineProps<SelectionToolbarProps>(), {
  selectedItems: () => [],
  actions: () => [],
  position: 'top',
  customClass: '',
});

const selectedLabel = computed(() =>
  t('components.interaction.selectionToolbar.selectedCount', { count: props.count }),
);

const emit = defineEmits<{
  'action-click': [action: ToolbarAction, items: any[]];
  clear: [];
}>();

const toolbarClass = computed(() => {
  const classes = [
    'selection-toolbar',
    'ocp-list-selection-bar',
    `selection-toolbar--${props.position}`,
  ];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const handleActionClick = (action: ToolbarAction) => {
  emit('action-click', action, props.selectedItems);
  if (action.handler) {
    action.handler(props.selectedItems);
  }
};

const handleClear = () => {
  emit('clear');
};
</script>

<style scoped>
/* 视觉样式由 themes/shared/combination-patterns.css 的 ocp-list-selection-bar 承担 */
.selection-toolbar {
  position: sticky;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  min-width: 0;
}

.selection-toolbar--top {
  top: var(--space-4);
}

.selection-toolbar--bottom {
  bottom: var(--space-4);
}

.selection-count {
  margin: 0;
  flex-shrink: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: hsl(var(--primary));
  white-space: nowrap;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  flex-wrap: wrap;
}

.selection-divider {
  width: 1px;
  height: var(--space-6);
  background: hsl(var(--border));
  flex-shrink: 0;
}

.selection-clear {
  flex-shrink: 0;
  color: hsl(var(--text-muted));
}

.selection-clear:hover {
  color: hsl(var(--error));
}

/* 动画 */
.selection-toolbar-enter-active,
.selection-toolbar-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.selection-toolbar-enter-from,
.selection-toolbar-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--space-2)));
}

@media (max-width: 767.98px) {
  .selection-actions {
    gap: var(--pill-gap);
  }

  .selection-divider {
    height: var(--space-5);
  }
}
</style>
