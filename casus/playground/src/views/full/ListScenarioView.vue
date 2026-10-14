<template>
  <AdminPage
    title="审核任务列表"
    subtitle="useAdminListRegion + AdminWorkList.regionState"
    presentation-mode="scan"
  >
    <template #toolbar>
      <Button variant="secondary" @click="refresh">刷新</Button>
      <Button variant="primary" @click="simulateSync">系统同步</Button>
    </template>
    <AdminWorkList
      v-bind="workListProps"
      error-text="加载失败，请重试"
      empty-title="暂无审核任务"
    >
      <div
        v-for="row in rows"
        :key="row.id"
        class="awl-row"
        :class="{ 'awl-row--active': row.status === 'pending' }"
      >
        <div>
          <strong>{{ row.name }}</strong>
          <div style="font-size: 0.8125rem; color: hsl(var(--muted-foreground))">
            {{ row.owner }} · {{ row.updatedAt }}
          </div>
        </div>
        <StatusTag :status="row.status" />
      </div>
    </AdminWorkList>
  </AdminPage>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Button, StatusTag } from '@ocpui/vue';
import { AdminPage, AdminWorkList, useAdminListRegion } from '@ocpui/vue-admin';
import { useUiSystemFeedback } from '@ocpui/vue/system';
import { fetchAuditList, type AuditRow } from '@/mock/api';

const system = useUiSystemFeedback();

const listRegion = useAdminListRegion<AuditRow[]>({
  fetch: fetchAuditList,
});

const { workListProps, refresh } = listRegion;
const rows = computed(() => listRegion.data.value ?? []);

async function simulateSync() {
  system.loading.overlay.show({ text: '同步中…' });
  await new Promise((r) => setTimeout(r, 800));
  system.loading.overlay.hide();
  system.notify.success('同步完成', '审核队列已更新');
  await refresh();
}

onMounted(refresh);
</script>
