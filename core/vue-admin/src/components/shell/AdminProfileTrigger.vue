<template>
  <button
    type="button"
    class="ocp-admin-profile-card"
    :aria-expanded="expanded"
    aria-haspopup="true"
    @click="emit('click', $event)"
  >
    <span class="ocp-admin-avatar">{{ avatarText }}</span>
    <span class="ocp-admin-profile-copy">
      <strong>{{ name }}</strong>
      <span v-if="meta">{{ meta }}</span>
    </span>
    <span v-if="$slots.trailing" class="ocp-admin-profile-trailing">
      <slot name="trailing" />
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string;
    meta?: string;
    avatarText?: string;
    expanded?: boolean;
  }>(),
  {
    meta: '',
    avatarText: '',
    expanded: false,
  },
);

const emit = defineEmits<{ click: [MouseEvent] }>();
</script>

<script lang="ts">
export default { name: 'AdminProfileTrigger' };
</script>

<style scoped>
.ocp-admin-profile-trailing {
  display: inline-flex;
  color: hsl(var(--text-secondary));
  flex: none;
}
</style>
