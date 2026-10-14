<template>
  <div class="doc-markdown-editor">
    <!-- 始终有可编辑正文：textarea 兜底；CodeMirror 成功挂载后隐藏 textarea -->
    <textarea
      ref="fallbackRef"
      class="doc-markdown-editor__fallback"
      :class="{ 'doc-markdown-editor__fallback--hidden': Boolean(viewReady) }"
      :value="modelValue"
      spellcheck="false"
      @input="onFallbackInput"
    />
    <div
      v-show="viewReady"
      ref="hostRef"
      class="doc-markdown-editor__host"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
  }>(),
  { modelValue: '' },
);

const emit = defineEmits<{
  'update:modelValue': [string];
}>();

const hostRef = ref<HTMLElement | null>(null);
const fallbackRef = ref<HTMLTextAreaElement | null>(null);
const viewReady = ref(false);
const view = shallowRef<EditorView | null>(null);
let applyingExternal = false;

function createState(doc: string) {
  return EditorState.create({
    doc,
    extensions: [
      lineNumbers(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown({ base: markdownLanguage }),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (!update.docChanged || applyingExternal) {
          return;
        }
        emit('update:modelValue', update.state.doc.toString());
      }),
    ],
  });
}

function destroyView() {
  view.value?.destroy();
  view.value = null;
  viewReady.value = false;
}

function setDoc(value: string) {
  const cm = view.value;
  if (!cm) {
    return;
  }
  const current = cm.state.doc.toString();
  if (value === current) {
    return;
  }
  applyingExternal = true;
  cm.dispatch({
    changes: { from: 0, to: cm.state.doc.length, insert: value },
  });
  applyingExternal = false;
}

function tryMountCodeMirror() {
  const host = hostRef.value;
  if (!host) {
    return false;
  }
  destroyView();
  host.replaceChildren();
  try {
    const cm = new EditorView({
      parent: host,
      state: createState(props.modelValue ?? ''),
    });
    view.value = cm;
    viewReady.value = true;
    return true;
  } catch {
    destroyView();
    return false;
  }
}

function onFallbackInput(event: Event) {
  if (viewReady.value) {
    return;
  }
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
}

onMounted(async () => {
  await nextTick();
  if (!tryMountCodeMirror()) {
    await nextTick();
    tryMountCodeMirror();
  }
});

watch(
  () => props.modelValue,
  (value) => {
    if (viewReady.value) {
      setDoc(value ?? '');
    }
  },
);

onBeforeUnmount(() => {
  destroyView();
});

defineExpose({
  focus: () => {
    if (view.value) {
      view.value.focus();
      return;
    }
    fallbackRef.value?.focus();
  },
  /** 同步读取当前正文，供保存前 flush */
  getMarkdown: () => {
    if (view.value) {
      return view.value.state.doc.toString();
    }
    return fallbackRef.value?.value ?? props.modelValue;
  },
});
</script>

<style scoped>
.doc-markdown-editor {
  min-height: 24rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 0.5rem);
  overflow: hidden;
  color: hsl(var(--text));
  background: hsl(var(--background));
  position: relative;
}

.doc-markdown-editor__host {
  min-height: 24rem;
}

.doc-markdown-editor__host :deep(.cm-editor) {
  min-height: 24rem;
  font-size: 0.875rem;
  font-family: var(--font-mono, ui-monospace, monospace);
  color: inherit;
}

.doc-markdown-editor__host :deep(.cm-content) {
  color: hsl(var(--text));
  caret-color: hsl(var(--text));
}

.doc-markdown-editor__host :deep(.cm-scroller) {
  line-height: 1.6;
  font-family: inherit;
}

.doc-markdown-editor__host :deep(.cm-gutters) {
  background: hsl(var(--muted) / 0.35);
  border-right: 1px solid hsl(var(--border));
  color: hsl(var(--text-muted));
}

.doc-markdown-editor__fallback {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-height: 24rem;
  margin: 0;
  padding: 0.75rem 1rem;
  border: none;
  resize: vertical;
  font-size: 0.875rem;
  line-height: 1.6;
  font-family: var(--font-mono, ui-monospace, monospace);
  color: hsl(var(--text));
  background: transparent;
}

.doc-markdown-editor__fallback--hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  resize: none;
  min-height: 0;
  pointer-events: none;
}
</style>
