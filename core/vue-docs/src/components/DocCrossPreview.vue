<template>
  <div
    class="doc-cross-preview"
    data-ui-dispatch-role="overlay-host"
    role="complementary"
    :aria-label="title || '文档预览'"
  >
    <Spin v-if="state === 'loading'" size="sm" />
    <ErrorStateBlock
      v-else-if="state === 'error'"
      size="sm"
      error-message="无法加载预览"
    />
    <template v-else>
      <p v-if="path" class="doc-cross-preview__path">{{ path }}</p>
      <p class="doc-cross-preview__title">{{ title }}</p>
      <p class="doc-cross-preview__excerpt">{{ excerpt }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ErrorStateBlock, Spin } from '@ocpui/vue/feedback';

interface Props {
  state?: 'loading' | 'ready' | 'error';
  title?: string;
  excerpt?: string;
  path?: string;
}

withDefaults(defineProps<Props>(), {
  state: 'ready',
  title: '',
  excerpt: '',
  path: '',
});
</script>

<style scoped>
.doc-cross-preview {
  width: min(20rem, 80vw);
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  box-shadow: var(--shadow-md, 0 8px 24px rgb(0 0 0 / 12%));
}

.doc-cross-preview__path {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
  word-break: break-all;
}

.doc-cross-preview__title {
  margin: 0 0 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.doc-cross-preview__excerpt {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: hsl(var(--text-muted));
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
