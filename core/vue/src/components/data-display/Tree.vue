<template>
  <div :class="treeClass" role="tree" :aria-label="ariaLabel">
    <div v-if="filterable" class="tree-filter">
      <input
        v-model="filterText"
        type="text"
        class="tree-filter-input"
        :placeholder="filterPlaceholder"
        @input="handleFilter"
      />
    </div>
    
    <div v-if="loading" class="tree-loading">
      <span class="tree-loading-spinner" />
      <span class="tree-loading-text">{{ loadingText }}</span>
    </div>
    
    <div v-else-if="filteredData.length === 0" class="tree-empty">
      <span class="tree-empty-text">{{ emptyText }}</span>
    </div>
    
    <div v-else class="tree-content">
      <TreeNode
        v-for="node in filteredData"
        :key="getNodeKey(node)"
        :node="node"
        :level="0"
        :expanded-keys="internalExpandedKeys"
        :selected-keys="internalSelectedKeys"
        :checked-keys="internalCheckedKeys"
        :checkable="checkable"
        :selectable="selectable"
        :draggable="draggable"
        :show-line="showLine"
        :show-icon="showIcon"
        :block-node="blockNode"
        :node-key="nodeKey"
        :label-field="labelField"
        :children-field="childrenField"
        :disabled-field="disabledField"
        :expand-on-click="expandOnClick"
        @toggle="handleToggle"
        @select="handleSelect"
        @check="handleCheck"
        @drag-start="handleDragStart"
        @drag-over="handleDragOver"
        @drop="handleDrop"
        @drag-end="handleDragEnd"
      >
        <template v-if="$slots['node-label']" #node-label="{ node }">
          <slot name="node-label" :node="node" />
        </template>
        <template v-if="$slots['node-icon']" #node-icon="{ node }">
          <slot name="node-icon" :node="node" />
        </template>
        <template v-if="$slots['node-action']" #node-action="{ node }">
          <slot name="node-action" :node="node" />
        </template>
      </TreeNode>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends object">
import { computed, ref, provide, readonly, watch } from 'vue';
import { TREE_CONTEXT_KEY, TREE_PROPS_KEY } from '@ocpui/vue/types';
import TreeNode from './TreeNodeItem.vue';
import type { TreeRecord } from './tree-types';

interface Props {
  data: T[];
  nodeKey?: string;
  labelField?: string;
  childrenField?: string;
  disabledField?: string;
  expandedKeys?: (string | number)[];
  selectedKeys?: (string | number)[];
  checkedKeys?: (string | number)[];
  checkable?: boolean;
  selectable?: boolean;
  draggable?: boolean;
  showLine?: boolean;
  showIcon?: boolean;
  blockNode?: boolean;
  expandOnClick?: boolean;
  checkStrictly?: boolean;
  defaultExpandAll?: boolean;
  filterable?: boolean;
  filterPlaceholder?: string;
  filterMethod?: (node: T, filterText: string) => boolean;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  ariaLabel?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  nodeKey: 'key',
  labelField: 'label',
  childrenField: 'children',
  disabledField: 'disabled',
  expandedKeys: () => [],
  selectedKeys: () => [],
  checkedKeys: () => [],
  checkable: false,
  selectable: true,
  draggable: false,
  showLine: false,
  showIcon: true,
  blockNode: false,
  expandOnClick: true,
  checkStrictly: false,
  defaultExpandAll: false,
  filterable: false,
  filterPlaceholder: '搜索节点',
  filterMethod: undefined,
  loading: false,
  loadingText: '加载中...',
  emptyText: '暂无数据',
  ariaLabel: '树形结构',
  customClass: '',
});

const emit = defineEmits<{
  'update:expandedKeys': [keys: (string | number)[]];
  'update:selectedKeys': [keys: (string | number)[]];
  'update:checkedKeys': [keys: (string | number)[]];
  'expand': [node: T, expanded: boolean];
  'select': [node: T, selected: boolean];
  'check': [node: T, checked: boolean];
  'drag-start': [node: T, event: DragEvent];
  'drag-over': [node: T, event: DragEvent];
  'drop': [node: T, event: DragEvent];
  'drag-end': [node: T, event: DragEvent];
}>();

const filterText = ref('');
const internalExpandedKeys = ref<(string | number)[]>([...props.expandedKeys]);
const internalSelectedKeys = ref<(string | number)[]>([...props.selectedKeys]);
const internalCheckedKeys = ref<(string | number)[]>([...props.checkedKeys]);
const dragNode = ref<object | null>(null);

// 受控同步：父组件更新 keys 时须写入内部状态，否则勾选/选中会停留在初始空值
watch(
  () => props.checkedKeys,
  (keys) => {
    internalCheckedKeys.value = [...keys];
  },
);
watch(
  () => props.selectedKeys,
  (keys) => {
    internalSelectedKeys.value = [...keys];
  },
);
watch(
  () => props.expandedKeys,
  (keys) => {
    internalExpandedKeys.value = [...keys];
  },
);

const treeClass = computed(() => {
  const classes = ['tree'];
  if (props.showLine) classes.push('tree--line');
  if (props.blockNode) classes.push('tree--block');
  if (props.loading) classes.push('tree--loading');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const getNodeKey = (node: object): string | number => {
  return (node as TreeRecord)[props.nodeKey] as string | number;
};

const getNodeChildren = (node: object): object[] => {
  return ((node as TreeRecord)[props.childrenField] as object[]) || [];
};

const filterNode = (node: object, text: string): boolean => {
  if (!text) return true;
  
  if (props.filterMethod) {
    // 同构树：遍历到的子记录与 T 同构，边界统一转回 T
    return props.filterMethod(node as T, text);
  }
  
  const label = (node as TreeRecord)[props.labelField] as string;
  if (label?.toLowerCase().includes(text.toLowerCase())) {
    return true;
  }
  
  const children = getNodeChildren(node);
  if (children && children.length > 0) {
    return children.some(child => filterNode(child, text));
  }
  
  return false;
};

const filteredData = computed(() => {
  if (!filterText.value) return props.data;
  return props.data.filter(node => filterNode(node, filterText.value));
});

const handleFilter = () => {
  if (filterText.value) {
    const allKeys: (string | number)[] = [];
    const collectKeys = (nodes: object[]) => {
      nodes.forEach(node => {
        if (filterNode(node, filterText.value)) {
          allKeys.push(getNodeKey(node));
        }
        const children = getNodeChildren(node);
        if (children) collectKeys(children);
      });
    };
    collectKeys(props.data);
    internalExpandedKeys.value = allKeys;
  }
};

const handleToggle = (node: object) => {
  const key = getNodeKey(node);
  const index = internalExpandedKeys.value.indexOf(key);
  const expanded = index === -1;
  
  if (expanded) {
    internalExpandedKeys.value.push(key);
  } else {
    internalExpandedKeys.value.splice(index, 1);
  }
  
  emit('update:expandedKeys', [...internalExpandedKeys.value]);
  emit('expand', node as T, expanded);
};

const handleSelect = (node: object) => {
  const key = getNodeKey(node);
  const index = internalSelectedKeys.value.indexOf(key);
  const selected = index === -1;
  
  internalSelectedKeys.value = selected ? [key] : [];
  
  emit('update:selectedKeys', [...internalSelectedKeys.value]);
  emit('select', node as T, selected);
};

const handleCheck = (node: object) => {
  const key = getNodeKey(node);
  const index = internalCheckedKeys.value.indexOf(key);
  const checked = index === -1;
  
  if (checked) {
    internalCheckedKeys.value.push(key);
    if (!props.checkStrictly) {
      checkChildren(node, true);
      checkParent(node);
    }
  } else {
    internalCheckedKeys.value.splice(index, 1);
    if (!props.checkStrictly) {
      checkChildren(node, false);
    }
  }
  
  emit('update:checkedKeys', [...internalCheckedKeys.value]);
  emit('check', node as T, checked);
};

const checkChildren = (node: object, checked: boolean) => {
  const children = getNodeChildren(node);
  if (children) {
    children.forEach(child => {
      const childKey = getNodeKey(child);
      const index = internalCheckedKeys.value.indexOf(childKey);
      if (checked && index === -1) {
        internalCheckedKeys.value.push(childKey);
      } else if (!checked && index > -1) {
        internalCheckedKeys.value.splice(index, 1);
      }
      checkChildren(child, checked);
    });
  }
};

const checkParent = (node: object) => {
  const findParent = (nodes: object[], target: object, parent?: object): object | undefined => {
    for (const n of nodes) {
      if (n === target) return parent;
      const children = getNodeChildren(n);
      if (children) {
        const found = findParent(children, target, n);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  const parent = findParent(props.data, node);
  if (parent) {
    const parentKey = getNodeKey(parent);
    const children = getNodeChildren(parent);
    const allChecked = children?.every(child => 
      internalCheckedKeys.value.includes(getNodeKey(child))
    );
    
    const index = internalCheckedKeys.value.indexOf(parentKey);
    if (allChecked && index === -1) {
      internalCheckedKeys.value.push(parentKey);
    } else if (!allChecked && index > -1) {
      internalCheckedKeys.value.splice(index, 1);
    }
    
    checkParent(parent);
  }
};

const handleDragStart = (node: object, event: DragEvent) => {
  dragNode.value = node;
  emit('drag-start', node as T, event);
};

const handleDragOver = (node: object, event: DragEvent) => {
  event.preventDefault();
  emit('drag-over', node as T, event);
};

const handleDrop = (node: object, event: DragEvent) => {
  event.preventDefault();
  if (dragNode.value && dragNode.value !== node) {
    emit('drop', node as T, event);
  }
};

const handleDragEnd = (node: object, event: DragEvent) => {
  dragNode.value = null;
  emit('drag-end', node as T, event);
};

const expandAll = () => {
  const allKeys: (string | number)[] = [];
  const collectKeys = (nodes: object[]) => {
    nodes.forEach(node => {
      const children = getNodeChildren(node);
      if (children && children.length > 0) {
        allKeys.push(getNodeKey(node));
        collectKeys(children);
      }
    });
  };
  collectKeys(props.data);
  internalExpandedKeys.value = allKeys;
  emit('update:expandedKeys', allKeys);
};

const collapseAll = () => {
  internalExpandedKeys.value = [];
  emit('update:expandedKeys', []);
};

const getSelectedNodes = (): T[] => {
  const selected: T[] = [];
  const findNodes = (nodes: object[]) => {
    nodes.forEach(node => {
      if (internalSelectedKeys.value.includes(getNodeKey(node))) {
        selected.push(node as T);
      }
      const children = getNodeChildren(node);
      if (children) findNodes(children);
    });
  };
  findNodes(props.data);
  return selected;
};

const getCheckedNodes = (): T[] => {
  const checked: T[] = [];
  const findNodes = (nodes: object[]) => {
    nodes.forEach(node => {
      if (internalCheckedKeys.value.includes(getNodeKey(node))) {
        checked.push(node as T);
      }
      const children = getNodeChildren(node);
      if (children) findNodes(children);
    });
  };
  findNodes(props.data);
  return checked;
};

provide(TREE_PROPS_KEY, props);
provide(TREE_CONTEXT_KEY, {
  getNodeKey,
  getNodeChildren,
  expandedKeys: readonly(internalExpandedKeys),
  selectedKeys: readonly(internalSelectedKeys),
  checkedKeys: readonly(internalCheckedKeys),
});

defineExpose({
  expandAll,
  collapseAll,
  getSelectedNodes,
  getCheckedNodes,
  filterText,
  expandedKeys: internalExpandedKeys,
  selectedKeys: internalSelectedKeys,
  checkedKeys: internalCheckedKeys,
});
</script>

<style scoped>
.tree {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  color: hsl(var(--text));
}

.tree-filter {
  padding: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.tree-filter-input {
  width: 100%;
  padding: 8px 12px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  font-size: 14px;
  color: hsl(var(--text));
  outline: none;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.tree-filter-input::placeholder {
  color: hsl(var(--text-muted));
}

.tree-filter-input:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.tree-content {
  padding: 8px 0;
}

.tree-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.tree-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: tree-spin 0.8s linear infinite;
}

@keyframes tree-spin {
  to { transform: rotate(360deg); }
}

.tree-loading-text {
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.tree-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.tree-empty-text {
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.tree--line {
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
}

.tree--block .tree-node {
  width: 100%;
}
/* 响应式样式 */
@media (max-width: 575.98px) {
  .tree {
    font-size: var(--font-size-sm);
  }
  
  .tree-filter {
    padding: 10px;
  }
  
  .tree-filter-input {
    padding: 10px 12px;
    min-height: 40px;
    font-size: var(--font-size-sm);
  }
  
  .tree-content {
    padding: 4px 0;
  }
  
  .tree-loading {
    padding: 30px;
  }
  
  .tree-loading-spinner {
    width: 28px;
    height: 28px;
  }
  
  .tree-loading-text {
    font-size: var(--font-size-sm);
  }
  
  .tree-empty {
    padding: 30px;
  }
  
  .tree-empty-text {
    font-size: var(--font-size-sm);
  }
  
  .tree--line {
    border-radius: 10px;
  }
}
</style>
