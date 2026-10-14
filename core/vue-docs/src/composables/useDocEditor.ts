import { splitFrontmatter, stringifyFrontmatter, type DocFrontmatter } from '@ocpui/markdown-core';
import { computed, ref, shallowRef } from 'vue';
import { useDebouncedRef } from './useDebouncedRef.js';

export interface DocEditorSavePayload {
  markdown: string;
  frontmatter: DocFrontmatter;
  body: string;
  revision?: string;
}

export interface DocEditorSaveResult {
  revision: string;
  /** 保存成功后的全文；阅读态乐观更新用，API 可省略 */
  markdown?: string;
}

export class DocEditorConflictError extends Error {
  readonly remoteMarkdown: string;
  readonly remoteRevision: string;

  constructor(message: string, remoteMarkdown: string, remoteRevision: string) {
    super(message);
    this.name = 'DocEditorConflictError';
    this.remoteMarkdown = remoteMarkdown;
    this.remoteRevision = remoteRevision;
  }
}

export interface UseDocEditorOptions {
  initialSource?: string;
  initialRevision?: string;
  debounceMs?: number;
  onSave?: (payload: DocEditorSavePayload) => Promise<DocEditorSaveResult>;
}

/** 文档编辑状态：dirty / 预览 debounce / 保存 / 冲突 */
export function useDocEditor(options: UseDocEditorOptions = {}) {
  const markdown = ref(options.initialSource ?? '');
  const savedMarkdown = ref(options.initialSource ?? '');
  const revision = ref(options.initialRevision ?? '');
  const saving = ref(false);
  const conflictOpen = ref(false);
  const remoteMarkdown = ref('');
  const remoteRevision = ref('');

  const previewSource = useDebouncedRef(markdown, options.debounceMs ?? 300);
  const frontmatter = shallowRef<DocFrontmatter>({});

  const dirty = computed(() => markdown.value !== savedMarkdown.value);

  function syncFrontmatterFromMarkdown() {
    frontmatter.value = splitFrontmatter(markdown.value).frontmatter;
  }

  function updateFrontmatter(next: DocFrontmatter) {
    const { body } = splitFrontmatter(markdown.value);
    frontmatter.value = next;
    markdown.value = stringifyFrontmatter(body, next);
  }

  function markSaved(nextRevision?: string) {
    savedMarkdown.value = markdown.value;
    if (nextRevision) {
      revision.value = nextRevision;
    }
  }

  async function save() {
    if (!options.onSave) {
      markSaved();
      return null;
    }
    saving.value = true;
    try {
      const parsed = splitFrontmatter(markdown.value);
      const result = await options.onSave({
        markdown: markdown.value,
        frontmatter: parsed.frontmatter,
        body: parsed.body,
        revision: revision.value,
      });
      markSaved(result.revision);
      return { ...result, markdown: markdown.value };
    } catch (cause) {
      if (cause instanceof DocEditorConflictError) {
        conflictOpen.value = true;
        remoteMarkdown.value = cause.remoteMarkdown;
        remoteRevision.value = cause.remoteRevision;
        return null;
      }
      throw cause;
    } finally {
      saving.value = false;
    }
  }

  function resolveConflict(mode: 'overwrite' | 'merge' | 'cancel') {
    if (mode === 'overwrite') {
      markdown.value = remoteMarkdown.value;
      revision.value = remoteRevision.value;
      syncFrontmatterFromMarkdown();
      markSaved(remoteRevision.value);
    } else if (mode === 'merge') {
      const local = splitFrontmatter(markdown.value);
      const remote = splitFrontmatter(remoteMarkdown.value);
      markdown.value = stringifyFrontmatter(
        `${remote.body.trim()}\n\n${local.body.trim()}`.trim(),
        { ...remote.frontmatter, ...local.frontmatter },
      );
      revision.value = remoteRevision.value;
      syncFrontmatterFromMarkdown();
    }
    conflictOpen.value = false;
  }

  syncFrontmatterFromMarkdown();

  return {
    markdown,
    previewSource,
    frontmatter,
    revision,
    dirty,
    saving,
    conflictOpen,
    remoteMarkdown,
    remoteRevision,
    save,
    updateFrontmatter,
    syncFrontmatterFromMarkdown,
    resolveConflict,
    markSaved,
  };
}

export type UseDocEditorReturn = ReturnType<typeof useDocEditor>;
