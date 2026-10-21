<template>
  <div class="ocp-admin-status-cell" role="listitem">
    <div v-if="$slots.icon" class="ocp-admin-status-icon">
      <slot name="icon" />
    </div>
    <div class="ocp-admin-status-copy">
      <strong>{{ value }}</strong>
      <span v-if="label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ value: string | number; label?: string }>();
</script>

<script lang="ts">
export default { name: 'AdminStatusCell' };
</script>

<style scoped>
.ocp-admin-status-icon {
  width: 32px;
  height: 32px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: color-mix(in srgb, hsl(var(--text)) 5%, transparent);
}

.ocp-admin-status-copy {
  min-width: 0;
}

.ocp-admin-status-copy strong {
  display: block;
  font-family: var(--font-display, var(--font-sans));
  font-size: 19px;
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-weight: 650;
}

.ocp-admin-status-copy span {
  display: block;
  font-size: 10px;
  color: hsl(var(--text-secondary));
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
