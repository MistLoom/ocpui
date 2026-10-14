<template>
  <UiScenarioScope surface="detail" scene="editor" presentation-mode="read">
    <div
      class="doc-editor-shell"
      :class="`doc-editor-shell--${mode}`"
      data-ui-dispatch-role="focus-host"
      data-ui-presentation-mode="read"
    >
      <header
        v-if="title || description || $slots['chrome-actions']"
        class="doc-editor-shell__heading"
      >
        <h1 v-if="title" class="doc-editor-shell__title">
          {{ title }}
          <span v-if="dirty" class="doc-editor-shell__dirty" aria-label="未保存">●</span>
        </h1>
        <p v-if="description" class="doc-editor-shell__description">{{ description }}</p>
        <div v-if="$slots['chrome-actions']" class="doc-editor-shell__heading-actions">
          <slot name="chrome-actions" />
        </div>
      </header>

      <DocEditToolbar
        :dirty="dirty"
        :saving="saving"
        :syncing="syncing"
        :mode="mode"
        @save="handleSave"
        @update:mode="mode = $event"
        @open-meta="handleOpenMeta"
      />

      <div class="doc-editor-shell__layout">
        <section
          class="doc-editor-shell__pane doc-editor-shell__pane--edit"
          :aria-label="mode === 'wysiwyg' ? '所见即所得编辑' : '源码编辑'"
        >
          <DocVisualEditor
            v-if="mode === 'wysiwyg'"
            ref="visualEditorRef"
            :key="visualEditorKey"
            :model-value="editorBody"
            @update:model-value="handleBodyUpdate"
            @error="handleVisualError"
          />

          <DocMarkdownEditor
            v-else
            ref="sourceEditorRef"
            :model-value="editorBody"
            @update:model-value="handleBodyUpdate"
          />
        </section>

        <section
          v-if="mode === 'split'"
          class="doc-editor-shell__pane doc-editor-shell__pane--preview"
          aria-label="实时预览"
        >
          <MarkdownBody
            :source="markdown"
            :plugins="previewPlugins"
            :glossary="mergedGlossary"
            :resolve-cross-preview="resolveCrossPreview"
            presentation-mode="read"
          />
        </section>
      </div>

      <Drawer
        v-model="metaOpen"
        title="文档元数据"
        placement="right"
        size="md"
      >
        <DocFrontmatterPanel
          v-if="showFrontmatter"
          :frontmatter="frontmatter"
          @update:frontmatter="handleFrontmatterUpdate"
        />
      </Drawer>

      <Modal
        v-model="conflictOpen"
        title="版本冲突"
        size="sm"
        :mask-closable="false"
      >
        <p>远端文档已更新。选择如何处理本地修改。</p>
        <template #footer>
          <div class="doc-editor-shell__conflict-actions">
            <Button size="sm" variant="ghost" @click="resolveConflict('cancel')">取消</Button>
            <Button size="sm" variant="secondary" @click="resolveConflictWithRemount('merge')">合并</Button>
            <Button size="sm" variant="primary" @click="resolveConflictWithRemount('overwrite')">覆盖为远端</Button>
          </div>
        </template>
      </Modal>
    </div>
  </UiScenarioScope>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { splitFrontmatter, stringifyFrontmatter, type CompileOptions, type DocFrontmatter } from '@ocpui/markdown-core';
import { Button, UiScenarioScope, toast } from '@ocpui/vue';
import { Drawer, Modal } from '@ocpui/vue/feedback';
import DocEditToolbar from './DocEditToolbar.vue';
import DocFrontmatterPanel from './DocFrontmatterPanel.vue';
import DocMarkdownEditor from './DocMarkdownEditor.vue';
import DocVisualEditor from './DocVisualEditor.vue';
import MarkdownBody from './MarkdownBody.vue';
import {
  useDocEditor,
  type DocEditorSavePayload,
  type DocEditorSaveResult,
} from '../composables/useDocEditor.js';
import { mergeGlossaryMaps, type DocCrossPreviewResolver } from '../types/doc-enhance.js';
import { DEFAULT_DOC_MARKDOWN_PLUGINS } from '../constants/default-markdown-plugins.js';

export type DocEditorMode = 'wysiwyg' | 'source' | 'split';

interface Props {
  initialSource?: string;
  initialRevision?: string;
  title?: string;
  description?: string;
  /** false 时隐藏元数据入口（frontmatter 不允许编辑） */
  showFrontmatter?: boolean;
  syncing?: boolean;
  collectionGlossary?: Record<string, string>;
  plugins?: CompileOptions['plugins'];
  resolveCrossPreview?: DocCrossPreviewResolver;
  /** T4 注入的持久化回调；返回保存结果。命名避开与 save 事件隐式 onSave 监听冲突 */
  saveRequest?: (payload: DocEditorSavePayload) => Promise<DocEditorSaveResult>;
  /** 显式指定初始模式；省略时按正文推断（含 ::: 容器等扩展语法默认源码） */
  defaultMode?: DocEditorMode;
}

const props = withDefaults(defineProps<Props>(), {
  initialSource: '',
  initialRevision: '',
  title: '',
  description: '',
  showFrontmatter: true,
  syncing: false,
  collectionGlossary: () => ({}),
});

const emit = defineEmits<{
  save: [DocEditorSaveResult];
  'update:markdown': [string];
}>();

/** 块级扩展语法（admonition / demo 容器）无法在所见即所得中正确呈现，默认走源码兜底 */
function bodyHasBlockSyntax(source: string): boolean {
  const { body } = splitFrontmatter(source);
  return /^:::[ \t]?/m.test(body);
}

const mode = ref<DocEditorMode>(
  props.defaultMode ?? (bodyHasBlockSyntax(props.initialSource) ? 'source' : 'wysiwyg'),
);
const metaOpen = ref(false);
const visualEditorKey = ref('0');
const visualEditorRef = ref<InstanceType<typeof DocVisualEditor> | null>(null);
const sourceEditorRef = ref<InstanceType<typeof DocMarkdownEditor> | null>(null);

const {
  markdown,
  frontmatter,
  dirty,
  saving,
  conflictOpen,
  revision,
  save,
  updateFrontmatter,
  resolveConflict,
  syncFrontmatterFromMarkdown,
  markSaved,
} = useDocEditor({
  initialSource: props.initialSource,
  initialRevision: props.initialRevision,
  onSave: (payload) => {
    if (!props.saveRequest) {
      return Promise.resolve({ revision: 'local' });
    }
    return props.saveRequest(payload);
  },
});

/** 编辑器只操作正文；frontmatter 经元数据 Drawer 编辑 */
const editorBody = computed(() => splitFrontmatter(markdown.value).body);

const previewPlugins = computed<CompileOptions['plugins']>(() =>
  props.plugins ?? DEFAULT_DOC_MARKDOWN_PLUGINS,
);

const mergedGlossary = computed(() =>
  mergeGlossaryMaps(props.collectionGlossary, frontmatter.value.glossary as Record<string, string> | undefined),
);

watch(markdown, (value) => {
  emit('update:markdown', value);
});

// 异步源到达（未产生本地修改时）整体替换
watch(
  () => [props.initialSource, props.initialRevision] as const,
  ([source, nextRevision]) => {
    if (dirty.value || !source || source === markdown.value) {
      return;
    }
    if (nextRevision && nextRevision !== revision.value) {
      revision.value = nextRevision;
    }
    markdown.value = source;
    syncFrontmatterFromMarkdown();
    markSaved(nextRevision || revision.value);
    bumpVisualEditorKey();
  },
);

function handleFrontmatterUpdate(next: DocFrontmatter) {
  updateFrontmatter(next);
}

/** 拒绝空串覆盖已有正文，避免编辑器初始化回写清空 */
function handleBodyUpdate(body: string) {
  if (!body.trim() && editorBody.value.trim()) {
    return;
  }
  markdown.value = stringifyFrontmatter(body, frontmatter.value);
}

/** 可视化解析失败：回退源码模式（spec §11.2） */
function handleVisualError() {
  mode.value = 'source';
}

function handleOpenMeta() {
  metaOpen.value = true;
}

function bumpVisualEditorKey() {
  visualEditorKey.value = `${Date.now()}`;
}

function resolveConflictWithRemount(choice: 'overwrite' | 'merge') {
  resolveConflict(choice);
  bumpVisualEditorKey();
}

/** 保存前同步读取编辑器最新正文：绕开 milkdown 200ms debounce，避免丢失尾部击键 */
function flushEditorBody() {
  const editor = mode.value === 'wysiwyg' ? visualEditorRef.value : sourceEditorRef.value;
  const latest = editor?.getMarkdown();
  if (typeof latest === 'string' && latest.trim()) {
    handleBodyUpdate(latest);
  }
}

async function handleSave() {
  flushEditorBody();
  try {
    const result = await save();
    if (result) {
      toast.success('已保存');
      emit('save', result);
    }
  } catch (cause) {
    const message =
      cause instanceof Error && cause.message.trim() ? cause.message : '保存失败';
    toast.error(message);
  }
}

defineExpose({
  markdown,
  dirty,
  saving,
  save,
  mode,
  metaOpen,
});
</script>

<style scoped>
.doc-editor-shell {
  width: 100%;
  min-height: 100%;
  min-width: 0;
}

.doc-editor-shell__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding-block: 0.25rem 1rem;
}

.doc-editor-shell__title {
  margin: 0;
  color: hsl(var(--text));
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.doc-editor-shell__dirty {
  color: hsl(var(--warning, 38 92% 50%));
  font-size: 0.75rem;
}

.doc-editor-shell__description {
  margin: 0;
  color: hsl(var(--text-muted));
  font-size: 0.875rem;
  flex-basis: 100%;
}

.doc-editor-shell__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.doc-editor-shell__pane {
  min-width: 0;
}

/* 所见即所得：保持阅读行宽，正文为唯一焦点 */
.doc-editor-shell--wysiwyg .doc-editor-shell__pane--edit {
  max-width: var(--doc-measure, 72ch);
  margin-inline: auto;
  width: 100%;
}

.doc-editor-shell__pane--preview {
  border-left: 1px solid hsl(var(--border));
  padding-left: 1.25rem;
}

.doc-editor-shell__conflict-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}

@media (min-width: 1024px) {
  .doc-editor-shell--split .doc-editor-shell__layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 1.5rem;
  }
}
</style>
