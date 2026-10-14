<template>
  <UiRoot>
    <div class="doc-wiki-demo">
      <DocWikiShell
        :collection="PLAYGROUND_DOC_COLLECTION"
        initial-source-id="manual"
      />
    </div>
  </UiRoot>
</template>

<script setup lang="ts">
import { UiRoot } from '@ocpui/vue';
import DocWikiShell from '@ocpui/vue-docs/components/DocWikiShell.vue';
import '@ocpui/vue-docs/styles/doc-reading';
import { PLAYGROUND_DOC_COLLECTION } from 'virtual:playground-doc-collection';
</script>

<style scoped>
.doc-wiki-demo {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem 4rem;
}
</style>
