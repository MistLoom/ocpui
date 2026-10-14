import { computed, ref, watch, type Ref } from 'vue';
import {
  buildBreadcrumbItems,
  buildManifestFromCollection,
  buildSearchDocumentFromMarkdown,
  findSourceById,
  getSourceMarkdown,
  type DocCollection,
  type DocManifest,
  type DocNavNode,
  type DocSearchDocument,
  type DocSearchIndexPayload,
  type DocSource,
} from '@ocpui/markdown-core';

/** 保存后、HMR/预编译尚未到位时的本地正文覆盖 */
interface LocalSourceOverride {
  markdown: string;
  revision?: string;
}

export interface UseDocWikiOptions {
  collection: Ref<DocCollection | undefined> | DocCollection;
  initialSourceId?: Ref<string | undefined> | string;
  /** 预构建检索索引；传入后跳过客户端重建 */
  searchIndex?: Ref<DocSearchIndexPayload | undefined> | DocSearchIndexPayload;
}

function resolveInitialSourceId(options: UseDocWikiOptions): string {
  const source = options.initialSourceId;
  if (!source) {
    return '';
  }
  return typeof source === 'object' && 'value' in source ? source.value ?? '' : source;
}

function resolveCollection(options: UseDocWikiOptions): DocCollection | undefined {
  const source = options.collection;
  if (!source) {
    return undefined;
  }
  return typeof source === 'object' && 'value' in source ? source.value : source;
}

function findNavNodeBySourceId(nodes: DocNavNode[], sourceId: string): DocNavNode | undefined {
  for (const node of nodes) {
    if (node.sourceId === sourceId) {
      return node;
    }
    if (node.children?.length) {
      const found = findNavNodeBySourceId(node.children, sourceId);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

export function useDocWiki(options: UseDocWikiOptions) {
  const activeSourceId = ref(resolveInitialSourceId(options));
  const searchDocuments = ref<DocSearchDocument[]>([]);
  const searchLoading = ref(false);
  const localOverrides = ref<Record<string, LocalSourceOverride>>({});

  const collection = computed(() => resolveCollection(options));
  const manifest = computed<DocManifest | null>(() =>
    collection.value ? buildManifestFromCollection(collection.value) : null,
  );

  const navTree = computed(() => manifest.value?.navTree ?? []);

  const activeSource = computed<DocSource | null>(() => {
    if (!collection.value) {
      return null;
    }
    if (activeSourceId.value) {
      return findSourceById(collection.value, activeSourceId.value) ?? null;
    }
    return collection.value.sources.find((source) => !source.frontmatter.draft) ?? null;
  });

  const activeOverride = computed(() =>
    activeSourceId.value ? localOverrides.value[activeSourceId.value] : undefined,
  );

  const activeMarkdown = computed(() => {
    if (activeOverride.value?.markdown) {
      return activeOverride.value.markdown;
    }
    return activeSource.value ? getSourceMarkdown(activeSource.value) : '';
  });

  /** 有本地覆盖时丢弃预编译 HTML，强制按最新 markdown 客户端编译 */
  const activeCompiledHtml = computed(() =>
    activeOverride.value ? '' : (activeSource.value?.compiledHtml ?? ''),
  );
  const activeCompiledHeadings = computed(() =>
    activeOverride.value ? [] : (activeSource.value?.compiledHeadings ?? []),
  );

  /** 保存成功后写入覆盖，退出编辑即可读到新正文 */
  function applySavedSource(sourceId: string, markdown: string, revision?: string) {
    if (!sourceId || !markdown.trim()) {
      return;
    }
    localOverrides.value = {
      ...localOverrides.value,
      [sourceId]: { markdown, revision },
    };
  }

  /** collection / HMR 已跟上时清掉对应覆盖，恢复 shiki 预编译 */
  function reconcileLocalOverrides(col: DocCollection) {
    const next: Record<string, LocalSourceOverride> = { ...localOverrides.value };
    let changed = false;
    for (const [sourceId, override] of Object.entries(next)) {
      const source = findSourceById(col, sourceId);
      if (!source) {
        delete next[sourceId];
        changed = true;
        continue;
      }
      const remote = getSourceMarkdown(source);
      if (remote === override.markdown && source.compiledHtml?.trim()) {
        delete next[sourceId];
        changed = true;
      }
    }
    if (changed) {
      localOverrides.value = next;
    }
  }

  const breadcrumbItems = computed(() => {
    if (!collection.value || !activeSource.value) {
      return [];
    }
    return buildBreadcrumbItems(collection.value, activeSource.value).map((item) => ({
      label: item.label,
      href: item.sourceId ? '#' : undefined,
      sourceId: item.sourceId,
    }));
  });

  async function rebuildSearchIndex() {
    const col = collection.value;
    if (!col) {
      searchDocuments.value = [];
      return;
    }
    searchLoading.value = true;
    try {
      const docs = await Promise.all(
        col.sources
          .filter((source) => !source.frontmatter.draft)
          .map((source) =>
            buildSearchDocumentFromMarkdown(source.id, source.path, getSourceMarkdown(source)),
          ),
      );
      searchDocuments.value = docs;
    } finally {
      searchLoading.value = false;
    }
  }

  function navigateToSource(sourceId: string) {
    if (!collection.value) {
      return;
    }
    const source = findSourceById(collection.value, sourceId);
    if (source) {
      activeSourceId.value = source.id;
    }
  }

  watch(
    () => resolveInitialSourceId(options),
    (sourceId) => {
      if (sourceId) {
        activeSourceId.value = sourceId;
      }
    },
  );

  watch(
    collection,
    (col) => {
      if (!col) {
        return;
      }
      const externalSourceId = resolveInitialSourceId(options);
      if (externalSourceId) {
        activeSourceId.value = externalSourceId;
      } else if (!activeSourceId.value) {
        activeSourceId.value = col.sources.find((source) => !source.frontmatter.draft)?.id ?? '';
      }
      reconcileLocalOverrides(col);
      if (!resolveSearchIndex()) {
        void rebuildSearchIndex();
      }
    },
    { immediate: true, deep: true },
  );

  function resolveSearchIndex(): DocSearchIndexPayload | undefined {
    const source = options.searchIndex;
    if (!source) {
      return undefined;
    }
    return typeof source === 'object' && 'value' in source ? source.value : source;
  }

  return {
    activeSourceId,
    activeSource,
    activeMarkdown,
    activeCompiledHtml,
    activeCompiledHeadings,
    navTree,
    manifest,
    breadcrumbItems,
    searchDocuments,
    searchLoading,
    searchIndex: computed(() => resolveSearchIndex()),
    navigateToSource,
    applySavedSource,
    rebuildSearchIndex,
    findNavNodeBySourceId: (sourceId: string) =>
      findNavNodeBySourceId(navTree.value, sourceId),
  };
}
