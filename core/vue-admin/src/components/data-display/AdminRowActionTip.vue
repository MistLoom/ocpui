<template>
  <Tooltip :content="tip" :placement="placement">
    <button
      type="button"
      class="ocp-admin-row-action"
      :aria-label="ariaLabel || tip"
      @click="emit('click', $event)"
    >
      <slot />
    </button>
  </Tooltip>
</template>

<script setup lang="ts">
import { Tooltip } from '@ocpui/vue';

withDefaults(
  defineProps<{
    tip: string;
    ariaLabel?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
  }>(),
  {
    ariaLabel: '',
    placement: 'top',
  },
);

const emit = defineEmits<{ click: [MouseEvent] }>();
</script>

<script lang="ts">
export default { name: 'AdminRowActionTip' };
</script>

<style scoped>
.ocp-admin-row-action {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  font: inherit;
  transition:
    background 0.14s ease,
    border-color 0.14s ease,
    color 0.14s ease;
}

.ocp-admin-row-action:hover {
  background: color-mix(in srgb, hsl(var(--text)) 5%, transparent);
  border-color: hsl(var(--border));
  color: hsl(var(--text));
}

@media (pointer: coarse) {
  .ocp-admin-row-action {
    width: 44px;
    height: 44px;
  }
}
</style>
