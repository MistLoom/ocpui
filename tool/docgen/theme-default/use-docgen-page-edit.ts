import { ref, watch, type Ref } from 'vue';
import type { DocCollection } from '@ocpui/markdown-core';
import { getSourceMarkdown } from '@ocpui/markdown-core';
import type { DocEditorSavePayload, DocEditorSaveResult } from '@ocpui/vue-docs/composables/useDocEditor.js';
import { fetchDocSource, saveDocSource } from './doc-edit-client.js';

function readCachedSource(collection: DocCollection, sourceId: string) {
  const source = collection.sources.find((item) => item.id === sourceId);
  if (!source) {
    return null;
  }
  return {
    markdown: getSourceMarkdown(source),
    revision: source.revision ?? '',
  };
}

/** 文档页就地编辑：先用 collection 缓存即时展示，后台同步 revision */
export function useDocgenPageEdit(options: {
  collection: Ref<DocCollection | undefined>;
  activeSourceId: Ref<string>;
  enabled: Ref<boolean>;
}) {
  const syncing = ref(false);
  const error = ref('');
  const initialSource = ref('');
  const revision = ref('');
  const sessionKey = ref('');

  function seedFromCollection(sourceId: string) {
    const collection = options.collection.value;
    if (!collection || !sourceId) {
      initialSource.value = '';
      revision.value = '';
      sessionKey.value = '';
      return false;
    }
    const cached = readCachedSource(collection, sourceId);
    if (!cached) {
      error.value = '无法加载文档';
      initialSource.value = '';
      revision.value = '';
      sessionKey.value = '';
      return false;
    }
    error.value = '';
    initialSource.value = cached.markdown;
    revision.value = cached.revision;
    sessionKey.value = sourceId;
    return true;
  }

  async function syncRemote(sourceId: string) {
    const collection = options.collection.value;
    if (!collection || !sourceId) {
      return;
    }
    syncing.value = true;
    try {
      const remote = await fetchDocSource({
        collectionId: collection.id,
        sourceId,
      });
      revision.value = remote.revision;
      // 不改 sessionKey，避免编辑器整页 remount 导致内容闪空
      // 拒绝空远端覆盖已有正文
      if (remote.markdown.trim() && remote.markdown !== initialSource.value) {
        initialSource.value = remote.markdown;
      }
    } catch {
      if (!initialSource.value) {
        error.value = '无法加载文档';
      }
    } finally {
      syncing.value = false;
    }
  }

watch(
  [options.enabled, options.activeSourceId],
  ([enabled, sourceId]) => {
    if (!enabled) {
      syncing.value = false;
      error.value = '';
      // 退出编辑时不清空 initialSource，再次进入可立即展示
      return;
    }
    if (seedFromCollection(sourceId)) {
      void syncRemote(sourceId);
    }
  },
  { immediate: true },
);

  async function save(payload: DocEditorSavePayload): Promise<DocEditorSaveResult> {
    const collection = options.collection.value;
    const sourceId = options.activeSourceId.value;
    if (!collection || !sourceId) {
      throw new Error('缺少 collection 或 sourceId');
    }
    const result = await saveDocSource({
      ...payload,
      collectionId: collection.id,
      sourceId,
    });
    revision.value = result.revision;
    // 保存成功后立即以本次正文为编辑会话真源，避免仍读旧 collection 缓存
    initialSource.value = payload.markdown;
    return result;
  }

  return {
    syncing,
    error,
    initialSource,
    revision,
    sessionKey,
    save,
    reload: async () => {
      const sourceId = options.activeSourceId.value;
      // 保存后只同步远端权威内容：不回种 collection（可能尚未按磁盘重建，
      // 回种过期正文会与编辑器当前内容往返触发整器重挂载）
      if (options.collection.value && sourceId) {
        await syncRemote(sourceId);
      }
    },
  };
}
