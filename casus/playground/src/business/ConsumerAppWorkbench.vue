<template>
  <ConsumerShell v-model="activeTab" :nav-items="navItems">
    <div class="consumer-app">
      <div v-show="activeTab === 'discover'" class="consumer-app__pane">
        <DiscoverFeedPanel />
      </div>
      <div v-show="activeTab === 'chronicle'" class="consumer-app__pane">
        <ChroniclePanel />
      </div>
      <div v-show="activeTab === 'search'" class="consumer-app__pane">
        <SearchPanel ref="searchPanelRef" />
      </div>
      <div v-show="activeTab === 'profile'" class="consumer-app__pane">
        <ProfilePanel />
      </div>
    </div>
  </ConsumerShell>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import type { BottomNavItem } from '@ocpui/vue';
import ConsumerShell from '@/business/ConsumerShell.vue';
import DiscoverFeedPanel from '@/business/DiscoverFeedPanel.vue';
import ChroniclePanel from '@/business/ChroniclePanel.vue';
import SearchPanel from '@/business/SearchPanel.vue';
import ProfilePanel from '@/business/ProfilePanel.vue';

const activeTab = ref('discover');
const searchPanelRef = ref<InstanceType<typeof SearchPanel> | null>(null);

const navItems: BottomNavItem[] = [
  { key: 'discover', label: '发现', icon: 'compass' },
  { key: 'chronicle', label: '历程', icon: 'clock' },
  { key: 'search', label: '检索', icon: 'search' },
  { key: 'profile', label: '我的', icon: 'user', badge: '3' },
];

watch(activeTab, (tab) => {
  if (tab === 'search') {
    nextTick(() => searchPanelRef.value?.focus());
  }
});
</script>

<style scoped>
.consumer-app {
  padding: 0.5rem var(--page-inline-xs) 0.75rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .consumer-app {
    padding: 0.75rem var(--page-inline-sm) 1rem;
  }
}

.consumer-app__pane {
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
