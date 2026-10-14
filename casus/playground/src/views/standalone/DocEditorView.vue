<template>
  <UiRoot>
    <div class="doc-editor-demo">
      <DocEditorShell
        :initial-source="DOC_EDITOR_SAMPLE"
        initial-revision="rev-1"
        title="文档编辑"
        :collection-glossary="COLLECTION_GLOSSARY"
        :resolve-cross-preview="resolveCrossPreview"
        :save-request="handleSave"
        @save="handleSaved"
      />
    </div>
  </UiRoot>
</template>

<script setup lang="ts">
import { UiRoot } from '@ocpui/vue';
import DocEditorShell from '@ocpui/vue-docs/components/DocEditorShell.vue';
import {
  type DocCrossPreviewData,
  type DocEditorSavePayload,
  type DocEditorSaveResult,
  DocEditorConflictError,
} from '@ocpui/vue-docs';
import '@ocpui/vue-docs/styles/doc-reading';
import { DOC_EDITOR_SAMPLE } from '@/mock/doc-editor-sample';

const COLLECTION_GLOSSARY = {
  Wiki: '多文档集合阅读壳',
};

let saveCount = 0;

async function resolveCrossPreview(href: string): Promise<DocCrossPreviewData | null> {
  if (href.includes('compile.md')) {
    return {
      title: 'compile API',
      excerpt: 'compile() 将 Markdown 编译为 HTML，供预览与 SSG 共用。',
      path: href,
    };
  }
  return null;
}

async function handleSave(_payload: DocEditorSavePayload): Promise<DocEditorSaveResult> {
  saveCount += 1;
  if (saveCount === 2) {
    throw new DocEditorConflictError('conflict', DOC_EDITOR_SAMPLE.replace('编辑演示', '远端已更新'), 'rev-remote');
  }
  return { revision: `rev-${saveCount + 1}` };
}

function handleSaved(result: DocEditorSaveResult) {
  console.info('[doc-editor-demo] saved', result.revision);
}
</script>

<style scoped>
.doc-editor-demo {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem 4rem;
}
</style>
