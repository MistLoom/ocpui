<template>
  <AdminPage title="批量审核" subtitle="InteractiveBatchAuditPanel：GlobalSearch + SelectionToolbar + 双通道">
    <template #toolbar>
      <Button variant="secondary" @click="load">刷新</Button>
      <Button @click="panelRef?.openSearch?.()">打开搜索</Button>
    </template>
    <InteractiveBatchAuditPanel
      ref="panelRef"
      :rows="rows"
      :loading="loading"
      @refresh="load"
      @batch-approve="onBatchApprove"
    />
  </AdminPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Button } from '@ocpui/vue';
import { AdminPage } from '@ocpui/vue-admin';
import InteractiveBatchAuditPanel from '@/business/InteractiveBatchAuditPanel.vue';
import { batchApprove, fetchAuditList, type AuditRow } from '@/mock/api';

const panelRef = ref<InstanceType<typeof InteractiveBatchAuditPanel> | null>(null);
const rows = ref<AuditRow[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    rows.value = await fetchAuditList();
  } finally {
    loading.value = false;
  }
}

async function onBatchApprove(ids: string[]) {
  await batchApprove(ids);
  await load();
}

onMounted(load);
</script>
