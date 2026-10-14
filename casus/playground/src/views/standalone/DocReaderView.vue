<template>
  <UiRoot>
    <div class="doc-reader-demo">
      <DocReaderShell
        doc-id="playground-doc-reader"
        :source="activeSource"
        :title="activeTitle"
        description="DocReaderShell · Ctrl+K 检索 · 跳转高亮"
        :search-documents="searchDocuments"
        @search-select="handleSearchSelect"
      />
    </div>
  </UiRoot>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  buildSearchDocumentFromMarkdown,
  type DocSearchDocument,
  type DocSearchHit,
} from '@ocpui/markdown-core';
import { UiRoot } from '@ocpui/vue';
import DocReaderShell from '@ocpui/vue-docs/components/DocReaderShell.vue';
import '@ocpui/vue-docs/styles/doc-reading';
import { DOC_API_SAMPLE } from '@/mock/doc-api-sample';
import { DOC_READER_SAMPLE } from '@/mock/doc-reader-sample';

const searchDocuments = ref<DocSearchDocument[]>([]);
const activeDocId = ref('manual');

const activeSource = computed(() =>
  activeDocId.value === 'api' ? DOC_API_SAMPLE : DOC_READER_SAMPLE,
);

const activeTitle = computed(() =>
  activeDocId.value === 'api' ? '编译 API' : '平台操作手册',
);

onMounted(async () => {
  searchDocuments.value = await Promise.all([
    buildSearchDocumentFromMarkdown('manual', 'manual/index.md', DOC_READER_SAMPLE),
    buildSearchDocumentFromMarkdown('api', 'api/compile.md', DOC_API_SAMPLE),
  ]);
});

function handleSearchSelect(hit: DocSearchHit) {
  if (hit.docId !== activeDocId.value) {
    activeDocId.value = hit.docId;
  }
}
</script>

<style scoped>
.doc-reader-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem 4rem;
}
</style>
