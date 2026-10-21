<template>
  <span v-if="$slots.icon" class="ocp-admin-nav-item-icon">
    <slot name="icon" />
  </span>
  <span class="ocp-admin-nav-text">
    <slot />
  </span>
  <span
    v-if="count != null && count !== ''"
    class="ocp-admin-nav-count"
    :aria-label="countAriaLabel"
  >{{ count }}</span>
</template>

<script setup lang="ts">
defineProps<{
  count?: string | number;
  countAriaLabel?: string;
}>();
</script>

<style scoped>
.ocp-admin-nav-item-icon {
  display: inline-flex;
  flex: none;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
}
</style>
