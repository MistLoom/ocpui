<template>
  <div class="ocp-admin-bar-chart" role="img" :aria-label="ariaLabel">
    <div
      v-for="(point, index) in normalized"
      :key="point.key ?? index"
      class="ocp-admin-bar-col"
    >
      <span v-if="showValues" class="ocp-admin-bar-value num">{{ point.labelValue ?? point.value }}</span>
      <div class="ocp-admin-bar-rail">
        <div
          class="ocp-admin-bar"
          :class="{ 'is-peak': point.peak }"
          :style="barStyle(point, index)"
        />
      </div>
      <span v-if="point.day" class="ocp-admin-bar-day">{{ point.day }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { BarColumnPoint } from './bar-column-chart.types';
export type { BarColumnPoint } from './bar-column-chart.types';

interface Props {
  data: BarColumnPoint[];
  max?: number;
  showValues?: boolean;
  ariaLabel?: string;
  /** 逐柱入场延迟步长（ms） */
  staggerMs?: number;
}

const props = withDefaults(defineProps<Props>(), {
  max: undefined,
  showValues: true,
  ariaLabel: '',
  staggerMs: 28,
});

const peakValue = computed(() => {
  const vals = props.data.map((d) => d.value);
  return vals.length ? Math.max(...vals) : 0;
});

const scaleMax = computed(() => {
  if (props.max != null && props.max > 0) return props.max;
  return peakValue.value || 1;
});

const normalized = computed(() =>
  props.data.map((d) => ({
    ...d,
    peak: d.peak ?? (d.value === peakValue.value && peakValue.value > 0),
  })),
);

function barStyle(point: BarColumnPoint, index: number) {
  const pct = Math.max(4, Math.round((point.value / scaleMax.value) * 100));
  return {
    height: `${pct}%`,
    animationDelay: `${index * props.staggerMs}ms`,
  };
}
</script>

<script lang="ts">
export default { name: 'BarColumnChart' };
</script>

<style scoped>
.ocp-admin-bar-value,
.ocp-admin-bar-day {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  color: hsl(var(--text-secondary));
  line-height: 1;
}

.ocp-admin-bar-day {
  font-size: 10px;
}

.num {
  font-variant-numeric: tabular-nums;
}
</style>
