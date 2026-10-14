&lt;!--
TreeSelect 组件

功能：提供一个树形选择器，支持单选、多选、搜索、展开/折叠等功能

Props:
- modelValue: string | number | (string | number)[] - 绑定的值，默认 undefined
- data: TreeNodeData[] - 树形数据源，默认 []
- placeholder: string - 占位符文本，默认 '请选择'
- disabled: boolean - 是否禁用，默认 false
- multiple: boolean - 是否多选，默认 false
- checkable: boolean - 是否可勾选，默认 false
- loading: boolean - 是否加载中，默认 false
- filterable: boolean - 是否可过滤，默认 false
- filterPlaceholder: string - 过滤输入框的占位符，默认 '搜索...'
- filterMethod: (query: string, node: TreeNodeData) =&gt; boolean - 自定义过滤方法
- emptyText: string - 空状态文本，默认 '暂无数据'
- customClass: string - 自定义类名

Events:
- update:modelValue: (value: string | number | (string | number)[]) - 值变化时触发
- change: (value: string | number | (string | number)[], selectedNodes: TreeNodeData[]) - 选择变化时触发
- select: (node: TreeNodeData, selected: boolean) - 节点选择状态变化时触发
- expand: (node: TreeNodeData, expanded: boolean) - 节点展开状态变化时触发

TreeNodeData 接口：
- key: string | number - 节点唯一标识
- label: string - 节点显示文本
- disabled?: boolean - 是否禁用
- children?: TreeNodeData[] - 子节点数组

使用示例：
&lt;TreeSelect v-model="selectedKey" :data="treeData" /&gt;
&lt;TreeSelect v-model="selectedKeys" :data="treeData" multiple checkable /&gt;
&lt;TreeSelect v-model="selectedKey" :data="treeData" filterable /&gt;
--&gt;
<template>
  <div ref="rootRef" :class="treeSelectClass" v-bind="$attrs">
    <div 
      ref="triggerRef"
      class="tree-select-trigger" 
      :class="{ 'tree-select-trigger--focused': visible }"
      @click="handleToggle" 
      @keydown="handleTriggerKeydown"
      tabindex="0"
      role="combobox"
      :aria-expanded="visible"
      :aria-disabled="disabled"
      :aria-haspopup="'listbox'"
      :aria-controls="visible ? dropdownId : undefined"
      :aria-label="placeholder"
    >
      <span v-if="selectedLabels.length > 0" class="tree-select-value" :aria-label="selectedLabels.join(', ')">
        {{ selectedLabels.join(', ') }}
      </span>
      <span v-else class="tree-select-placeholder">{{ placeholder }}</span>
      <span class="tree-select-arrow" :class="{ 'tree-select-arrow--open': visible }" aria-hidden="true">
        <Icon name="arrow-down" :size="12" />
      </span>
    </div>
    
    <Teleport to="body">
      <Transition name="tree-select">
        <div
          v-if="visible"
          ref="dropdownRef"
          :id="dropdownId"
          class="tree-select-dropdown"
          :style="floatingBaseStyle"
          role="listbox"
          :aria-label="placeholder"
          @keydown="handleDropdownKeydown"
        >
          <!-- 搜索框 -->
          <div v-if="filterable" class="tree-select-search">
            <Input
              v-model="filterQuery"
              :placeholder="filterPlaceholder"
              size="sm"
              clearable
              @keydown.stop
              :aria-label="t('components.dataEntry.treeSelect.searchAriaLabel')"
              autocomplete="off"
            >
              <template #prefix>
                <Icon name="search" :size="14" />
              </template>
            </Input>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="tree-select-loading" aria-live="polite">
            <span class="tree-select-loading-spinner" />
            <span>{{ t('components.dataEntry.treeSelect.loading') }}</span>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="filteredTreeData.length === 0" class="tree-select-empty" aria-live="polite">
            <Icon name="inbox" :size="24" />
            <span>{{ emptyText }}</span>
          </div>
          
          <!-- 树形数据 -->
          <div v-else class="tree-select-tree" :class="{ 'tree-select-tree--with-search': filterable }" role="presentation">
            <TreeNode
              v-for="node in filteredTreeData"
              :key="node.key"
              :node="node"
              :selected-keys="selectedKeys"
              :expand-keys="expandKeys"
              :checkable="checkable"
              :multiple="multiple"
              @select="handleSelect"
              @expand="handleExpand"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import Icon from '../utility/Icon.vue';
import Input from './Input.vue';
import TreeNode from './TreeItem.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition } from '../composables/useFloatingPosition';

const { uiT: t } = useUiT();

interface TreeNodeData {
  key: string | number;
  label: string;
  disabled?: boolean;
  children?: TreeNodeData[];
}

interface Props {
  modelValue?: string | number | (string | number)[];
  data?: TreeNodeData[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  checkable?: boolean;
  loading?: boolean;
  filterable?: boolean;
  filterPlaceholder?: string;
  filterMethod?: (query: string, node: TreeNodeData) => boolean;
  emptyText?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  data: () => [],
  placeholder: '请选择',
  disabled: false,
  multiple: false,
  checkable: false,
  loading: false,
  filterable: false,
  filterPlaceholder: '搜索...',
  filterMethod: undefined,
  emptyText: '暂无数据',
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]];
  'change': [value: string | number | (string | number)[], selectedNodes: TreeNodeData[]];
  'select': [node: TreeNodeData, selected: boolean];
  'expand': [node: TreeNodeData, expanded: boolean];
}>();

const dropdownRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const rootRef = ref<HTMLElement>();
const visible = ref(false);
const dropdownId = useComponentId('tree-select-dropdown');
const selectedKeys = ref<(string | number)[]>([]);
const expandKeys = ref<(string | number)[]>([]);
const filterQuery = ref('');
const floatingBaseStyle = { position: 'fixed' as const };

const floating = useFloatingPosition({
  reference: rootRef,
  floating: dropdownRef,
  placement: 'bottom-start',
  matchWidth: true,
  offsetPx: 4,
});

const treeSelectClass = computed(() => {
  const classes = ['tree-select'];
  if (props.disabled) {
    classes.push('tree-select--disabled');
  }
  if (visible.value) {
    classes.push('tree-select--focused');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const selectedLabels = computed(() => {
  const labels: string[] = [];
  const findLabels = (nodes: TreeNodeData[], keys: (string | number)[]) => {
    nodes.forEach(node => {
      if (keys.includes(node.key)) {
        labels.push(node.label);
      }
      if (node.children) {
        findLabels(node.children, keys);
      }
    });
  };
  findLabels(props.data, selectedKeys.value);
  return labels;
});

const filteredTreeData = computed(() => {
  if (!props.filterable || !filterQuery.value) return props.data;
  
  const filterNodes = (nodes: TreeNodeData[]): TreeNodeData[] => {
    return nodes.reduce((result: TreeNodeData[], node) => {
      const match = props.filterMethod
        ? props.filterMethod(filterQuery.value, node)
        : node.label.toLowerCase().includes(filterQuery.value.toLowerCase());
      
      const filteredChildren = node.children ? filterNodes(node.children) : [];
      
      if (match || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children,
        });
      }
      
      return result;
    }, []);
  };
  
  return filterNodes(props.data);
});

const handleToggle = () => {
  if (props.disabled) return;
  visible.value = !visible.value;
  if (visible.value) {
    nextTick(() => {
      // 聚焦到搜索框
      if (props.filterable) {
        const searchInput = dropdownRef.value?.querySelector('input') as HTMLInputElement;
        searchInput?.focus();
      }
    });
  }
};

const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleToggle();
      break;
    case 'Escape':
      visible.value = false;
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (!visible.value) handleToggle();
      break;
  }
};

const handleDropdownKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      visible.value = false;
      break;
  }
};

const handleSelect = (node: TreeNodeData, selected: boolean) => {
  if (props.multiple) {
    if (selected) {
      selectedKeys.value = [...selectedKeys.value, node.key];
    } else {
      selectedKeys.value = selectedKeys.value.filter(key => key !== node.key);
    }
  } else {
    selectedKeys.value = selected ? [node.key] : [];
    visible.value = false;
  }
  
  const value = props.multiple ? selectedKeys.value : selectedKeys.value[0];
  emit('update:modelValue', value);
  emit('change', value, getSelectedNodes());
  emit('select', node, selected);
};

const handleExpand = (node: TreeNodeData, expanded: boolean) => {
  if (expanded) {
    expandKeys.value = [...expandKeys.value, node.key];
  } else {
    expandKeys.value = expandKeys.value.filter(key => key !== node.key);
  }
  emit('expand', node, expanded);
};

const getSelectedNodes = (): TreeNodeData[] => {
  const nodes: TreeNodeData[] = [];
  const findNodes = (treeNodes: TreeNodeData[]) => {
    treeNodes.forEach(node => {
      if (selectedKeys.value.includes(node.key)) {
        nodes.push(node);
      }
      if (node.children) {
        findNodes(node.children);
      }
    });
  };
  findNodes(props.data);
  return nodes;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node) && triggerRef.value && !triggerRef.value.contains(event.target as Node)) {
    visible.value = false;
  }
};

watch(visible, (val) => {
  if (val) {
    document.addEventListener('click', handleClickOutside);
    nextTick(() => {
      floating.start();
    });
  } else {
    document.removeEventListener('click', handleClickOutside);
    floating.stop();
    nextTick(() => {
      triggerRef.value?.focus();
    });
  }
});

watch(() => props.modelValue, (val) => {
  if (val === undefined) {
    selectedKeys.value = [];
  } else if (Array.isArray(val)) {
    selectedKeys.value = [...val];
  } else {
    selectedKeys.value = [val];
  }
}, { immediate: true });

// 监听 data 变化时重置展开状态
watch(() => props.data, () => {
  expandKeys.value = [];
}, { deep: true });

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.tree-select {
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.tree-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 8px 12px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.tree-select:hover:not(.tree-select--disabled) .tree-select-trigger {
  border-color: hsl(var(--border-hover));
}

.tree-select--focused .tree-select-trigger {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.tree-select--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.tree-select-value {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-select-placeholder {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.tree-select-arrow {
  margin-left: 8px;
  transition: transform 0.2s;
  color: hsl(var(--text-muted));
}

.tree-select-arrow--open {
  transform: rotate(180deg);
}

.tree-select-dropdown {
  position: fixed;
  z-index: var(--z-dropdown);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  max-height: 320px;
  overflow: hidden;
}

.tree-select-loading {
  padding: 32px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tree-select-loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: tree-select-spin 0.8s linear infinite;
}

@keyframes tree-select-spin {
  to { transform: rotate(360deg); }
}

.tree-select-tree {
  padding: 8px;
  max-height: 320px;
  overflow-y: auto;
}

.tree-select-tree--with-search {
  max-height: 260px;
}

.tree-select-search {
  padding: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.tree-select-empty {
  padding: 32px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tree-select-trigger--focused {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.tree-select-arrow {
  margin-left: 8px;
  transition: transform 0.2s;
  color: hsl(var(--text-muted));
}

.tree-select-arrow--open {
  transform: rotate(180deg);
}

.tree-select-enter-active,
.tree-select-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.tree-select-enter-from,
.tree-select-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
