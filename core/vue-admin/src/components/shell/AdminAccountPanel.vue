<template>
  <div class="ocp-admin-account-pop">
    <div class="ocp-admin-account-pop-head">
      <span class="ocp-admin-avatar">{{ avatarText }}</span>
      <span class="ocp-admin-profile-copy">
        <strong>{{ name }}</strong>
        <span v-if="email">{{ email }}</span>
      </span>
    </div>
    <div class="ocp-admin-account-actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  email?: string;
  avatarText?: string;
}>();
</script>

<script lang="ts">
export default { name: 'AdminAccountPanel' };
</script>
