<template>
  <div class="doc-visual-editor" data-ui-dispatch-role="focus-host">
    <div ref="rootRef" class="doc-visual-editor__root" />
    <p v-if="bootError" class="doc-visual-editor__error">{{ bootError }}</p>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/classic.css';
import '../styles/doc-visual-editor.css';

interface Props {
  /** 正文 Markdown（不含 frontmatter） */
  modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
});

const emit = defineEmits<{
  'update:modelValue': [string];
  ready: [];
  error: [message: string];
}>();

const rootRef = ref<HTMLElement | null>(null);
const bootError = ref('');
const crepeRef = shallowRef<Crepe | null>(null);
const ready = ref(false);
/** 忽略初始化阶段的空回写，防止清空正文 */
const acceptUpdates = ref(false);
/** 最近一次由编辑器自身发出的正文（归一化），用于识别 props 回声、避免无谓重建 */
const lastEmitted = ref('');

/** 归一化正文用于回声比较：首尾空白无语义 */
function normalizeBody(value: string): string {
  return value.trim();
}

function emitMarkdown(next: string) {
  // 有正文时拒绝被空文档覆盖
  if (!next.trim() && props.modelValue.trim()) {
    return;
  }
  const normalized = normalizeBody(next);
  lastEmitted.value = normalized;
  // 初始化归一化与当前正文一致时不回写，避免打开条目就刷新整份数据
  if (normalized === normalizeBody(props.modelValue)) {
    return;
  }
  emit('update:modelValue', next);
}

async function mountEditor(markdown: string) {
  const root = rootRef.value;
  if (!root) {
    return;
  }

  await crepeRef.value?.destroy().catch(() => undefined);
  crepeRef.value = null;
  root.replaceChildren();
  bootError.value = '';
  acceptUpdates.value = false;
  ready.value = false;
  lastEmitted.value = normalizeBody(markdown);

  try {
    const crepe = new Crepe({
      root,
      defaultValue: markdown,
    });

    crepe.on((listener) => {
      listener.mounted(() => {
        ready.value = true;
        acceptUpdates.value = true;
        emit('ready');
      });
      listener.markdownUpdated((_ctx, next, prev) => {
        if (!acceptUpdates.value || next === prev) {
          return;
        }
        emitMarkdown(next);
      });
    });

    await crepe.create();
    crepeRef.value = crepe;

    const current = crepe.getMarkdown();
    if (!current.trim() && markdown.trim()) {
      bootError.value = '可视化解析失败，请改用源码模式';
      emit('error', bootError.value);
    }
  } catch (cause) {
    bootError.value = cause instanceof Error ? cause.message : '编辑器初始化失败';
    emit('error', bootError.value);
  }
}

onMounted(() => {
  void nextTick(() => mountEditor(props.modelValue));
});

watch(
  () => props.modelValue,
  (value) => {
    const crepe = crepeRef.value;
    if (!crepe || !ready.value) {
      return;
    }
    const incoming = normalizeBody(value);
    // 自身回写产生的 props 回声：不重建，避免输入时整器重挂载丢内容
    if (incoming === lastEmitted.value) {
      return;
    }
    if (incoming === normalizeBody(crepe.getMarkdown())) {
      lastEmitted.value = incoming;
      return;
    }
    // 外部强制换文（冲突覆盖等）时重建
    void mountEditor(value);
  },
);

onBeforeUnmount(() => {
  acceptUpdates.value = false;
  void crepeRef.value?.destroy().catch(() => undefined);
  crepeRef.value = null;
});

/** 同步读取当前 ProseMirror 文档的 Markdown，供保存前 flush（不等 200ms debounce） */
function getMarkdown(): string {
  if (!crepeRef.value || !ready.value) {
    return props.modelValue;
  }
  return crepeRef.value.getMarkdown();
}

defineExpose({
  getMarkdown,
});
</script>

<style scoped>
.doc-visual-editor__root {
  width: 100%;
  min-height: 12rem;
}

.doc-visual-editor__error {
  margin: 0.75rem 0 0;
  font-size: 0.8125rem;
  color: hsl(var(--destructive, 0 72% 51%));
}
</style>
