<template>
  <span
    class="ocp-admin-tone-badge"
    :class="toneClass"
  >
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { ToneBadgeTone } from './tone-badge.types';
export type { ToneBadgeTone } from './tone-badge.types';

interface Props {
  tone?: ToneBadgeTone;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'neutral',
  label: '',
});

const toneClass = computed(() => `ocp-admin-tone-${props.tone}`);
</script>

<script lang="ts">
export default { name: 'ToneBadge' };
</script>
