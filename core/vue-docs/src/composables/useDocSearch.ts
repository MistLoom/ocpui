import { computed, ref, shallowRef, watch, type Ref } from 'vue';
import {
  createDocSearchEngine,
  loadDocSearchEngine,
  DOC_SEARCH_CATEGORY_LABELS,
  type DocSearchCategory,
  type DocSearchDocument,
  type DocSearchHit,
  type DocSearchIndexPayload,
} from '@ocpui/markdown-core';

export interface DocSearchResultItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  data: DocSearchHit;
}

export interface DocSearchCategoryItem {
  key: string;
  label: string;
  count: number;
}

function hitToResult(hit: DocSearchHit): DocSearchResultItem {
  return {
    id: hit.id,
    title: hit.title,
    description: hit.snippet,
    category: DOC_SEARCH_CATEGORY_LABELS[hit.category],
    data: hit,
  };
}

function buildCategories(hits: DocSearchHit[]): DocSearchCategoryItem[] {
  const counts = new Map<string, number>();
  for (const hit of hits) {
    const label = DOC_SEARCH_CATEGORY_LABELS[hit.category];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].map(([label, count]) => ({
    key: label,
    label,
    count,
  }));
}

export interface UseDocSearchOptions {
  documents?: Ref<DocSearchDocument[] | undefined> | DocSearchDocument[];
  index?: Ref<DocSearchIndexPayload | undefined> | DocSearchIndexPayload;
}

export function useDocSearch(options: UseDocSearchOptions = {}) {
  const results = ref<DocSearchResultItem[]>([]);
  const categories = ref<DocSearchCategoryItem[]>([]);
  const loading = ref(false);
  const lastQuery = ref('');
  const engine = shallowRef<ReturnType<typeof createDocSearchEngine> | null>(null);

  function resolveDocuments(): DocSearchDocument[] {
    const source = options.documents;
    if (!source) {
      return [];
    }
    return typeof source === 'object' && 'value' in source ? (source.value ?? []) : source;
  }

  function resolveIndex(): DocSearchIndexPayload | undefined {
    const source = options.index;
    if (!source) {
      return undefined;
    }
    return typeof source === 'object' && 'value' in source ? source.value : source;
  }

  function rebuildEngine() {
    const payload = resolveIndex();
    if (payload) {
      engine.value = loadDocSearchEngine(payload);
      return;
    }
    const documents = resolveDocuments();
    engine.value = documents.length > 0 ? createDocSearchEngine(documents) : null;
  }

  rebuildEngine();

  if (options.documents && typeof options.documents === 'object' && 'value' in options.documents) {
    watch(options.documents, rebuildEngine, { deep: true });
  }
  if (options.index && typeof options.index === 'object' && 'value' in options.index) {
    watch(options.index, rebuildEngine, { deep: true });
  }

  function search(query: string, category: DocSearchCategory | 'all' = 'all') {
    lastQuery.value = query;
    if (!engine.value || !query.trim()) {
      results.value = [];
      categories.value = [];
      return [];
    }

    loading.value = true;
    try {
      const hits = engine.value.search(query, category);
      results.value = hits.map(hitToResult);
      categories.value = buildCategories(hits);
      return hits;
    } finally {
      loading.value = false;
    }
  }

  const hasIndex = computed(() => engine.value != null);

  return {
    results,
    categories,
    loading,
    lastQuery,
    hasIndex,
    search,
    rebuildEngine,
  };
}
