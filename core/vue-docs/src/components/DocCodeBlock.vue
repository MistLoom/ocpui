<template>
  <div class="doc-code-block" :data-language="language">
    <div v-if="language || title" class="doc-code-block__meta">
      <span v-if="title" class="doc-code-block__title">{{ title }}</span>
      <span v-if="language" class="doc-code-block__lang">{{ language }}</span>
    </div>
    <pre class="doc-code-block__pre"><code :class="codeClass"><slot>{{ code }}</slot></code></pre>
    <button
      type="button"
      class="doc-code-block__copy"
      :class="{ 'doc-code-block__copy--copied': copied }"
      :aria-label="copyLabel"
      @click="copy"
    >
      {{ copied ? copiedLabel : copyLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  code?: string;
  language?: string;
  title?: string;
  copyLabel?: string;
  copiedLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  code: '',
  language: '',
  title: '',
  copyLabel: '复制',
  copiedLabel: '已复制',
});

const copied = ref(false);

const codeClass = computed(() =>
  props.language ? `language-${props.language}` : undefined,
);

async function copy() {
  const text = props.code || '';
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    copied.value = false;
  }
}
</script>

<style scoped>
.doc-code-block {
  position: relative;
  margin-block: 1rem;
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid hsl(var(--border));
  background: hsl(var(--surface-muted, var(--background)));
  overflow: hidden;
}

.doc-code-block__meta {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
  border-bottom: 1px solid hsl(var(--border));
}

.doc-code-block__pre {
  margin: 0;
  padding: 0.875rem 1rem;
  overflow-x: auto;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.875rem;
  line-height: 1.6;
}

.doc-code-block__copy {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  border-radius: var(--radius-sm, 0.25rem);
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition:
    color var(--duration-fast, 0.12s) var(--ease-standard, ease),
    background-color var(--duration-fast, 0.12s) var(--ease-standard, ease),
    border-color var(--duration-fast, 0.12s) var(--ease-standard, ease),
    box-shadow var(--duration-fast, 0.12s) var(--ease-standard, ease);
}

.doc-code-block__copy:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-hover, var(--background)));
  border-color: hsl(var(--border-hover));
}

.doc-code-block__copy:focus-visible {
  outline: 2px solid hsl(var(--ring) / 0.7);
  outline-offset: 2px;
}

.doc-code-block__copy:active {
  transform: scale(0.96);
}

.doc-code-block__copy--copied {
  color: hsl(var(--success));
  border-color: hsl(var(--success) / 0.35);
  background: hsl(var(--success) / 0.06);
}
</style>
