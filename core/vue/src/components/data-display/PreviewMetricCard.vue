<template>
  <article class="ocp-admin-metric-card">
    <div class="ocp-admin-metric-top">
      <div v-if="$slots.icon || icon" class="ocp-admin-metric-icon">
        <slot name="icon">
          <Icon v-if="icon" :name="icon" :size="17" />
        </slot>
      </div>
      <span v-if="note" class="ocp-admin-metric-note">{{ note }}</span>
    </div>
    <div class="ocp-admin-metric-value num">
      <slot name="value">{{ value }}</slot>
    </div>
    <p v-if="label" class="ocp-admin-metric-label">{{ label }}</p>
    <div v-if="$slots.foot || foot" class="ocp-admin-metric-foot">
      <slot name="foot">{{ foot }}</slot>
    </div>
  </article>
</template>

<script setup lang="ts">
import Icon from '../utility/Icon.vue';

interface Props {
  value?: string | number;
  label?: string;
  note?: string;
  foot?: string;
  icon?: string;
}

withDefaults(defineProps<Props>(), {
  value: '',
  label: '',
  note: '',
  foot: '',
  icon: '',
});
</script>

<script lang="ts">
export default { name: 'PreviewMetricCard' };
</script>

<style scoped>
.ocp-admin-metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ocp-admin-metric-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, hsl(var(--text)) 5%, transparent);
  color: hsl(var(--text));
}

.ocp-admin-metric-note {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  color: hsl(var(--text-secondary));
}

.ocp-admin-metric-value {
  font-family: var(--font-display, var(--font-sans));
  font-size: 34px;
  line-height: 1;
  letter-spacing: -0.04em;
  font-weight: 650;
  margin-top: 15px;
  font-variant-numeric: tabular-nums;
}

.ocp-admin-metric-label {
  font-size: 12.5px;
  color: hsl(var(--text-secondary));
  margin: 5px 0 0;
}

.ocp-admin-metric-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 11px;
  color: hsl(var(--text-secondary));
  font-family: var(--font-mono, ui-monospace, monospace);
}

.num {
  font-variant-numeric: tabular-nums;
}
</style>
