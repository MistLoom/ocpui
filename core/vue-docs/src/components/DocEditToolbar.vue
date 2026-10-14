<template>
  <div class="doc-edit-toolbar doc-chrome" data-ui-dispatch-role="chrome-host">
    <div class="doc-edit-toolbar__status">
      <span v-if="dirty" class="doc-edit-toolbar__dirty" aria-label="未保存">●</span>
      <span class="doc-edit-toolbar__label">
        {{ dirty ? '未保存' : syncing ? '同步中' : '编辑中' }}
      </span>
    </div>

    <div class="doc-edit-toolbar__actions doc-chrome-actions">
      <SegmentedControl
        :model-value="mode"
        size="sm"
        :options="modeOptions"
        aria-label="编辑模式"
        @update:model-value="emit('update:mode', $event as DocEditorMode)"
      />
      <Button size="sm" variant="ghost" type="button" @click.stop="emit('open-meta')">
        元数据
      </Button>
      <slot name="actions" />
      <Button
        size="sm"
        variant="primary"
        :loading="saving"
        :disabled="!dirty || saving"
        @click="emit('save')"
      >
        保存
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button, SegmentedControl } from '@ocpui/vue';
import type { DocEditorMode } from './DocEditorShell.vue';

interface Props {
  dirty?: boolean;
  saving?: boolean;
  syncing?: boolean;
  mode?: DocEditorMode;
}

withDefaults(defineProps<Props>(), {
  dirty: false,
  saving: false,
  syncing: false,
  mode: 'wysiwyg',
});

const emit = defineEmits<{
  save: [];
  'update:mode': [DocEditorMode];
  'open-meta': [];
}>();

const modeOptions = [
  { label: '所见即所得', value: 'wysiwyg' },
  { label: '源码', value: 'source' },
  { label: '分屏', value: 'split' },
];
</script>

<style scoped>
.doc-edit-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 0.5rem);
  background: hsl(var(--background) / 0.92);
  backdrop-filter: blur(6px);
  position: sticky;
  top: 4.5rem;
  z-index: calc(var(--z-sticky, 1100) - 1);
}

.doc-edit-toolbar__status {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: hsl(var(--text-muted));
}

.doc-edit-toolbar__dirty {
  color: hsl(var(--warning, 38 92% 50%));
  font-size: 0.625rem;
}

.doc-edit-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
</style>
