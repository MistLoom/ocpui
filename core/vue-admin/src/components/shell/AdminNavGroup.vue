<template>
  <div class="ocp-admin-nav-group">
    <p v-if="label" class="ocp-admin-nav-label">{{ label }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label?: string }>();
</script>

<script lang="ts">
export default { name: 'AdminNavGroup' };
</script>
