&lt;!--
BatchSelector 批量选择器组件

## 组件说明
用于实现批量选择功能，支持全选、单选、范围选择等操作，并提供选择工具栏。

## 公开属性
- data: any[] - 数据源数组
- itemKey: string - 数据项的键名，默认为 'id'
- itemLabel: string - 数据项的标签名，默认为 'name'
- modelValue: any[] - 绑定的选中值数组
- showSelectAll: boolean - 是否显示全选复选框，默认为 true
- showCount: boolean - 是否显示选择计数，默认为 true
- showToolbar: boolean - 是否显示选择工具栏，默认为 true
- toolbarActions: ToolbarAction[] - 工具栏操作按钮配置
- selectionMode: 'single' | 'multiple' - 选择模式，默认为 'multiple'
- customClass: string - 自定义类名

## 事件
- update:modelValue - 选中值变化时触发
- change - 选中值变化时触发
- toolbar-action - 工具栏操作点击时触发，参数为 (action, items)

## 暴露方法
- selected - 计算属性，返回选中的项目数组
- count - 计算属性，返回选中的项目数量
- clear - 清除所有选择
- selectAll - 全选/取消全选

## 使用方式
```vue
&lt;BatchSelector
  :data="items"
  v-model="selectedItems"
  :toolbar-actions="actions"
  @toolbar-action="handleAction"
&gt;
  &lt;!-- 自定义项目内容 --&gt;
  &lt;template #item="{ item, selected }"&gt;
    &lt;span&gt;{{ item.name }}&lt;/span&gt;
  &lt;/template&gt;
&lt;/BatchSelector&gt;
```
--&gt;

<template>
  <div class="batch-selector" :class="customClass">
    <!-- 全选复选框 -->
    <div v-if="showSelectAll && selectionMode === 'multiple'" class="batch-selector-header">
      <Checkbox
        :model-value="isAllSelected"
        :indeterminate="isIndeterminate"
        @change="handleSelectAll"
      >
        <span class="select-all-label">{{ t('components.interaction.batchSelector.selectAll') }}</span>
      </Checkbox>
      <span v-if="showCount" class="selection-count">
        {{ selectedCount }} / {{ data.length }}
      </span>
    </div>

    <!-- 选择工具栏 -->
    <SelectionToolbar
      :visible="showToolbar && selectedCount > 0"
      :count="selectedCount"
      :selected-items="selectedItems"
      :actions="toolbarActions"
      @action-click="handleToolbarAction"
      @clear="handleClear"
    />

    <!-- 数据列表 -->
    <div class="batch-selector-list">
      <slot
        :items="data"
        :selected="Array.from(selected)"
        :toggle="toggleSelection"
        :is-selected="isSelected"
      >
        <div
          v-for="item in data"
          :key="getItemKey(item)"
          :class="itemClass(item)"
          @click="(event) => handleItemClick(item, event)"
        >
          <Checkbox
            :model-value="isSelected(item)"
            @change="toggleSelection(item)"
            @click.stop
          />
          <slot name="item" :item="item" :selected="isSelected(item)">
            <span class="item-label">{{ getItemLabel(item) }}</span>
          </slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Checkbox } from '../data-entry';
import SelectionToolbar from './SelectionToolbar.vue';
import type { ToolbarAction } from '../types';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface Props {
  data: any[];
  itemKey?: string;
  itemLabel?: string;
  modelValue?: any[];
  showSelectAll?: boolean;
  showCount?: boolean;
  showToolbar?: boolean;
  toolbarActions?: ToolbarAction[];
  selectionMode?: 'single' | 'multiple';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  itemKey: 'id',
  itemLabel: 'name',
  modelValue: () => [],
  showSelectAll: true,
  showCount: true,
  showToolbar: true,
  toolbarActions: () => [],
  selectionMode: 'multiple',
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: any[]];
  change: [value: any[]];
  'toolbar-action': [action: ToolbarAction, items: any[]];
}>();

const selected = ref<Set<any>>(new Set(props.modelValue ?? []));
const lastSelectedIndex = ref<number>(-1);

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  selected.value = new Set(newValue ?? []);
}, { deep: true });

// 监听数据变化，重置最后选择索引
watch(() => props.data, () => {
  lastSelectedIndex.value = -1;
}, { deep: true });

const selectedItems = computed(() => {
  return props.data.filter(item => selected.value.has(getItemKey(item)));
});

const selectedCount = computed(() => selected.value.size);

const isAllSelected = computed(() => {
  return props.data.length > 0 && selected.value.size === props.data.length;
});

const isIndeterminate = computed(() => {
  return selected.value.size > 0 && selected.value.size < props.data.length;
});

const getItemKey = (item: any): any => {
  return item[props.itemKey];
};

const getItemLabel = (item: any): string => {
  return item[props.itemLabel];
};

const isSelected = (item: any): boolean => {
  return selected.value.has(getItemKey(item));
};

const itemClass = (item: any) => {
  const classes = ['batch-selector-item'];
  if (isSelected(item)) {
    classes.push('batch-selector-item--selected');
  }
  return classes;
};

const toggleSelection = (item: any) => {
  const key = getItemKey(item);
  if (props.selectionMode === 'single') {
    selected.value.clear();
    selected.value.add(key);
  } else {
    if (selected.value.has(key)) {
      selected.value.delete(key);
    } else {
      selected.value.add(key);
    }
  }
  updateValue();
};

const handleSelectAll = () => {
  if (isAllSelected.value) {
    selected.value.clear();
  } else {
    props.data.forEach(item => {
      selected.value.add(getItemKey(item));
    });
  }
  updateValue();
};

const handleItemClick = (item: any, event: MouseEvent) => {
  if (event.shiftKey && lastSelectedIndex.value >= 0 && props.selectionMode === 'multiple') {
    // 范围选择
    const currentIndex = props.data.findIndex(i => getItemKey(i) === getItemKey(item));
    if (currentIndex !== -1) {
      const start = Math.min(lastSelectedIndex.value, currentIndex);
      const end = Math.max(lastSelectedIndex.value, currentIndex);
      
      for (let i = start; i <= end; i++) {
        selected.value.add(getItemKey(props.data[i]));
      }
      updateValue();
    }
  } else {
    toggleSelection(item);
    lastSelectedIndex.value = props.data.findIndex(i => getItemKey(i) === getItemKey(item));
  }
};

const handleClear = () => {
  selected.value.clear();
  lastSelectedIndex.value = -1;
  updateValue();
};

const handleToolbarAction = (action: ToolbarAction, items: any[]) => {
  emit('toolbar-action', action, items);
};

const updateValue = () => {
  const value = Array.from(selected.value);
  emit('update:modelValue', value);
  emit('change', value);
};

defineExpose({
  selected: selectedItems,
  count: selectedCount,
  clear: handleClear,
  selectAll: handleSelectAll,
});
</script>

<style scoped>
.batch-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.batch-selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.select-all-label {
  font-size: 14px;
  color: hsl(var(--text));
  font-weight: 500;
}

.selection-count {
  font-size: 13px;
  color: hsl(var(--text-muted));
}

.batch-selector-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.batch-selector-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.batch-selector-item:hover {
  background: hsl(var(--surface-hover));
}

.batch-selector-item--selected {
  background: hsl(var(--primary) / 0.05);
}

.batch-selector-item--selected:hover {
  background: hsl(var(--primary) / 0.08);
}

.item-label {
  font-size: 14px;
  color: hsl(var(--text));
  flex: 1;
}

.batch-selector-item--selected .item-label {
  color: hsl(var(--primary));
  font-weight: 500;
}
</style>
