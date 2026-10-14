<template>
  <Popover
    :model-value="open"
    trigger="hover"
    placement="top"
    :width="280"
    @update:model-value="open = $event"
  >
    <template #trigger>
      <button
        type="button"
        class="doc-glossary-term"
        :aria-describedby="open ? definitionId : undefined"
        @focus="open = true"
        @blur="open = false"
      >
        {{ term }}
      </button>
    </template>
    <div :id="definitionId" class="doc-glossary-term__definition" v-html="definitionHtml" />
  </Popover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Popover } from '@ocpui/vue/feedback';

interface Props {
  term: string;
  definition: string;
}

const props = defineProps<Props>();

const open = ref(false);
const definitionId = computed(() => `doc-glossary-def-${props.term.replace(/\s+/g, '-')}`);
const definitionHtml = computed(() => props.definition.replace(/\n/g, '<br />'));
</script>

<style scoped>
.doc-glossary-term {
  padding: 0;
  border: 0;
  background: none;
  color: hsl(var(--primary));
  cursor: help;
  text-decoration: underline dotted;
  text-underline-offset: 0.15em;
  font: inherit;
}

.doc-glossary-term__definition {
  font-size: 0.875rem;
  line-height: 1.6;
  color: hsl(var(--foreground));
}
</style>
