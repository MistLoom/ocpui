<template>
  <AdminPage
    title="用户账户"
    subtitle="ocp-list-page-stack + SelectionToolbar + DataTable"
    presentation-mode="scan"
  >
    <template #toolbar>
      <div class="ocp-filter-row ocp-filter-row--block">
        <Input v-model="keyword" placeholder="筛选姓名…" style="max-width: 220px" />
        <Button variant="secondary" @click="load">刷新</Button>
      </div>
    </template>

    <div class="ocp-list-page-stack">
      <SelectionToolbar
        :visible="selectedKeys.length > 0"
        :count="selectedKeys.length"
        :selected-items="selectedRows"
        :actions="toolbarActions"
        position="bottom"
        @action-click="onToolbarAction"
        @clear="selectedKeys = []"
      />
      <DataTable
        :columns="columns"
        :data="pageRows"
        :loading="loading"
        :pagination="true"
        pagination-mode="client"
        :total="filtered.length"
        :current-page="page"
        :page-size="pageSize"
        :selectable="true"
        :selected-keys="selectedKeys"
        row-key="id"
        @page-change="page = $event"
        @select="onSelect"
        @row-click="onRowClick"
      />
    </div>
  </AdminPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Button, Input, SelectionToolbar } from '@ocpui/vue';
import { AdminPage, DataTable } from '@ocpui/vue-admin';
import { useUiActionFeedback } from '@ocpui/vue/system';

interface UserRow {
  id: string;
  name: string;
  role: string;
  email: string;
}

const action = useUiActionFeedback();

const allRows = ref<UserRow[]>([]);
const loading = ref(false);
const keyword = ref('');
const page = ref(1);
const pageSize = 10;
const selectedKeys = ref<string[]>([]);

const columns = [
  { key: 'name', title: '姓名', sorter: true },
  { key: 'role', title: '角色' },
  { key: 'email', title: '邮箱' },
];

const toolbarActions = [
  { key: 'export', label: '导出选中', variant: 'secondary' as const },
  { key: 'delete', label: '删除选中', variant: 'primary' as const },
];

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return allRows.value;
  return allRows.value.filter((r) => r.name.toLowerCase().includes(q));
});

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const selectedRows = computed(() =>
  allRows.value.filter((r) => selectedKeys.value.includes(r.id)),
);

async function load() {
  loading.value = true;
  await new Promise((r) => setTimeout(r, 400));
  allRows.value = Array.from({ length: 28 }, (_, i) => ({
    id: String(i + 1),
    name: `用户 ${i + 1}`,
    role: i % 3 === 0 ? '管理员' : '编辑者',
    email: `user${i + 1}@demo.local`,
  }));
  loading.value = false;
}

function onSelect(keys: (string | number)[]) {
  selectedKeys.value = keys.map(String);
}

function onRowClick(row: Record<string, unknown>) {
  action.message.info(`选中行：${row.name}`);
}

function onToolbarAction(toolbarAction: { key: string }) {
  action.message.info(`${toolbarAction.key}：${selectedKeys.value.length} 项`);
}

onMounted(load);
</script>
