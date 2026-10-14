<template>
  <TreeNodeItem
    v-for="child in children"
    :key="String(getNodeKey(child))"
    :node="child"
    :level="level + 1"
    :expanded-keys="expandedKeys"
    :selected-keys="selectedKeys"
    :checked-keys="checkedKeys"
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
    @toggle="$emit('toggle', $event)"
    @select="$emit('select', $event)"
    @check="$emit('check', $event)"
    @drag-start="(node: object, event: DragEvent) => $emit('drag-start', node, event)"
    @drag-over="(node: object, event: DragEvent) => $emit('drag-over', node, event)"
    @drop="(node: object, event: DragEvent) => $emit('drop', node, event)"
    @drag-end="(node: object, event: DragEvent) => $emit('drag-end', node, event)"
  >
    <template #node-label="{ node: childNode }">
      <slot name="node-label" :node="childNode" />
    </template>
    <template #node-icon="{ node: childNode }">
      <slot name="node-icon" :node="childNode" />
    </template>
    <template #node-action="{ node: childNode }">
      <slot name="node-action" :node="childNode" />
    </template>
  </TreeNodeItem>
</template>

<script setup lang="ts">
import TreeNodeItem from './TreeNodeItem.vue';

defineSlots<{
  'node-label'(props: { node: object }): unknown;
  'node-icon'(props: { node: object }): unknown;
  'node-action'(props: { node: object }): unknown;
}>();

defineProps<{
  children: object[];
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
  getNodeKey: (node: object) => string | number;
}>();

defineEmits<{
  toggle: [node: object];
  select: [node: object];
  check: [node: object];
  'drag-start': [node: object, event: DragEvent];
  'drag-over': [node: object, event: DragEvent];
  drop: [node: object, event: DragEvent];
  'drag-end': [node: object, event: DragEvent];
}>();
</script>
