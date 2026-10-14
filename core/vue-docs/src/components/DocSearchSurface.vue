<template>
  <GlobalSearch
    :results="results"
    :categories="categories"
    :loading="loading"
    :placeholder="placeholder"
    @search="handleSearch"
    @select="handleSelect"
  />
</template>

<script setup lang="ts">
import { toRef, watch } from 'vue';
import type { DocSearchDocument, DocSearchHit, DocSearchIndexPayload } from '@ocpui/markdown-core';
import { GlobalSearch } from '@ocpui/vue';
import type { SearchResult } from '@ocpui/vue/types';
import { useDocSearch } from '../composables/useDocSearch.js';

interface Props {
  documents?: DocSearchDocument[];
  index?: DocSearchIndexPayload;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  documents: () => [],
  placeholder: '搜索文档…',
});

const emit = defineEmits<{
  select: [hit: DocSearchHit, query: string];
}>();

const { results, categories, loading, search, lastQuery } = useDocSearch({
  documents: toRef(props, 'documents'),
  index: toRef(props, 'index'),
});

watch(
  () => [props.documents, props.index] as const,
  () => {
    if (lastQuery.value) {
      search(lastQuery.value);
    }
  },
  { deep: true },
);

function handleSearch(query: string) {
  search(query);
}

function handleSelect(result: SearchResult) {
  const hit = result.data as DocSearchHit | undefined;
  if (hit) {
    emit('select', hit, lastQuery.value);
  }
}
</script>

<style>
mark.doc-search-mark {
  background: hsl(var(--primary) / 0.22);
  color: inherit;
  border-radius: 0.125rem;
  padding-inline: 0.1em;
  transition: background-color 400ms var(--ease-standard, ease);
}

mark.doc-search-mark--fade {
  background: transparent;
}
</style>
