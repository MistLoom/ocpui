<template>
  <div
    class="tree-node"
    :class="nodeClass"
    :style="nodeStyle"
    role="treeitem"
    :aria-expanded="hasChildren ? isExpanded : undefined"
    :aria-selected="isSelected"
    :aria-disabled="isDisabled"
    :tabindex="isDisabled ? -1 : (isSelected ? 0 : -1)"
    :draggable="draggable && !isDisabled"
    @keydown="handleKeydown"
    @dragstart="handleDragStart"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragend="handleDragEnd"
  >
    <div
      class="tree-node-content"
      :class="{ 'tree-node-content--selected': isSelected }"
      @click="handleClick"
    >
      <span
        class="tree-node-indent"
        :style="{ width: `${level * (isMobile ? 16 : 20)}px` }"
      >
        <span v-if="showLine && level > 0" class="tree-node-line"></span>
      </span>
      
      <span class="tree-node-switcher" @click.stop="handleToggle">
        <template v-if="hasChildren">
          <svg
            viewBox="0 0 12 12"
            fill="none"
            class="tree-node-switcher-icon"
            :class="{ 'tree-node-switcher-icon--expanded': isExpanded }"
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        <span v-else class="tree-node-switcher-placeholder"></span>
      </span>
      
      <span v-if="showIcon" class="tree-node-icon">
        <slot name="node-icon" :node="node">
          <svg v-if="hasChildren" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </slot>
      </span>
      
      <label v-if="checkable" class="tree-node-checkbox" @click.stop>
        <input
          ref="checkboxRef"
          type="checkbox"
          :checked="isChecked"
          :disabled="isDisabled"
          @change="handleCheck"
        />
        <span
          class="tree-node-checkbox-indicator"
          :class="{ 'tree-node-checkbox-indicator--indeterminate': isIndeterminate }"
        ></span>
      </label>
      
      <span class="tree-node-label">
        <slot name="node-label" :node="node">
          {{ nodeLabel }}
        </slot>
      </span>
      
      <span v-if="$slots['node-action']" class="tree-node-action">
        <slot name="node-action" :node="node" />
      </span>
    </div>
    
    <Transition name="tree-node-children">
      <div v-if="hasChildren && isExpanded" class="tree-node-children" role="group">
        <TreeNodeItemChildren
          :children="children"
          :level="level"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedKeys"
          :checked-keys="checkedKeys"
          :checkable="checkable"
          :selectable="selectable"
          :draggable="draggable"
          :show-line="showLine"
          :show-icon="showIcon"
          :block-node="blockNode"
          :node-key="nodeKey as string"
          :label-field="labelField"
          :children-field="childrenField"
          :disabled-field="disabledField"
          :expand-on-click="expandOnClick"
          :get-node-key="getNodeKey"
          @toggle="$emit('toggle', $event)"
          @select="$emit('select', $event)"
          @check="$emit('check', $event)"
          @drag-start="(node: object, event: DragEvent) => $emit('drag-start', node, event)"
          @drag-over="(node: object, event: DragEvent) => $emit('drag-over', node, event)"
          @drop="(node: object, event: DragEvent) => $emit('drop', node, event)"
          @drag-end="(node: object, event: DragEvent) => $emit('drag-end', node, event)"
        >
          <template #node-label="{ node: childNode }">
            <slot v-if="$slots['node-label']" name="node-label" :node="childNode" />
          </template>
          <template #node-icon="{ node: childNode }">
            <slot v-if="$slots['node-icon']" name="node-icon" :node="childNode" />
          </template>
          <template #node-action="{ node: childNode }">
            <slot v-if="$slots['node-action']" name="node-action" :node="childNode" />
          </template>
        </TreeNodeItemChildren>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, onMounted, onUnmounted } from 'vue';
import { TREE_CONTEXT_KEY } from '@ocpui/vue/types';
import type { TreeRecord } from './tree-types';
import TreeNodeItemChildren from './TreeNodeItemChildren.vue';

interface Props {
  node: object;
  level: number;
  expandedKeys: (string | number)[];
  selectedKeys: (string | number)[];
  checkedKeys: (string | number)[];
  checkable: boolean;
  selectable: boolean;
  draggable: boolean;
  showLine: boolean;
  showIcon: boolean;
  blockNode: boolean;
  nodeKey: string;
  labelField: string;
  childrenField: string;
  disabledField: string;
  expandOnClick: boolean;
}

const props = defineProps<Props>();

defineSlots<{
  'node-label'(props: { node: object }): unknown;
  'node-icon'(props: { node: object }): unknown;
  'node-action'(props: { node: object }): unknown;
}>();

const emit = defineEmits<{
  toggle: [node: object];
  select: [node: object];
  check: [node: object];
  'drag-start': [node: object, event: DragEvent];
  'drag-over': [node: object, event: DragEvent];
  drop: [node: object, event: DragEvent];
  'drag-end': [node: object, event: DragEvent];
}>();

const treeContext = inject<{
  getNodeKey: (node: object) => string | number;
  getNodeChildren: (node: object) => object[];
}>(TREE_CONTEXT_KEY)!;

const getNodeKey = treeContext.getNodeKey;
const getNodeChildren = treeContext.getNodeChildren;

const children = computed(() => getNodeChildren(props.node) || []);
const hasChildren = computed(() => children.value.length > 0);

const nodeKey = computed(() => getNodeKey(props.node));
const nodeLabel = computed(
  () => (props.node as TreeRecord)[props.labelField] as string,
);
const isExpanded = computed(() => props.expandedKeys.includes(nodeKey.value));
const isSelected = computed(() => props.selectedKeys.includes(nodeKey.value));
const isChecked = computed(() => props.checkedKeys.includes(nodeKey.value));
const isDisabled = computed(
  () => (props.node as TreeRecord)[props.disabledField] as boolean,
);
const isIndeterminate = computed(
  () => Boolean((props.node as TreeRecord).indeterminate) && !isChecked.value,
);

const checkboxRef = ref<HTMLInputElement | null>(null);

watch(
  [isIndeterminate, isChecked],
  () => {
    if (checkboxRef.value) {
      checkboxRef.value.indeterminate = isIndeterminate.value;
    }
  },
  { immediate: true },
);

const isMobile = ref(false);

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 575.98;
};

onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile);
});

const nodeClass = computed(() => ({
  'tree-node--disabled': isDisabled.value,
  'tree-node--selected': isSelected.value,
  'tree-node--expanded': isExpanded.value,
}));

const nodeStyle = computed(() => ({
  paddingLeft: props.showLine ? 0 : undefined,
}));

const handleClick = () => {
  if (isDisabled.value) return;
  
  if (props.expandOnClick && hasChildren.value) {
    emit('toggle', props.node);
  }
  
  if (props.selectable) {
    emit('select', props.node);
  }
};

const handleToggle = () => {
  if (isDisabled.value) return;
  emit('toggle', props.node);
};

const handleCheck = () => {
  if (isDisabled.value) return;
  emit('check', props.node);
};

const handleDragStart = (event: DragEvent) => {
  if (isDisabled.value || !props.draggable) return;
  event.dataTransfer!.effectAllowed = 'move';
  emit('drag-start', props.node, event);
};

const handleDragOver = (event: DragEvent) => {
  if (isDisabled.value || !props.draggable) return;
  emit('drag-over', props.node, event);
};

const handleDrop = (event: DragEvent) => {
  if (isDisabled.value || !props.draggable) return;
  emit('drop', props.node, event);
};

const handleDragEnd = (event: DragEvent) => {
  if (isDisabled.value || !props.draggable) return;
  emit('drag-end', props.node, event);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (isDisabled.value) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  } else if (event.key === 'ArrowRight' && hasChildren.value && !isExpanded.value) {
    event.preventDefault();
    handleToggle();
  } else if (event.key === 'ArrowLeft' && hasChildren.value && isExpanded.value) {
    event.preventDefault();
    handleToggle();
  }
};
</script>

<style scoped>
.tree-node {
  position: relative;
  outline: none;
}

.tree-node--disabled {
  cursor: not-allowed;
}

/* 仅弱化当前行内容，避免 opacity 连累子节点导致整棵树发灰 */
.tree-node--disabled > .tree-node-content {
  opacity: 0.55;
}

.tree-node-content {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.tree-node-content:hover:not(.tree-node--disabled .tree-node-content) {
  background: hsl(var(--surface-hover));
}

.tree-node-content--selected {
  background: hsl(var(--primary) / 0.1);
}

.tree-node-indent {
  position: relative;
  flex-shrink: 0;
}

.tree-node-line {
  position: absolute;
  top: 0;
  left: 10px;
  bottom: 0;
  border-left: 1px dashed hsl(var(--border));
}

.tree-node-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  cursor: pointer;
}

.tree-node-switcher-icon {
  width: 12px;
  height: 12px;
  color: hsl(var(--text-muted));
  transition: transform 0.2s;
}

.tree-node-switcher-icon--expanded {
  transform: rotate(180deg);
}

.tree-node-switcher-placeholder {
  width: 12px;
  height: 12px;
}

.tree-node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 6px;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
}

.tree-node-icon svg {
  width: 16px;
  height: 16px;
}

.tree-node-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  cursor: pointer;
}

.tree-node-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.tree-node-checkbox-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.tree-node-checkbox input:checked + .tree-node-checkbox-indicator {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.tree-node-checkbox input:checked + .tree-node-checkbox-indicator::after {
  content: '';
  display: block;
  width: 4px;
  height: 8px;
  border: solid hsl(var(--primary-foreground));
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.tree-node-checkbox-indicator--indeterminate {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.tree-node-checkbox-indicator--indeterminate::after {
  content: '';
  display: block;
  width: 8px;
  height: 2px;
  background: hsl(var(--primary-foreground));
  border: none;
  transform: none;
  margin: 0;
}

.tree-node-checkbox input:disabled + .tree-node-checkbox-indicator {
  opacity: 0.5;
  cursor: not-allowed;
}

.tree-node-label {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-node-action {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node-content:hover .tree-node-action {
  opacity: 1;
}

.tree-node-children {
  overflow: hidden;
}

.tree-node-children-enter-active,
.tree-node-children-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.tree-node-children-enter-from,
.tree-node-children-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
/* 响应式样式 */
@media (max-width: 575.98px) {
  .tree-node-content {
    padding: 8px 10px;
    min-height: 40px;
  }
  
  .tree-node-indent {
    width: calc(var(--level, 0) * 16px);
  }
  
  .tree-node-line {
    left: 8px;
  }
  
  .tree-node-switcher {
    width: 24px;
    height: 24px;
  }
  
  .tree-node-switcher-icon {
    width: 14px;
    height: 14px;
  }
  
  .tree-node-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }
  
  .tree-node-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .tree-node-checkbox {
    margin-right: 8px;
  }
  
  .tree-node-checkbox-indicator {
    width: 18px;
    height: 18px;
  }
  
  .tree-node-checkbox input:checked + .tree-node-checkbox-indicator::after {
    width: 5px;
    height: 9px;
  }
  
  .tree-node-label {
    font-size: var(--font-size-sm);
  }
  
  .tree-node-action {
    margin-left: 10px;
  }
}
</style>
