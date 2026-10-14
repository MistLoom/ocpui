<template>
  <AdminPage
    title="运营指挥台"
    subtitle="SRE 事件响应 · 多面板联动 · 双通道反馈 · 10 态编排"
    presentation-mode="scan"
    scene="workbench"
    surface="list"
  >
    <template #toolbar>
      <GlobalSearch
        ref="searchRef"
        :results="searchResults"
        :categories="searchCategories"
        placeholder="搜索事件、动作、页面…"
        @select="onSearchSelect"
      />
      <Button size="sm" variant="secondary" @click="openSearch">⌘K</Button>
      <Button
        size="sm"
        :variant="liveEnabled ? 'primary' : 'secondary'"
        @click="toggleLive"
      >
        {{ liveEnabled ? 'Live 开' : 'Live 关' }}
      </Button>
      <Button size="sm" variant="secondary" :loading="refreshing" @click="fullRefresh">
        全量刷新
      </Button>
      <Button size="sm" variant="text" @click="simulateIncident">注入事件</Button>
    </template>

    <template #tabs>
      <Tabs v-model:value="shellTab" type="line" size="sm">
        <TabPane tab="指挥概览" value="overview" />
        <TabPane tab="事件队列" value="incidents" />
        <TabPane tab="容量热力" value="capacity" />
      </Tabs>
    </template>

    <CommandCenterWorkbench
      ref="workbenchRef"
      :shell-tab="shellTab"
      :live-enabled="liveEnabled"
      @switch-tab="shellTab = $event"
      @live-tick="onLiveTick"
    />
  </AdminPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, GlobalSearch, Tabs, TabPane } from '@ocpui/vue';
import { AdminPage } from '@ocpui/vue-admin';
import { useUiActionFeedback, useUiSystemFeedback } from '@ocpui/vue/system';
import CommandCenterWorkbench from '@/business/CommandCenterWorkbench.vue';
import { commandSearchResults, simulateLiveEvent } from '@/mock/command-center';

const action = useUiActionFeedback();
const system = useUiSystemFeedback();

const shellTab = ref<'overview' | 'incidents' | 'capacity'>('overview');
const liveEnabled = ref(true);
const refreshing = ref(false);
const searchRef = ref<{ open: () => void } | null>(null);
const workbenchRef = ref<InstanceType<typeof CommandCenterWorkbench> | null>(null);

const searchCategories = [
  { key: 'action', label: '动作', count: 2 },
  { key: 'page', label: '页面', count: 1 },
  { key: 'incident', label: '事件', count: 1 },
];
const searchResults = ref(commandSearchResults);

function openSearch() {
  searchRef.value?.open();
}

function toggleLive() {
  liveEnabled.value = !liveEnabled.value;
  action.message.info(liveEnabled.value ? 'Live 流已开启' : 'Live 流已暂停');
}

async function fullRefresh() {
  refreshing.value = true;
  system.loading.bar.start();
  try {
    await workbenchRef.value?.refreshIncidents();
    workbenchRef.value?.refreshMetrics();
    system.notify.success('同步完成', '指标与事件队列已更新');
  } finally {
    system.loading.bar.finish();
    refreshing.value = false;
  }
}

function onLiveTick() {
  const ev = simulateLiveEvent();
  system.notify.show({ type: ev.type, title: ev.title, message: ev.message, duration: 3500 });
}

function simulateIncident() {
  const ev = simulateLiveEvent();
  system.notify.warning(ev.title, ev.message);
  void workbenchRef.value?.refreshIncidents();
}

function onSearchSelect(result: { id: string; title: string; category: string }) {
  if (result.id === 'cmd1') {
    shellTab.value = 'incidents';
    action.message.info('请在事件队列中批量选择');
    return;
  }
  if (result.id === 'cmd2') {
    shellTab.value = 'capacity';
    return;
  }
  if (result.id === 'cmd3') {
    onLiveTick();
    return;
  }
  if (result.category === 'incident') {
    shellTab.value = 'incidents';
    action.message.info(result.title);
  }
}
</script>
