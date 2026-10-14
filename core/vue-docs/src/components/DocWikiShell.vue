<template>
  <UiScenarioScope
    surface="detail"
    scene="editor"
    presentation-mode="read"
  >
    <div
      class="doc-wiki-shell"
      :class="{ 'doc-wiki-shell--editing': editable }"
      data-ui-dispatch-role="focus-host"
      data-ui-presentation-mode="read"
      :style="shellStyle"
    >
      <DocReadingProgress />
      <header
        v-if="showBreadcrumb"
        class="doc-wiki-shell__chrome doc-chrome"
        data-ui-dispatch-role="chrome-host"
      >
        <div class="doc-wiki-shell__chrome-main doc-chrome-main">
          <button
            v-if="showNav && navTree.length"
            type="button"
            class="doc-wiki-shell__mobile-nav-toggle"
            :aria-expanded="mobileNavOpen"
            aria-label="切换导航"
            @click="mobileNavOpen = !mobileNavOpen"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
          <slot v-if="$slots.header" name="header" />
          <Breadcrumb
            v-else
            :items="breadcrumbNavItems"
            @click="handleBreadcrumbClick"
          />
        </div>
        <div v-if="showChromeActions" class="doc-wiki-shell__chrome-actions doc-chrome-actions">
          <DocSearchSurface
            v-if="showSearch && hasSearch"
            v-bind="searchSurfaceProps"
            :placeholder="searchPlaceholder"
            @select="handleSearchSelect"
          />
          <DocReadingPrefs
            v-if="showReadingPrefs && !editable"
            v-model="prefs"
            display-mode="popover"
            @reset="resetPrefs"
          />
          <slot v-if="$slots['chrome-actions']" name="chrome-actions" />
        </div>
      </header>

      <div class="doc-wiki-shell__frame">
        <div
          v-if="showNav && mobileNavOpen"
          class="doc-wiki-shell__nav-backdrop"
          @click="mobileNavOpen = false"
        />
        <aside
          v-if="showNav"
          class="doc-wiki-shell__nav"
          :class="{ 'doc-wiki-shell__nav--open': mobileNavOpen }"
          data-ui-dispatch-role="chrome-host"
        >
          <slot v-if="$slots['nav-header']" name="nav-header" />
          <DocNavTree
            :nodes="navTree"
            :active-source-id="activeSourceId"
            @navigate="handleNavigate"
          />
          <slot v-if="$slots['nav-footer']" name="nav-footer" />
        </aside>

        <section class="doc-wiki-shell__content">
          <DocReaderShell
            v-if="activeMarkdown || editable"
            :source="activeMarkdown"
            :precompiled-html="activeCompiledHtml"
            :precompiled-headings="activeCompiledHeadings"
            :doc-id="activeSourceId"
            :collection="collection"
            :source-path="activeSource?.path ?? ''"
            :plugins="plugins"
            :show-chrome="false"
            :show-search="false"
            :show-reading-prefs="false"
            :preserve-reading-position="preserveReadingPosition && !editable"
            :toc-title="tocTitle"
            :editable="editable"
            :edit-syncing="editSyncing"
            :edit-error="editError"
            :edit-initial-source="resolvedEditSource"
            :edit-revision="editRevision"
            :edit-session-key="editSessionKey || activeSourceId"
            :on-edit-save="onEditSave"
            @compiled="emit('compiled', $event)"
            @doc-link="handleDocLink"
            @edit-saved="handleEditSaved"
          />
          <Empty v-else description="暂无文档" />
          <slot v-if="$slots['article-footer']" name="article-footer" />
        </section>
      </div>
    </div>
  </UiScenarioScope>
</template>

<script setup lang="ts">
import { computed, ref, toRef, useSlots } from 'vue';
import type { CompileOptions, CompileResult, DocCollection, DocSearchHit, DocSearchIndexPayload } from '@ocpui/markdown-core';
import type { DocEditorSavePayload, DocEditorSaveResult } from '../composables/useDocEditor.js';
import { Breadcrumb, Empty, UiScenarioScope } from '@ocpui/vue';
import { DEFAULT_DOC_MARKDOWN_PLUGINS } from '../constants/default-markdown-plugins.js';
import DocNavTree from './DocNavTree.vue';
import DocReaderShell from './DocReaderShell.vue';
import DocReadingPrefs from './DocReadingPrefs.vue';
import DocReadingProgress from './DocReadingProgress.vue';
import DocSearchSurface from './DocSearchSurface.vue';
import { useDocReadingPrefs } from '../composables/useDocReadingPrefs.js';
import { useDocWiki } from '../composables/useDocWiki.js';
import { applyDocSearchNavigation } from '../utils/highlightDocMatch.js';

interface BreadcrumbNavItem {
  label: string;
  href?: string;
  sourceId?: string;
}

interface Props {
  collection: DocCollection;
  initialSourceId?: string;
  plugins?: CompileOptions['plugins'];
  showNav?: boolean;
  showSearch?: boolean;
  showReadingPrefs?: boolean;
  showBreadcrumb?: boolean;
  searchPlaceholder?: string;
  preserveReadingPosition?: boolean;
  tocTitle?: string;
  /** 预构建检索索引（docgen 注入） */
  searchIndex?: DocSearchIndexPayload;
  /** 就地编辑模式 */
  editable?: boolean;
  editSyncing?: boolean;
  editError?: string;
  editInitialSource?: string;
  editRevision?: string;
  editSessionKey?: string;
  onEditSave?: (payload: DocEditorSavePayload) => Promise<DocEditorSaveResult>;
}

const props = withDefaults(defineProps<Props>(), {
  initialSourceId: '',
  plugins: () => DEFAULT_DOC_MARKDOWN_PLUGINS,
  showNav: true,
  showSearch: true,
  showReadingPrefs: true,
  showBreadcrumb: true,
  searchPlaceholder: '搜索文档…',
  preserveReadingPosition: true,
  tocTitle: '页面导航',
  editable: false,
  editSyncing: false,
  editError: '',
  editInitialSource: '',
  editRevision: '',
  editSessionKey: '',
});

const emit = defineEmits<{
  compiled: [CompileResult];
  navigate: [sourceId: string];
  'search-select': [hit: DocSearchHit, query: string];
  'edit-saved': [DocEditorSaveResult];
}>();

const slots = useSlots();
const { prefs, cssVars, reset: resetPrefs } = useDocReadingPrefs();
const mobileNavOpen = ref(false);

const {
  activeSourceId,
  activeSource,
  activeMarkdown,
  activeCompiledHtml,
  activeCompiledHeadings,
  navTree,
  breadcrumbItems,
  searchDocuments,
  searchIndex: resolvedSearchIndex,
  navigateToSource,
  applySavedSource,
} = useDocWiki({
  collection: toRef(props, 'collection'),
  initialSourceId: toRef(props, 'initialSourceId'),
  searchIndex: toRef(props, 'searchIndex'),
});

const shellStyle = computed(() => cssVars.value);
const breadcrumbNavItems = computed(() =>
  breadcrumbItems.value.map(({ label, href, sourceId }) => ({ label, href, sourceId })),
);
const hasSearch = computed(
  () => Boolean(resolvedSearchIndex.value) || searchDocuments.value.length > 0,
);
const searchSurfaceProps = computed(() =>
  resolvedSearchIndex.value
    ? { index: resolvedSearchIndex.value }
    : { documents: searchDocuments.value },
);
const showChromeActions = computed(
  () => (props.showSearch && hasSearch.value) || (props.showReadingPrefs && !props.editable) || Boolean(slots['chrome-actions']),
);

/** 优先用外部注入，否则用当前页正文，避免编辑态空窗/Loading */
const resolvedEditSource = computed(() => {
  const external = props.editInitialSource;
  const text =
    external && typeof external === 'object' && 'value' in (external as object)
      ? String((external as { value: unknown }).value ?? '')
      : typeof external === 'string'
        ? external
        : '';
  return text.trim() ? text : activeMarkdown.value;
});

function emitNavigate(sourceId: string) {
  emit('navigate', sourceId);
}

function handleNavigate(sourceId: string) {
  navigateToSource(sourceId);
  mobileNavOpen.value = false;
  emitNavigate(sourceId);
}

function handleBreadcrumbClick(item: BreadcrumbNavItem) {
  if (item.sourceId) {
    navigateToSource(item.sourceId);
    emitNavigate(item.sourceId);
  }
}

function handleSearchSelect(hit: DocSearchHit, query: string) {
  navigateToSource(hit.docId);
  emitNavigate(hit.docId);
  requestAnimationFrame(() => {
    const content = document.querySelector('.doc-wiki-shell .markdown-body__content') as HTMLElement | null;
    applyDocSearchNavigation(content, {
      anchorId: hit.anchorId,
      query: hit.category === 'heading' ? hit.title : query,
    });
  });
  emit('search-select', hit, query);
}

function handleDocLink(sourceId: string, anchor?: string) {
  navigateToSource(sourceId);
  emitNavigate(sourceId);
  if (anchor) {
    requestAnimationFrame(() => {
      const content = document.querySelector('.doc-wiki-shell .markdown-body__content') as HTMLElement | null;
      applyDocSearchNavigation(content, { anchorId: anchor });
    });
  }
}

function handleEditSaved(result: DocEditorSaveResult) {
  if (result.markdown?.trim()) {
    applySavedSource(activeSourceId.value, result.markdown, result.revision);
  }
  emit('edit-saved', result);
}

defineExpose({
  activeSourceId,
  navigateToSource,
  searchDocuments,
  prefs,
});
</script>

<style scoped>
.doc-wiki-shell {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 100%;
  overflow-x: clip;
}

.doc-wiki-shell__mobile-nav-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
  padding: 0;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm, 0.25rem);
  background: hsl(var(--background));
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition:
    color var(--duration-fast, 0.12s) var(--ease-standard, ease),
    border-color var(--duration-fast, 0.12s) var(--ease-standard, ease);
}

.doc-wiki-shell__mobile-nav-toggle:hover {
  color: hsl(var(--text));
  border-color: hsl(var(--border-hover));
}

.doc-wiki-shell__mobile-nav-toggle:focus-visible {
  outline: 2px solid hsl(var(--ring) / 0.7);
  outline-offset: 2px;
}

.doc-wiki-shell__frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.doc-wiki-shell__nav-backdrop {
  display: none;
}

.doc-wiki-shell__nav {
  display: none;
}

.doc-wiki-shell__content {
  min-width: 0;
}

@media (min-width: 960px) {
  .doc-wiki-shell__mobile-nav-toggle {
    display: none;
  }

  .doc-wiki-shell__frame {
    grid-template-columns: var(--doc-aside-width, 16rem) minmax(0, 1fr);
  }

  .doc-wiki-shell__nav {
    display: block;
    position: sticky;
    top: 5rem;
    max-height: calc(100vh - 6rem);
    overflow: auto;
    padding-right: 0.5rem;
    border-right: 1px solid hsl(var(--border));
  }
}

@media (max-width: 959.98px) {
  .doc-wiki-shell__nav-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: calc(var(--z-overlay, 1300) - 1);
    background: hsl(0 0% 0% / 0.25);
  }

  .doc-wiki-shell__nav {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(80vw, 18rem);
    z-index: var(--z-overlay, 1300);
    padding: 1rem 0.75rem;
    background: hsl(var(--background));
    border-right: 1px solid hsl(var(--border));
    box-shadow: var(--shadow-lg, 0 6px 20px hsl(0 0% 0% / 0.06));
    overflow: auto;
    transform: translateX(-100%);
    transition: transform var(--duration-normal, 0.2s) var(--ease-standard, ease);
  }

  .doc-wiki-shell__nav--open {
    transform: translateX(0);
  }
}
</style>
