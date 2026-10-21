<template>
  <div class="ocp-admin-section-note" role="note">
    <span v-if="$slots.icon" class="ocp-admin-section-note-icon">
      <slot name="icon" />
    </span>
    <div class="ocp-admin-section-note-body">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'AdminSectionNote' };
</script>

<style scoped>
.ocp-admin-section-note-icon {
  display: inline-flex;
  width: 15px;
  height: 15px;
  margin-top: 1px;
  flex: none;
  color: hsl(var(--text));
}
</style>
