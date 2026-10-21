<template>
  <div class="ocp-admin-compact-row" role="listitem">
    <div class="ocp-admin-type-mark">
      <slot name="mark" />
    </div>
    <div class="ocp-admin-compact-main">
      <strong>{{ title }}</strong>
      <span v-if="meta">{{ meta }}</span>
      <slot />
    </div>
    <div v-if="$slots.trailing" class="ocp-admin-compact-trailing">
      <slot name="trailing" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; meta?: string }>();
</script>

<script lang="ts">
export default { name: 'AdminCompactItem' };
</script>

<style scoped>
.ocp-admin-compact-main {
  min-width: 0;
}

.ocp-admin-compact-main strong {
  display: block;
  font-size: 13px;
  font-weight: 560;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ocp-admin-compact-main span {
  display: block;
  margin-top: 3px;
  font-size: 10.5px;
  color: hsl(var(--text-secondary));
  font-family: var(--font-mono, ui-monospace, monospace);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ocp-admin-compact-trailing {
  flex: none;
}
</style>
