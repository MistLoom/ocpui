<template>
  <UiScenarioScope
    surface="detail"
    scene="editor"
    presentation-mode="read"
  >
    <div
      class="doc-reader-shell"
      :class="{ 'doc-reader-shell--editable': editable }"
      data-ui-dispatch-role="focus-host"
      data-ui-presentation-mode="read"
      :style="readingShellStyle"
    >
      <header
        v-if="showChrome"
        class="doc-reader-shell__chrome doc-chrome"
        data-ui-dispatch-role="chrome-host"
      >
        <div class="doc-reader-shell__chrome-main doc-chrome-main">
          <slot v-if="$slots.header" name="header" />
          <div v-else-if="title || description" class="doc-reader-shell__heading">
            <h1 v-if="title" class="doc-reader-shell__title">{{ title }}</h1>
            <p v-if="description" class="doc-reader-shell__description">{{ description }}</p>
          </div>
        </div>
        <div class="doc-reader-shell__chrome-actions doc-chrome-actions">
          <DocSearchSurface
            v-if="showSearch && hasSearchIndex"
            :documents="searchDocuments"
            :placeholder="searchPlaceholder"
            @select="handleSearchSelect"
          />
          <DocReadingPrefs
            v-if="showReadingPrefs"
            v-model="prefs"
            display-mode="popover"
            @reset="resetPrefs"
          />
          <slot v-if="$slots['chrome-actions']" name="chrome-actions" />
        </div>
      </header>

      <div class="doc-reader-shell__layout">
        <main class="doc-reader-shell__body">
          <div v-if="editable && resolvedEditError" class="doc-reader-shell__edit-error">{{ resolvedEditError }}</div>
          <DocEditorShell
            v-else-if="editable && hasEditSource"
            :key="editSessionKey || docId"
            :initial-source="resolvedEditSource"
            :initial-revision="resolvedEditRevision"
            :syncing="resolvedEditSyncing"
            :save-request="onEditSave"
            @save="emit('edit-saved', $event)"
          />
          <div v-else-if="editable" class="doc-reader-shell__edit-error">
            无法加载文档正文
          </div>
          <MarkdownBody
            v-else
            ref="bodyRef"
            :source="source"
            :precompiled-html="precompiledHtml"
            :precompiled-headings="precompiledHeadings"
            :plugins="plugins"
            :autolink-headings="autolinkHeadings"
            :measure="measureValue"
            presentation-mode="read"
            @compiled="handleCompiled"
          />
          <slot v-if="$slots['article-footer']" name="article-footer" />
        </main>

        <aside
          v-if="showToc && tocHeadings.length > 0 && !editable"
          class="doc-reader-shell__toc"
          data-ui-dispatch-role="chrome-host"
        >
          <DocToc
            v-model:active-id="activeHeadingId"
            :headings="tocHeadings"
            :container="bodyElement"
            :title="tocTitle"
          />
        </aside>
      </div>
    </div>
  </UiScenarioScope>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';
import type {
  CompileOptions,
  CompileResult,
  DocCollection,
  DocHeading,
  DocSearchDocument,
  DocSearchHit,
} from '@ocpui/markdown-core';
import type {
  DocEditorSavePayload,
  DocEditorSaveResult,
} from '../composables/useDocEditor.js';
import { UiScenarioScope } from '@ocpui/vue';
import DocEditorShell from './DocEditorShell.vue';
import DocSearchSurface from './DocSearchSurface.vue';
import DocReadingPrefs from './DocReadingPrefs.vue';
import DocToc from './DocToc.vue';
import MarkdownBody from './MarkdownBody.vue';
import { useDocReadingPrefs } from '../composables/useDocReadingPrefs.js';
import { useReadingScrollRestore } from '../composables/useReadingScrollRestore.js';
import { applyDocSearchNavigation } from '../utils/highlightDocMatch.js';
import { attachDocContentLinks } from '../utils/attachDocContentLinks.js';

interface Props {
  source?: string;
  precompiledHtml?: string;
  precompiledHeadings?: DocHeading[];
  title?: string;
  description?: string;
  plugins?: CompileOptions['plugins'];
  autolinkHeadings?: boolean;
  showToc?: boolean;
  showReadingPrefs?: boolean;
  showChrome?: boolean;
  tocTitle?: string;
  tocMinDepth?: number;
  tocMaxDepth?: number;
  /** 检索文档集；传入后显示 DocSearchSurface */
  searchDocuments?: DocSearchDocument[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  preserveReadingPosition?: boolean;
  /** 用于 sessionStorage 恢复阅读位置 */
  docId?: string;
  /** 是否将阅读偏好 CSS 变量写入 shell 根节点 */
  applyReadingPrefsStyle?: boolean;
  /** 文档集合；传入后启用正文内链 SPA 跳转 */
  collection?: DocCollection;
  /** 当前文档 source.path，用于解析相对链接 */
  sourcePath?: string;
  /** 就地编辑：替换正文为编辑器，布局不变 */
  editable?: boolean;
  editSyncing?: boolean;
  editError?: string;
  editInitialSource?: string;
  editRevision?: string;
  editSessionKey?: string;
  onEditSave?: (payload: DocEditorSavePayload) => Promise<DocEditorSaveResult>;
}

const props = withDefaults(defineProps<Props>(), {
  source: '',
  title: '',
  description: '',
  autolinkHeadings: true,
  showToc: true,
  showReadingPrefs: true,
  showChrome: true,
  tocTitle: '目录',
  tocMinDepth: 2,
  tocMaxDepth: 4,
  docId: '',
  preserveReadingPosition: true,
  searchDocuments: () => [],
  showSearch: true,
  searchPlaceholder: '搜索文档…',
  applyReadingPrefsStyle: true,
  editable: false,
  editSyncing: false,
  editError: '',
  editInitialSource: '',
  editRevision: '',
  editSessionKey: '',
});

const emit = defineEmits<{
  compiled: [CompileResult];
  'search-select': [hit: DocSearchHit, query: string];
  'doc-link': [sourceId: string, anchor?: string];
  'edit-saved': [DocEditorSaveResult];
}>();

const bodyRef = ref<InstanceType<typeof MarkdownBody> | null>(null);
const headings = ref<DocHeading[]>([]);
const activeHeadingId = ref('');
const { prefs, cssVars, reset: resetPrefs } = useDocReadingPrefs();

useReadingScrollRestore(toRef(props, 'docId'), props.preserveReadingPosition);

const readingShellStyle = computed(() =>
  props.applyReadingPrefsStyle ? cssVars.value : undefined,
);
const measureValue = computed(() => `${prefs.value.measure}ch`);
const bodyElement = computed(() => bodyRef.value?.rootRef ?? null);

const hasSearchIndex = computed(() => props.showSearch && props.searchDocuments.length > 0);

/** 编辑态始终有可编辑正文：外部源优先，否则用当前阅读 source */
const resolvedEditSource = computed(() => {
  const external = unwrapMaybeString(props.editInitialSource);
  if (external.trim()) {
    return external;
  }
  return props.source;
});

const hasEditSource = computed(() => Boolean(resolvedEditSource.value.trim()));
const resolvedEditError = computed(() => unwrapMaybeString(props.editError));
const resolvedEditRevision = computed(() => unwrapMaybeString(props.editRevision));
const resolvedEditSyncing = computed(() => unwrapMaybeBoolean(props.editSyncing));

function unwrapMaybeRef(value: unknown): unknown {
  if (value && typeof value === 'object' && 'value' in (value as object)) {
    return (value as { value: unknown }).value;
  }
  return value;
}

function unwrapMaybeString(value: unknown): string {
  const inner = unwrapMaybeRef(value);
  return typeof inner === 'string' ? inner : inner == null ? '' : String(inner);
}

function unwrapMaybeBoolean(value: unknown): boolean {
  const inner = unwrapMaybeRef(value);
  return Boolean(inner);
}

const tocHeadings = computed(() =>
  headings.value.filter(
    (item) => item.depth >= props.tocMinDepth && item.depth <= props.tocMaxDepth,
  ),
);

function handleCompiled(result: CompileResult) {
  headings.value = result.headings;
  emit('compiled', result);
}

function handleSearchSelect(hit: DocSearchHit, query: string) {
  const contentRoot = bodyRef.value?.rootRef?.querySelector('.markdown-body__content') as HTMLElement | null;
  applyDocSearchNavigation(contentRoot, {
    anchorId: hit.anchorId,
    query: hit.category === 'heading' ? hit.title : query,
  });
  emit('search-select', hit, query);
}

watch(
  () => [
    bodyRef.value?.contentRef,
    props.collection,
    props.sourcePath,
  ] as const,
  ([contentEl, collection, sourcePath], _, onCleanup) => {
    if (!(contentEl instanceof HTMLElement) || !collection || !sourcePath) {
      return;
    }
    const detach = attachDocContentLinks(contentEl, {
      collection,
      sourcePath,
      onNavigate: (sourceId, anchor) => emit('doc-link', sourceId, anchor),
    });
    onCleanup(detach);
  },
  { flush: 'post' },
);

defineExpose({
  bodyRef,
  headings,
  prefs,
  resetPrefs,
});
</script>

<style scoped>
.doc-reader-shell {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 100%;
  overflow-x: clip;
}

.doc-reader-shell__chrome {
  margin-bottom: 1.5rem;
}

.doc-reader-shell__title {
  margin: 0;
  color: hsl(var(--text));
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 600;
  line-height: 1.25;
}

.doc-reader-shell__description {
  margin: 0.375rem 0 0;
  color: hsl(var(--text-muted));
  font-size: 0.9375rem;
}

.doc-reader-shell__edit-error {
  padding: 2rem 0;
  font-size: 0.875rem;
  color: hsl(var(--destructive, 0 72% 51%));
}
</style>
