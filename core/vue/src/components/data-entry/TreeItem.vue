<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../utility/Icon.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface TreeNodeData {
  key: string | number;
  label: string;
  disabled?: boolean;
  children?: TreeNodeData[];
}

interface Props {
  node: TreeNodeData;
  selectedKeys: (string | number)[];
  expandKeys: (string | number)[];
  checkable?: boolean;
  multiple?: boolean;
  level?: number;
}

const props = withDefaults(defineProps<Props>(), {
  checkable: false,
  multiple: false,
  level: 0
});

const emit = defineEmits<{
  'select': [node: TreeNodeData, selected: boolean];
  'expand': [node: TreeNodeData, expanded: boolean];
}>();

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

const isExpanded = computed(() => {
  return props.expandKeys.includes(props.node.key);
});

const handleClick = () => {
  if (props.node.disabled) return;
  const isSelected = props.selectedKeys.includes(props.node.key);
  emit('select', props.node, !isSelected);
};

const handleCheck = () => {
  if (props.node.disabled) return;
  const isSelected = props.selectedKeys.includes(props.node.key);
  emit('select', props.node, !isSelected);
};

const toggleExpand = () => {
  if (props.node.disabled) return;
  emit('expand', props.node, !isExpanded.value);
};

const handleChildSelect = (node: TreeNodeData, selected: boolean) => {
  emit('select', node, selected);
};

const handleChildExpand = (node: TreeNodeData, expanded: boolean) => {
  emit('expand', node, expanded);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.node.disabled) return;

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleClick();
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (hasChildren.value && !isExpanded.value) {
        toggleExpand();
      }
      break;
    case 'ArrowLeft':
      event.preventDefault();
      if (hasChildren.value && isExpanded.value) {
        toggleExpand();
      }
      break;
    case 'ArrowDown':
    case 'ArrowUp':
      break;
  }
};
</script>

<template>
  <div class="tree-node-item" :style="{ paddingLeft: `${level * 20}px` }">
    <div
      class="tree-node-content"
      @click="handleClick"
      @keydown="handleKeydown"
      :class="{
        'tree-node-content--disabled': node.disabled,
        'tree-node-content--selected': selectedKeys.includes(node.key)
      }"
      :tabindex="node.disabled ? -1 : 0"
      :aria-selected="selectedKeys.includes(node.key)"
      :aria-expanded="hasChildren ? isExpanded : undefined"
      :aria-disabled="node.disabled"
      role="treeitem"
      :aria-level="level + 1"
    >
      <span v-if="hasChildren" class="tree-node-toggle" @click.stop="toggleExpand" aria-hidden="true">
        <Icon name="arrow-right" :size="12" :class="{ 'tree-node-toggle--open': isExpanded }" />
      </span>
      <span v-else class="tree-node-toggle tree-node-toggle--empty"></span>

      <span v-if="checkable" class="tree-node-checkbox" aria-hidden="true">
        <input
          type="checkbox"
          :checked="selectedKeys.includes(node.key)"
          :disabled="node.disabled"
          @click.stop="handleCheck"
          :aria-label="t('components.dataEntry.treeItem.select', { label: node.label })"
        />
      </span>

      <span class="tree-node-label" :aria-label="node.label">{{ node.label }}</span>
    </div>

    <div v-if="hasChildren && isExpanded" class="tree-node-children" role="group">
      <TreeItem
        v-for="childNode in node.children"
        :key="childNode.key"
        :node="childNode"
        :selected-keys="selectedKeys"
        :expand-keys="expandKeys"
        :checkable="checkable"
        :multiple="multiple"
        :level="level + 1"
        @select="handleChildSelect"
        @expand="handleChildExpand"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-node-item {
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.tree-node-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  font-size: 14px;
  color: hsl(var(--text));
}

.tree-node-content:hover:not(.tree-node-content--disabled) {
  background-color: hsl(var(--surface-hover));
}

.tree-node-content--disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background: hsl(var(--surface-container-high));
}

.tree-node-content--selected {
  background-color: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.tree-node-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 4px;
  transition: transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
  color: hsl(var(--text-muted));
}

.tree-node-toggle--open {
  transform: rotate(90deg);
}

.tree-node-toggle--empty {
  visibility: hidden;
}

.tree-node-checkbox {
  margin-right: 8px;
}

.tree-node-checkbox input {
  margin: 0;
  accent-color: hsl(var(--primary));
}

.tree-node-label {
  flex: 1;
}

.tree-node-children {
  margin-left: 4px;
}
</style>
