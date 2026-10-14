<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    disabled?: boolean
    placeholder?: string
    aiProcessing?: boolean
  }>(),
  {
    modelValue: '',
    disabled: false,
    placeholder: '输入内容…',
    aiProcessing: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'aiAction': [action: string, prompt: string]
}>()

const editor = shallowRef<Editor | null>(null)
const ready = ref(false)
const aiPromptVisible = ref(false)
const aiPromptText = ref('')
const aiPendingAction = ref('')

const aiActions = [
  { key: 'polish', label: 'AI润色' },
  { key: 'expand', label: 'AI扩写' },
  { key: 'shorten', label: 'AI缩写' },
  { key: 'translate', label: 'AI翻译' },
]

function triggerAiAction(action: string) {
  if (!editor.value || editor.value.isEmpty) return
  aiPendingAction.value = action
  aiPromptVisible.value = true
}

function submitAiPrompt() {
  if (!aiPromptText.value.trim()) return
  emit('aiAction', aiPendingAction.value, aiPromptText.value.trim())
  aiPromptVisible.value = false
  aiPromptText.value = ''
}

function cancelAiPrompt() {
  aiPromptVisible.value = false
  aiPromptText.value = ''
}

onMounted(() => {
  editor.value = new Editor({
    extensions: [StarterKit],
    content: props.modelValue || '',
    editable: !props.disabled,
    onUpdate: ({ editor: ed }) => {
      emit('update:modelValue', ed.getHTML())
    },
  })
  ready.value = true
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return
    const current = editor.value.getHTML()
    if (value !== current) {
      editor.value.commands.setContent(value || '', { emitUpdate: false })
    }
  },
)

watch(
  () => props.disabled,
  (disabled) => {
    editor.value?.setEditable(!disabled)
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
  editor.value = null
})

function run(
  command: 'toggleBold' | 'toggleItalic' | 'toggleBulletList' | 'toggleOrderedList' | 'toggleHeading',
) {
  if (!editor.value) return
  if (command === 'toggleHeading') {
    editor.value.chain().focus().toggleHeading({ level: 2 }).run()
    return
  }
  editor.value.chain().focus()[command]().run()
}

function insertContent(content: string) {
  if (!editor.value) return
  editor.value.chain().focus().insertContent(content).run()
}

function getSelectedText(): string {
  return editor.value?.state.doc.textBetween(
    editor.value.state.selection.from,
    editor.value.state.selection.to,
    ' ',
  ) || ''
}

defineExpose({ insertContent, getSelectedText })
</script>

<template>
  <div class="tiptap-editor" :class="{ 'is-disabled': disabled }">
    <div class="tiptap-toolbar">
      <button type="button" :disabled="disabled" @click="run('toggleBold')">粗体</button>
      <button type="button" :disabled="disabled" @click="run('toggleItalic')">斜体</button>
      <button type="button" :disabled="disabled" @click="run('toggleHeading')">标题</button>
      <button type="button" :disabled="disabled" @click="run('toggleBulletList')">无序</button>
      <button type="button" :disabled="disabled" @click="run('toggleOrderedList')">有序</button>
      <span class="tiptap-toolbar-sep" />
      <button
        v-for="ai in aiActions"
        :key="ai.key"
        type="button"
        :disabled="disabled || aiProcessing"
        class="tiptap-ai-btn"
        @click="triggerAiAction(ai.key)"
      >{{ ai.label }}</button>
    </div>
    <div v-if="aiPromptVisible" class="tiptap-ai-prompt">
      <input
        v-model="aiPromptText"
        class="tiptap-ai-prompt-input"
        placeholder="输入指令，如：更正式、更简洁、翻译为英文…"
        :disabled="aiProcessing"
        @keydown.enter="submitAiPrompt"
        @keydown.escape="cancelAiPrompt"
      />
      <button type="button" class="tiptap-ai-prompt-btn" :disabled="aiProcessing || !aiPromptText.trim()" @click="submitAiPrompt">
        {{ aiProcessing ? '处理中…' : '执行' }}
      </button>
      <button type="button" class="tiptap-ai-prompt-cancel" @click="cancelAiPrompt">取消</button>
    </div>
    <EditorContent v-if="ready && editor" :editor="editor" class="tiptap-content" />
    <p v-else class="tiptap-placeholder">{{ placeholder }}</p>
  </div>
</template>

<style scoped>
.tiptap-editor {
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  background: hsl(var(--background));
}

.tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem;
  border-bottom: 1px solid hsl(var(--border));
}

.tiptap-toolbar button {
  border: 1px solid hsl(var(--border));
  border-radius: 0.35rem;
  padding: 0.2rem 0.55rem;
  font-size: 0.75rem;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s;
}

.tiptap-toolbar button:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
}

.tiptap-toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tiptap-toolbar-sep {
  width: 1px;
  height: 1.1em;
  background: hsl(var(--border));
  margin: 0 0.2rem;
}

.tiptap-ai-btn {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary) / 0.3) !important;
}

.tiptap-ai-btn:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.08) !important;
}

.tiptap-ai-prompt {
  display: flex;
  gap: 0.35rem;
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--surface-hover) / 0.3);
}

.tiptap-ai-prompt-input {
  flex: 1;
  height: 1.75rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.25rem;
  background: hsl(var(--background));
  outline: none;
}

.tiptap-ai-prompt-input:focus {
  border-color: hsl(var(--primary) / 0.5);
}

.tiptap-ai-prompt-btn {
  padding: 0 0.6rem;
  font-size: 0.75rem;
  border: 1px solid hsl(var(--primary) / 0.3);
  border-radius: 0.25rem;
  background: transparent;
  color: hsl(var(--primary));
  cursor: pointer;
  white-space: nowrap;
}

.tiptap-ai-prompt-btn:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.08);
}

.tiptap-ai-prompt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tiptap-ai-prompt-cancel {
  padding: 0 0.5rem;
  font-size: 0.75rem;
  border: none;
  background: transparent;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  white-space: nowrap;
}

.tiptap-content {
  min-height: 12rem;
  padding: 0.75rem 1rem;
}

.tiptap-content :deep(.ProseMirror) {
  outline: none;
  min-height: 10rem;
}

.tiptap-placeholder {
  margin: 0;
  padding: 1rem;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}

.is-disabled {
  opacity: 0.7;
}
</style>
