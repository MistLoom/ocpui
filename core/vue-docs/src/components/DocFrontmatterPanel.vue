<template>
  <section class="doc-frontmatter-panel">
    <header class="doc-frontmatter-panel__header">
      <h2 class="doc-frontmatter-panel__title">Frontmatter</h2>
      <Button size="sm" variant="ghost" type="button" @click="rawMode = !rawMode">
        {{ rawMode ? '表单' : 'Raw' }}
      </Button>
    </header>

    <Textarea
      v-if="rawMode"
      :model-value="rawValue"
      :rows="8"
      size="sm"
      resize="vertical"
      @update:model-value="handleRawValue"
    />

    <div v-else class="doc-frontmatter-panel__form">
      <label class="doc-frontmatter-panel__field">
        <span>标题</span>
        <Input
          v-model="local.title"
          size="sm"
          @change="emitStructured"
        />
      </label>
      <label class="doc-frontmatter-panel__field">
        <span>描述</span>
        <Textarea
          v-model="local.description"
          :rows="2"
          size="sm"
          resize="vertical"
          @change="emitStructured"
        />
      </label>
      <label class="doc-frontmatter-panel__field">
        <span>标签（逗号分隔）</span>
        <Input
          v-model="tagsText"
          size="sm"
          @change="emitStructured"
        />
      </label>
      <Checkbox v-model="local.draft" size="sm" @change="emitStructured">
        草稿
      </Checkbox>

      <div class="doc-frontmatter-panel__glossary">
        <div class="doc-frontmatter-panel__glossary-head">
          <span>名词表</span>
          <Button size="sm" variant="secondary" type="button" @click="addGlossaryEntry">
            添加
          </Button>
        </div>
        <div
          v-for="(entry, index) in glossaryEntries"
          :key="index"
          class="doc-frontmatter-panel__glossary-row"
        >
          <Input
            v-model="entry.term"
            size="sm"
            placeholder="术语"
            @change="emitStructured"
          />
          <Input
            v-model="entry.definition"
            size="sm"
            placeholder="释义"
            @change="emitStructured"
          />
          <Button
            size="sm"
            variant="ghost"
            type="button"
            aria-label="删除"
            @click="removeGlossaryEntry(index)"
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatFrontmatterYaml, splitFrontmatter, type DocFrontmatter } from '@ocpui/markdown-core';
import { Button, Checkbox, Input, Textarea } from '@ocpui/vue';
import { reactive, ref, watch } from 'vue';

interface Props {
  frontmatter: DocFrontmatter;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:frontmatter': [DocFrontmatter];
}>();

const rawMode = ref(false);
const rawValue = ref('');
const tagsText = ref('');
const glossaryEntries = ref<Array<{ term: string; definition: string }>>([]);
const local = reactive<{
  title: string;
  description: string;
  draft: boolean;
}>({
  title: '',
  description: '',
  draft: false,
});

function syncFromProps(value: DocFrontmatter) {
  local.title = String(value.title ?? '');
  local.description = String(value.description ?? '');
  local.draft = Boolean(value.draft);
  tagsText.value = Array.isArray(value.tags) ? value.tags.map(String).join(', ') : '';
  glossaryEntries.value = Object.entries(value.glossary ?? {}).map(([term, definition]) => ({
    term,
    definition: String(definition),
  }));
  rawValue.value = formatFrontmatterYaml(value);
}

function buildFrontmatter(): DocFrontmatter {
  const glossary = glossaryEntries.value.reduce<Record<string, string>>((acc, entry) => {
    if (entry.term.trim() && entry.definition.trim()) {
      acc[entry.term.trim()] = entry.definition.trim();
    }
    return acc;
  }, {});

  return {
    ...props.frontmatter,
    title: local.title.trim() || undefined,
    description: local.description.trim() || undefined,
    draft: local.draft || undefined,
    tags: tagsText.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    glossary: Object.keys(glossary).length ? glossary : undefined,
  };
}

function emitStructured() {
  emit('update:frontmatter', buildFrontmatter());
}

function handleRawValue(value: string) {
  rawValue.value = value;
  const parsed = splitFrontmatter(`---\n${value}\n---\n`).frontmatter;
  emit('update:frontmatter', parsed);
}

function addGlossaryEntry() {
  glossaryEntries.value.push({ term: '', definition: '' });
}

function removeGlossaryEntry(index: number) {
  glossaryEntries.value.splice(index, 1);
  emitStructured();
}

watch(
  () => props.frontmatter,
  (value) => syncFromProps(value),
  { immediate: true, deep: true },
);
</script>

<style scoped>
.doc-frontmatter-panel {
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 0.5rem);
  padding: 0.875rem;
  background: hsl(var(--muted) / 0.15);
}

.doc-frontmatter-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.doc-frontmatter-panel__title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--text));
}

.doc-frontmatter-panel__form {
  display: grid;
  gap: 0.75rem;
}

.doc-frontmatter-panel__field {
  display: grid;
  gap: 0.25rem;
  font-size: 0.8125rem;
  color: hsl(var(--text-muted));
}

.doc-frontmatter-panel__glossary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.8125rem;
  margin-bottom: 0.375rem;
  color: hsl(var(--text-muted));
}

.doc-frontmatter-panel__glossary-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
  align-items: center;
}
</style>
