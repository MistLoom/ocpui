<template>
  <Tree
    ref="treeRef"
    class="doc-nav-tree"
    :data="nodes"
    node-key="id"
    label-field="label"
    children-field="children"
    :selected-keys="selectedKeys"
    :expanded-keys="expandedKeys"
    selectable
    block-node
    expand-on-click
    @select="handleSelect"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { collectNavExpandKeysForSource, type DocNavNode } from '@ocpui/markdown-core';
import { Tree } from '@ocpui/vue';

interface Props {
  nodes?: DocNavNode[];
  activeSourceId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  nodes: () => [],
  activeSourceId: '',
});

const emit = defineEmits<{
  navigate: [sourceId: string];
}>();

// 泛型组件无法用于 InstanceType；此处仅需访问根元素做滚动定位
const treeRef = ref<{ $el?: HTMLElement } | null>(null);

const selectedKeys = computed(() =>
  props.activeSourceId ? [props.activeSourceId] : [],
);

const expandedKeys = computed(() =>
  props.activeSourceId
    ? collectNavExpandKeysForSource(props.nodes, props.activeSourceId)
    : [],
);

function handleSelect(node: DocNavNode, selected: boolean) {
  if (selected && node.sourceId) {
    emit('navigate', node.sourceId);
  }
}

watch(
  () => props.activeSourceId,
  async () => {
    await nextTick();
    treeRef.value?.$el
      ?.querySelector('.tree-node-content--selected')
      ?.scrollIntoView({ block: 'nearest' });
  },
);
</script>

<style scoped>
.doc-nav-tree {
  font-size: 0.875rem;
}
</style>
