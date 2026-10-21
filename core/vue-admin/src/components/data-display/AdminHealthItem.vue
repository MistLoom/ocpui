<template>
  <div class="ocp-admin-health-item">
    <span class="ocp-admin-health-label">{{ label }}</span>
    <span v-if="value != null" class="ocp-admin-health-value">{{ value }}</span>
    <div v-if="percent != null" class="ocp-admin-progress" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
      <div
        class="ocp-admin-progress-fill"
        :class="{ 'is-warning': warning }"
        :style="{ width: `${Math.min(100, Math.max(0, percent))}%` }"
      />
    </div>
    <p v-if="note" class="ocp-admin-health-note">{{ note }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value?: string | number;
    percent?: number;
    warning?: boolean;
    note?: string;
  }>(),
  {
    value: undefined,
    percent: undefined,
    warning: false,
    note: '',
  },
);
</script>

<script lang="ts">
export default { name: 'AdminHealthItem' };
</script>

<style scoped>
.ocp-admin-health-label {
  font-size: 12px;
  color: hsl(var(--text-secondary));
}

.ocp-admin-health-value {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  color: hsl(var(--text));
}

.ocp-admin-health-note {
  grid-column: 1 / -1;
  font-size: 10.5px;
  color: hsl(var(--text-secondary));
  line-height: 1.45;
  margin: 0;
}
</style>
