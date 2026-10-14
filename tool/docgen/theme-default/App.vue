<template>
  <UiRoot
    theme-style="editorial"
    storage-key="ocp-doc-theme"
    presentation-mode="read"
    custom-class="docgen-root"
  >
    <div class="docgen-app" :class="{ 'docgen-app--editing': isEditMode }">
      <DocSiteHeader
        :site-title="siteTitle"
        :nav-items="topNavItems"
        :active-top-nav-id="activeTopNavId"
        @navigate="handleNavigate"
        @navigate-home="handleNavigateHome"
      >
        <template #actions>
          <DocSearchSurface
            v-if="searchIndex"
            :index="searchIndex"
            placeholder="搜索文档 (Ctrl+K)"
            @select="handleSearchSelect"
          />
          <Button
            v-if="editEnabled"
            size="sm"
            :variant="isEditMode ? 'secondary' : 'ghost'"
            @click="toggleEditMode"
          >
            {{ isEditMode ? '退出编辑' : '编辑' }}
          </Button>
        </template>
      </DocSiteHeader>

      <DocWikiShell
        v-if="collection"
        :collection="collection"
        :initial-source-id="activeSourceId"
        :search-index="searchIndex"
        :plugins="markdownPlugins"
        :show-search="false"
        :show-breadcrumb="false"
        search-placeholder="搜索文档 (Ctrl+K)"
        toc-title="页面导航"
        :editable="isEditMode"
        :edit-syncing="pageEdit.syncing"
        :edit-error="pageEdit.error"
        :edit-initial-source="pageEdit.initialSource"
        :edit-revision="pageEdit.revision"
        :edit-session-key="pageEdit.sessionKey"
        :on-edit-save="pageEdit.save"
        @navigate="handleNavigate"
        @edit-saved="handleEditSaved"
      />
    </div>
  </UiRoot>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button, UiRoot } from '@ocpui/vue';
import DocWikiShell from '@ocpui/vue-docs/components/DocWikiShell.vue';
import DocSearchSurface from '@ocpui/vue-docs/components/DocSearchSurface.vue';
import DocSiteHeader, { type DocSiteNavItem } from './DocSiteHeader.vue';
import '@ocpui/vue/styles/full';
import '@ocpui/vue-docs/styles/doc-reading';
import docgenPayload from 'virtual:ocp-docgen';
import { prefetchDemosForDocPath } from './prefetch-demos.js';
import { useDocgenPageEdit } from './use-docgen-page-edit.js';
import {
  normalizeDocRoutePath,
  resolveEditModeFromRoute,
  resolveRouterPath,
  resolveSourceIdFromRoute,
} from './route-utils.js';
import { applyDocSearchNavigation } from '@ocpui/vue-docs';
import type { DocNavNode, DocSearchHit } from '@ocpui/markdown-core';

const route = useRoute();
const router = useRouter();

const collection = computed(() => docgenPayload.collections?.[0]);
const manifest = computed(() => docgenPayload.manifests?.[0]);
const searchIndex = computed(() => docgenPayload.searchIndexes?.[0]);
const markdownPlugins = computed(() => docgenPayload.markdownPlugins);
const editEnabled = computed(() => Boolean(docgenPayload.editEnabled));

const siteTitle = computed(() => collection.value?.title ?? 'OCP UI');

const topNavItems = computed<DocSiteNavItem[]>(() => {
  const tree = manifest.value?.navTree ?? [];
  return tree
    .map((node) => resolveTopNavItem(node))
    .filter((item): item is DocSiteNavItem => Boolean(item));
});

function resolveTopNavItem(node: DocNavNode): DocSiteNavItem | null {
  if (node.sourceId) {
    return { label: node.label, sourceId: node.sourceId };
  }
  const indexChild = node.children?.find(
    (child) => child.path?.endsWith('/index.md') || child.sourceId,
  );
  if (indexChild?.sourceId) {
    return { label: node.label, sourceId: indexChild.sourceId };
  }
  return null;
}

const activeSourceId = ref('');
/** 就地编辑：仅本地状态，不改 URL */
const editModeActive = ref(false);
const isEditMode = computed(() => editEnabled.value && editModeActive.value);

/** reactive 解包内部 ref，避免模板传入 Ref 对象导致 editError 恒为真 */
const pageEdit = reactive(
  useDocgenPageEdit({
    collection,
    activeSourceId,
    enabled: isEditMode,
  }),
);

watch(
  () => route.fullPath,
  () => {
    activeSourceId.value = resolveSourceIdFromRoute(route, manifest.value);

    // 兼容旧 /edit 书签：归一到阅读 URL，并打开编辑态（不挂载独立编辑页）
    if (editEnabled.value && resolveEditModeFromRoute(route)) {
      editModeActive.value = true;
      const readPath = normalizeDocRoutePath(route.path.replace(/\/edit$/, '') || '/');
      if (normalizeDocRoutePath(route.path) !== readPath) {
        router.replace(readPath);
      }
    }
  },
  { immediate: true },
);

watch(activeSourceId, (sourceId) => {
  const source = collection.value?.sources.find((item) => item.id === sourceId);
  if (source && docgenPayload.demoRegistry) {
    void prefetchDemosForDocPath(docgenPayload.demoRegistry, source.path);
  }
});

const activeTopNavId = computed(() => {
  const currentId = activeSourceId.value;
  if (!currentId || !manifest.value) {
    return '';
  }
  const source = collection.value?.sources.find((item) => item.id === currentId);
  if (!source) {
    return topNavItems.value[0]?.sourceId ?? '';
  }
  const topSegment = source.path.split('/')[0]?.replace(/\.md$/i, '') ?? '';
  const match = topNavItems.value.find((item) => item.sourceId.endsWith(topSegment) || item.sourceId === topSegment);
  return match?.sourceId ?? topNavItems.value[0]?.sourceId ?? '';
});

function pushSourceRoute(sourceId: string) {
  const current = manifest.value;
  if (!current) {
    return;
  }
  const target = current.routes.find((item) => item.sourceId === sourceId);
  if (!target) {
    return;
  }
  const path = resolveRouterPath(manifest.value, target.path);
  if (normalizeDocRoutePath(route.path) !== normalizeDocRoutePath(path)) {
    router.push(path);
  }
}

function handleNavigate(sourceId: string) {
  pushSourceRoute(sourceId);
}

function handleNavigateHome() {
  const home = topNavItems.value[0]?.sourceId ?? manifest.value?.routes[0]?.sourceId;
  if (home) {
    handleNavigate(home);
  }
}

function toggleEditMode() {
  if (!activeSourceId.value) {
    return;
  }
  editModeActive.value = !editModeActive.value;
}

function handleEditSaved() {
  void pageEdit.reload();
}

function handleSearchSelect(hit: DocSearchHit) {
  handleNavigate(hit.docId);
  requestAnimationFrame(() => {
    const content = document.querySelector('.doc-wiki-shell .markdown-body__content') as HTMLElement | null;
    applyDocSearchNavigation(content, {
      anchorId: hit.anchorId,
      query: hit.category === 'heading' ? hit.title : '',
    });
  });
}
</script>

<style scoped>
.docgen-app {
  min-height: 100vh;
  padding-block: 0 var(--space-16, 4rem);
}
</style>
