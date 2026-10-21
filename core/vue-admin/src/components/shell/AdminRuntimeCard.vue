<template>
  <button
    type="button"
    class="ocp-admin-runtime-card"
    :aria-label="ariaLabel"
    @click="emit('click', $event)"
  >
    <span
      class="ocp-admin-runtime-pulse"
      :class="pulseClass"
      aria-hidden="true"
    />
    <span class="ocp-admin-runtime-copy">
      <strong>{{ title }}</strong>
      <span v-if="description">{{ description }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    tone?: 'success' | 'warning' | 'danger' | 'neutral';
    ariaLabel?: string;
  }>(),
  {
    description: '',
    tone: 'success',
    ariaLabel: '',
  },
);

const emit = defineEmits<{ click: [MouseEvent] }>();

const pulseClass = computed(() => `ocp-admin-runtime-pulse--${props.tone}`);
</script>

<script lang="ts">
export default { name: 'AdminRuntimeCard' };
</script>

<style scoped>
.ocp-admin-runtime-pulse--warning {
  background: hsl(var(--warning));
  box-shadow: 0 0 0 4px hsl(var(--warning) / 0.1);
}

.ocp-admin-runtime-pulse--danger {
  background: hsl(var(--error));
  box-shadow: 0 0 0 4px hsl(var(--error) / 0.1);
}

.ocp-admin-runtime-pulse--neutral {
  background: hsl(var(--text-secondary));
  box-shadow: 0 0 0 4px hsl(var(--text-secondary) / 0.12);
}
</style>
