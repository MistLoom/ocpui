<template>
  <button type="button" class="ocp-admin-account-action" @click="emit('click', $event)">
    <span v-if="$slots.icon" class="ocp-admin-account-action-icon">
      <slot name="icon" />
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{ click: [MouseEvent] }>();
</script>

<script lang="ts">
export default { name: 'AdminAccountAction' };
</script>

<style scoped>
.ocp-admin-account-action-icon {
  display: inline-flex;
  width: 15px;
  height: 15px;
  flex: none;
}
</style>
