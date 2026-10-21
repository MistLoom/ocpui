<template>
  <button
    type="button"
    class="ocp-admin-notif-item"
    :class="{ 'is-read': read }"
    role="listitem"
    @click="emit('click', $event)"
  >
    <span class="ocp-admin-notif-mark" aria-hidden="true" />
    <span class="ocp-admin-notif-copy">
      <strong>{{ title }}</strong>
      <span v-if="meta">{{ meta }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    meta?: string;
    read?: boolean;
  }>(),
  {
    meta: '',
    read: false,
  },
);

const emit = defineEmits<{ click: [MouseEvent] }>();
</script>

<script lang="ts">
export default { name: 'AdminNotificationItem' };
</script>

<style scoped>
.ocp-admin-notif-copy strong {
  display: block;
  font-size: 11.5px;
  font-weight: 560;
  line-height: 1.4;
}

.ocp-admin-notif-copy span {
  display: block;
  font-size: 10px;
  color: hsl(var(--text-secondary));
  margin-top: 3px;
  font-family: var(--font-mono, ui-monospace, monospace);
}

.ocp-admin-notif-item.is-read .ocp-admin-notif-copy strong {
  color: hsl(var(--text-secondary));
  font-weight: 500;
}
</style>
