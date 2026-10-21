<template>
  <div class="ocp-admin-task-row" role="listitem">
    <span
      class="ocp-admin-task-mark"
      :style="markStyle"
      aria-hidden="true"
    />
    <div class="ocp-admin-task-main">
      <strong>{{ title }}</strong>
      <span v-if="meta">{{ meta }}</span>
      <slot />
    </div>
    <div v-if="$slots.action || actionLabel" class="ocp-admin-task-action-wrap">
      <slot name="action">
        <button
          v-if="actionLabel"
          type="button"
          class="ocp-admin-task-action"
          @click="emit('action', $event)"
        >
          {{ actionLabel }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    meta?: string;
    actionLabel?: string;
    markColor?: string;
  }>(),
  {
    meta: '',
    actionLabel: '',
    markColor: '',
  },
);

const emit = defineEmits<{ action: [MouseEvent] }>();

const markStyle = computed(() =>
  props.markColor ? { background: props.markColor } : undefined,
);
</script>

<script lang="ts">
export default { name: 'AdminTaskItem' };
</script>

<style scoped>
.ocp-admin-task-main {
  min-width: 0;
}

.ocp-admin-task-main strong {
  display: block;
  font-size: 12.5px;
  font-weight: 560;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ocp-admin-task-main span {
  display: block;
  font-size: 10.5px;
  color: hsl(var(--text-secondary));
  margin-top: 3px;
  font-family: var(--font-mono, ui-monospace, monospace);
}

.ocp-admin-task-action {
  min-height: 34px;
  padding: 0 9px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: hsl(var(--text-secondary));
  font-size: 11px;
  cursor: pointer;
  font: inherit;
  transition: background 0.16s ease, color 0.16s ease;
}

.ocp-admin-task-action:hover {
  background: color-mix(in srgb, hsl(var(--text)) 5%, transparent);
  color: hsl(var(--text));
}
</style>
