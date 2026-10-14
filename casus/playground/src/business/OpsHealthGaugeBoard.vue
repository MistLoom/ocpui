<template>
  <section class="ops-health-board" v-bind="dispatchAttrs">
    <div class="ops-health-board__gauges playground-grid playground-grid--gauges">
      <div v-for="gauge in gauges" :key="gauge.label" class="ops-health-board__gauge">
        <GaugeChart
          :value="gauge.value"
          :min="gauge.min ?? 0"
          :max="gauge.max ?? 100"
          :unit="gauge.unit"
          :label="gauge.label"
          :size="168"
        />
      </div>
      <div class="ops-health-board__ring">
        <ProgressRing
          :completed="ringCompleted ?? 0"
          :total="ringTotal ?? 100"
          :size="120"
          label="任务完成"
        />
      </div>
    </div>
    <div class="ops-health-board__alerts">
      <h4>近期告警</h4>
      <AlertItem
        v-for="alert in alerts"
        :key="alert.id"
        :title="alert.title"
        :message="alert.message"
        :time="alert.time"
        :level="alert.level"
        :is-read="false"
        @view-detail="emit('alert-detail', alert.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { GaugeChart, ProgressRing, AlertItem } from '@ocpui/vue';
import { shellDispatchAttrs } from '@ocpui/vue/system';
import type { AlertRecord, HealthGauge } from '@/mock/api';

defineProps<{
  gauges: HealthGauge[];
  alerts: AlertRecord[];
  ringCompleted?: number;
  ringTotal?: number;
}>();

const emit = defineEmits<{
  'alert-detail': [id: string];
}>();

const dispatchAttrs = shellDispatchAttrs('content-host');
</script>

<style scoped>
.ops-health-board {
  display: grid;
  gap: 1.25rem;
}

.ops-health-board__gauges {
  align-items: start;
}

.ops-health-board__ring {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.ops-health-board__alerts h4 {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
}

.ops-health-board__alerts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
