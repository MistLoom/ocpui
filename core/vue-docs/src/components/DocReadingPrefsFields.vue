<template>
  <div
    class="doc-reading-prefs-fields"
    :class="{ 'doc-reading-prefs-fields--panel': layout === 'panel' }"
  >
    <div class="doc-reading-prefs__field">
      <span class="doc-reading-prefs__label">字号</span>
      <SegmentedControl
        v-model="fontSize"
        size="sm"
        :options="fontSizeOptions"
      />
    </div>
    <div class="doc-reading-prefs__field doc-reading-prefs__field--measure">
      <span class="doc-reading-prefs__label">行宽 {{ measure }}ch</span>
      <Slider
        v-model="measure"
        class="doc-reading-prefs__measure-slider"
        :min="60"
        :max="88"
        :step="1"
        size="sm"
      />
    </div>
    <div class="doc-reading-prefs__field">
      <span class="doc-reading-prefs__label">行距</span>
      <SegmentedControl
        v-model="leading"
        size="sm"
        :options="leadingOptions"
      />
    </div>
    <button
      v-if="showReset"
      type="button"
      class="doc-reading-prefs__reset"
      @click="emit('reset')"
    >
      重置
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SegmentedControl, Slider } from '@ocpui/vue';
import type { DocFontSizePreset, DocLeadingPreset, DocReadingPrefsState } from '../composables/useDocReadingPrefs.js';

interface Props {
  showReset?: boolean;
  layout?: 'inline' | 'panel';
}

withDefaults(defineProps<Props>(), {
  showReset: true,
  layout: 'inline',
});

const prefs = defineModel<DocReadingPrefsState>({ required: true });

const emit = defineEmits<{ reset: [] }>();

const fontSizeOptions = [
  { label: '小', value: 'sm' },
  { label: '中', value: 'md' },
  { label: '大', value: 'lg' },
];

const leadingOptions = [
  { label: '紧', value: 'compact' },
  { label: '标准', value: 'normal' },
  { label: '松', value: 'relaxed' },
];

const fontSize = computed({
  get: () => prefs.value.fontSize,
  set: (value: DocFontSizePreset) => {
    prefs.value.fontSize = value;
  },
});

const leading = computed({
  get: () => prefs.value.leading,
  set: (value: DocLeadingPreset) => {
    prefs.value.leading = value;
  },
});

const measure = computed({
  get: () => prefs.value.measure,
  set: (value: number) => {
    prefs.value.measure = value;
  },
});
</script>

<style scoped>
.doc-reading-prefs-fields {
  display: contents;
}

.doc-reading-prefs-fields--panel {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-4, 1rem);
}

.doc-reading-prefs__field {
  display: flex;
  align-items: center;
  gap: var(--space-2, 0.5rem);
  min-width: 0;
}

.doc-reading-prefs-fields--panel .doc-reading-prefs__field {
  flex-direction: column;
  align-items: stretch;
}

.doc-reading-prefs__field--measure {
  flex: 1 1 10rem;
  max-width: 12rem;
}

.doc-reading-prefs-fields--panel .doc-reading-prefs__field--measure {
  flex: none;
  max-width: none;
}

.doc-reading-prefs__measure-slider {
  flex: 1 1 auto;
  min-width: 5rem;
}

.doc-reading-prefs__label {
  flex-shrink: 0;
  font-size: var(--font-size-xs, 0.75rem);
  color: hsl(var(--text-muted));
}

.doc-reading-prefs__reset {
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-xs, 0.75rem);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm, 0.25rem);
  background: transparent;
  color: hsl(var(--text-muted));
  cursor: pointer;
  align-self: flex-start;
}

.doc-reading-prefs__reset:hover {
  color: hsl(var(--text));
}
</style>
