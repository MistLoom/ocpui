<template>

  <article

    ref="rootRef"

    class="markdown-body"

    :data-ui-presentation-mode="presentationMode"

    :style="readingStyle"

  >

    <Spin v-if="loading" size="md" />

    <ErrorStateBlock

      v-else-if="error"

      size="sm"

      :error-message="error.message"

      @retry="retryCompile"

    />

    <div

      v-else

      ref="contentRef"

      class="markdown-body__content"

      v-html="displayHtml"

    />

    <DocContentEnhancer

      v-if="contentRef && enableEnhancements"

      :root="contentRef"

      :glossary="mergedGlossary"

      :resolve-cross-preview="resolveCrossPreview"

    />

  </article>

</template>



<script setup lang="ts">

import { computed, ref, toRef, watch } from 'vue';

import type { CompileOptions, CompileResult, DocHeading } from '@ocpui/markdown-core';

import { ErrorStateBlock, Spin } from '@ocpui/vue/feedback';

import DocContentEnhancer from './DocContentEnhancer.vue';

import { useMarkdownCompile } from '../composables/useMarkdownCompile.js';

import { enhanceDocCodeBlocks } from '../utils/enhanceDocCodeBlocks.js';
import { enhanceDocDemos, teardownDocDemos } from '../utils/enhanceDocDemos.js';

import { DEFAULT_DOC_MARKDOWN_PLUGINS } from '../constants/default-markdown-plugins.js';

import { mergeGlossaryMaps, type DocCrossPreviewResolver } from '../types/doc-enhance.js';

import { useDocReadingPrefs } from '../composables/useDocReadingPrefs.js';



interface Props {

  source?: string;

  /** docgen SSG 预编译 HTML；存在时跳过客户端 compile */

  precompiledHtml?: string;

  precompiledHeadings?: DocHeading[];

  plugins?: CompileOptions['plugins'];

  autolinkHeadings?: boolean;

  presentationMode?: 'read';

  /** 行宽 CSS 值，默认 var(--doc-measure) */

  measure?: string;

  glossary?: Record<string, string>;

  collectionGlossary?: Record<string, string>;

  resolveCrossPreview?: DocCrossPreviewResolver;

  enableEnhancements?: boolean;

}



const props = withDefaults(defineProps<Props>(), {

  source: '',

  autolinkHeadings: true,

  presentationMode: 'read',

  enableEnhancements: true,

});



const emit = defineEmits<{

  compiled: [CompileResult];

  error: [Error];

}>();



const rootRef = ref<HTMLElement | null>(null);

const contentRef = ref<HTMLElement | null>(null);

const sourceRef = toRef(props, 'source');



const mergedGlossary = computed(() =>

  mergeGlossaryMaps(props.collectionGlossary, props.glossary),

);



const { cssVars } = useDocReadingPrefs();



const usePrecompiled = computed(() => Boolean(props.precompiledHtml?.trim()));



const compileSourceRef = computed(() =>

  usePrecompiled.value ? '' : (props.source ?? ''),

);



const { html: compiledHtml, result, loading, error, compile } = useMarkdownCompile(compileSourceRef, {

  plugins: props.plugins ?? DEFAULT_DOC_MARKDOWN_PLUGINS,

  autolinkHeadings: props.autolinkHeadings,

  immediate: true,

});



const displayHtml = computed(() =>

  usePrecompiled.value ? (props.precompiledHtml ?? '') : compiledHtml.value,

);



const readingStyle = computed(() => ({

  ...cssVars.value,

  '--doc-measure-local': props.measure ?? cssVars.value['--doc-measure'],

}));



function emitPrecompiledResult() {

  if (!usePrecompiled.value || !props.precompiledHtml) {

    return;

  }

  const payload: CompileResult = {

    html: props.precompiledHtml,

    headings: props.precompiledHeadings ?? [],

    frontmatter: {},

    body: props.source ?? '',

  };

  emit('compiled', payload);

}



function retryCompile() {

  if (usePrecompiled.value) {

    return;

  }

  void compile(props.source);

}



watch(result, (value) => {

  if (value && !usePrecompiled.value) {

    emit('compiled', value);

  }

});



watch(

  () => [props.precompiledHtml, props.precompiledHeadings] as const,

  () => {

    emitPrecompiledResult();

  },

  { immediate: true },

);



watch(error, (value) => {

  if (value) {

    emit('error', value);

  }

});



watch(displayHtml, async () => {

  await Promise.resolve();

  if (contentRef.value) {

    teardownDocDemos(contentRef.value);

    enhanceDocCodeBlocks(contentRef.value);

    await enhanceDocDemos(contentRef.value);

  }

});



defineExpose({
  result,
  compile,
  rootRef,
  contentRef,
});

</script>



<style scoped>

.markdown-body {

  width: 100%;

  max-width: var(--doc-measure-local, var(--doc-measure, 72ch));

  margin-inline: auto;

}

</style>


