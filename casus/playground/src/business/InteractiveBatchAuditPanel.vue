<template>
  <div class="batch-audit ocp-list-page-stack" v-bind="dispatchAttrs">
    <div class="batch-audit__toolbar-row">
      <GlobalSearch
        ref="searchRef"
        :results="filteredResults"
        :categories="searchCategories"
        :history="searchHistory"
        placeholder="搜索场景与操作…"
        @search="onSearch"
        @select="onSearchSelect"
        @history-change="searchHistory = $event"
      />
      <Button size="sm" variant="secondary" @click="openSearch">⌘K 搜索</Button>
    </div>

    <SelectionToolbar
      :visible="selectedKeys.length > 0"
      :count="selectedKeys.length"
      :selected-items="selectedRows"
      :actions="toolbarActions"
      position="top"
      @action-click="onToolbarAction"
      @clear="clearSelection"
    />

    <DataTable
      :columns="columns"
      :data="rows"
      row-key="id"
      :selectable="true"
      :selected-keys="selectedKeys"
      :loading="loading"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button, GlobalSearch, SelectionToolbar } from '@ocpui/vue';
import { DataTable } from '@ocpui/vue-admin';
import { shellDispatchAttrs, useUiActionFeedback } from '@ocpui/vue/system';
import { searchCategories, searchResults as defaultResults } from '@/mock/api';
import type { AuditRow } from '@/mock/api';

const props = defineProps<{
  rows: AuditRow[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
  'batch-approve': [ids: string[]];
}>();

const dispatchAttrs = shellDispatchAttrs('content-host');
const action = useUiActionFeedback();

const searchRef = ref<{ open: () => void } | null>(null);
const searchHistory = ref<string[]>([]);
const filteredResults = ref(defaultResults);
const selectedKeys = ref<string[]>([]);

const columns = [
  { key: 'name', title: '任务' },
  { key: 'status', title: '状态' },
  { key: 'owner', title: '负责人' },
  { key: 'updatedAt', title: '更新时间' },
];

const selectedRows = computed(() =>
  props.rows.filter((r) => selectedKeys.value.includes(r.id)),
);

const toolbarActions = [
  { key: 'approve', label: '批量通过', variant: 'primary' as const },
  { key: 'reject', label: '批量驳回', variant: 'secondary' as const },
];

function onSelect(keys: (string | number)[]) {
  selectedKeys.value = keys.map(String);
}

function clearSelection() {
  selectedKeys.value = [];
}

async function onToolbarAction(toolbarAction: { key: string }, _items: AuditRow[]) {
  if (toolbarAction.key === 'approve') {
    const ok = await action.dialog.confirm({
      title: '批量通过',
      content: `确认通过 ${selectedKeys.value.length} 项？`,
    });
    if (ok) {
      emit('batch-approve', [...selectedKeys.value]);
      action.message.success('已通过选中项');
      clearSelection();
    }
    return;
  }
  if (toolbarAction.key === 'reject') {
    action.message.warning('演示环境未实现驳回');
  }
}

function onSearch(keyword: string) {
  const q = keyword.trim().toLowerCase();
  filteredResults.value = q
    ? defaultResults.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description?.toLowerCase().includes(q) ?? false),
      )
    : defaultResults;
}

function onSearchSelect(result: { id: string; title: string }) {
  action.message.info(`已选择：${result.title}`);
}

function openSearch() {
  searchRef.value?.open();
}

defineExpose({ openSearch });
</script>

<style scoped>
.batch-audit__toolbar-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
