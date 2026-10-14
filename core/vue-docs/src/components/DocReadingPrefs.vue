<template>
  <Popover
    v-if="displayMode === 'popover'"
    title="阅读偏好"
    placement="bottom-end"
    trigger="click"
    :width="320"
  >
    <template #trigger>
      <Button size="sm" variant="secondary" :aria-label="ariaLabel">
        阅读设置
      </Button>
    </template>
    <DocReadingPrefsFields
      v-model="prefs"
      layout="panel"
      :show-reset="showReset"
      @reset="emit('reset')"
    />
  </Popover>
  <div
    v-else
    class="doc-reading-prefs"
    role="group"
    :aria-label="ariaLabel"
  >
    <DocReadingPrefsFields
      v-model="prefs"
      :show-reset="showReset"
      @reset="emit('reset')"
    />
  </div>
</template>

<script setup lang="ts">
import { Button } from '@ocpui/vue';
import { Popover } from '@ocpui/vue/feedback';
import type { DocReadingPrefsState } from '../composables/useDocReadingPrefs.js';
import DocReadingPrefsFields from './DocReadingPrefsFields.vue';

interface Props {
  showReset?: boolean;
  ariaLabel?: string;
  /** inline：平铺；popover：收进 Popover */
  displayMode?: 'inline' | 'popover';
}

withDefaults(defineProps<Props>(), {
  showReset: true,
  ariaLabel: '阅读偏好',
  displayMode: 'inline',
});

const prefs = defineModel<DocReadingPrefsState>({ required: true });

const emit = defineEmits<{ reset: [] }>();
</script>

<style scoped>
.doc-reading-prefs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3, 0.75rem) var(--space-4, 1rem);
}
</style>
