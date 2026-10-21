<template>
  <div class="ocp-admin-notif-panel">
    <header v-if="title || $slots.head" class="ocp-admin-notif-head">
      <slot name="head">
        <strong>{{ title }}</strong>
      </slot>
      <slot name="head-action" />
    </header>
    <div class="ocp-admin-notif-list" role="list">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
</script>

<script lang="ts">
export default { name: 'AdminNotificationPanel' };
</script>

<style scoped>
.ocp-admin-notif-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 10px 10px;
}

.ocp-admin-notif-head strong {
  font-size: 12.5px;
  font-weight: 650;
}

.ocp-admin-notif-list {
  display: flex;
  flex-direction: column;
}
</style>
