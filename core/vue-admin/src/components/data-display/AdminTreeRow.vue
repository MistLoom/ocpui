<template>
  <div class="ocp-admin-tree-row" role="treeitem" :aria-expanded="expanded">
    <span class="ocp-admin-tree-gutter">
      <slot name="gutter" />
    </span>
    <span class="ocp-admin-tree-label">
      <slot>{{ label }}</slot>
    </span>
    <span v-if="$slots.control" class="ocp-admin-tree-control">
      <slot name="control" />
    </span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    expanded?: boolean;
  }>(),
  {
    label: '',
    expanded: undefined,
  },
);
</script>

<script lang="ts">
export default { name: 'AdminTreeRow' };
</script>

<style scoped>
.ocp-admin-tree-label {
  color: hsl(var(--text-secondary));
  min-width: 0;
}

.ocp-admin-tree-label :deep(strong) {
  color: hsl(var(--text));
  font-weight: 560;
}

.ocp-admin-tree-control {
  flex: none;
}
</style>
