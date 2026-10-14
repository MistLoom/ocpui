<template>
  <UiScenarioScope surface="list" presentation-mode="detail">
    <div class="chronicle-panel">
      <header class="chronicle-panel__intro">
        <h2>发展历程</h2>
        <p>按纪元浏览编年事件，点击条目查看详情。</p>
      </header>

      <section class="chronicle-panel__filters">
        <FilterTagGroup
          v-model="activeType"
          :options="typeOptions"
          size="sm"
        />
      </section>

      <section
        v-for="group in groupedEvents"
        :key="group.era"
        class="chronicle-panel__era"
      >
        <div class="chronicle-panel__era-head">
          <h3>{{ group.era }}</h3>
          <Tag size="sm" variant="default">{{ group.events.length }} 事件</Tag>
        </div>
        <Timeline :mode="isMobile ? 'left' : 'alternate'">
          <TimelineItem
            v-for="event in group.events"
            :key="event.id"
            :title="event.title"
            :description="event.description"
            :time="event.time"
            color="blue"
            custom-class="chronicle-panel__item"
            @click="openDetail(event)"
          >
            <Tag size="sm" :variant="typeVariant(event.type)">
              {{ chronicleTypeLabel(event.type) }}
            </Tag>
          </TimelineItem>
        </Timeline>
      </section>

      <Empty v-if="groupedEvents.length === 0" description="暂无符合条件的事件" />

      <Drawer
        v-model="detailOpen"
        :title="selected?.title"
        :placement="isMobile ? 'bottom' : 'right'"
        size="md"
        :height="isMobile ? '75%' : 300"
      >
        <template v-if="selected">
          <div class="chronicle-panel__detail-meta">
            <Tag size="sm" :variant="typeVariant(selected.type)">
              {{ chronicleTypeLabel(selected.type) }}
            </Tag>
            <span>{{ selected.era }}</span>
            <span>{{ selected.time }}</span>
          </div>
          <p class="chronicle-panel__detail-body">{{ selected.description }}</p>
          <Button size="sm" variant="primary" @click="detailOpen = false">关闭</Button>
        </template>
      </Drawer>
    </div>
  </UiScenarioScope>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Button,
  Drawer,
  Empty,
  FilterTagGroup,
  Tag,
  Timeline,
  TimelineItem,
  UiScenarioScope,
  useBreakpoint,
} from '@ocpui/vue';
import {
  chronicleTypeLabel,
  getChronicleEvents,
  groupChronicleByEra,
  type ChronicleEvent,
} from '@/mock/consumer';

const { isMobile } = useBreakpoint();

const events = getChronicleEvents();
const activeType = ref('全部');
const detailOpen = ref(false);
const selected = ref<ChronicleEvent | null>(null);

const typeOptions = [
  { label: '全部', value: '全部' },
  { label: '里程碑', value: 'milestone' },
  { label: '冲突', value: 'conflict' },
  { label: '发现', value: 'discovery' },
  { label: '文化', value: 'culture' },
];

const filteredEvents = computed(() => {
  if (activeType.value === '全部') return events;
  return events.filter((e) => e.type === activeType.value);
});

const groupedEvents = computed(() => groupChronicleByEra(filteredEvents.value));

function typeVariant(type: ChronicleEvent['type']) {
  const map: Record<ChronicleEvent['type'], 'primary' | 'error' | 'success' | 'info'> = {
    milestone: 'primary',
    conflict: 'error',
    discovery: 'success',
    culture: 'info',
  };
  return map[type];
}

function openDetail(event: ChronicleEvent) {
  selected.value = event;
  detailOpen.value = true;
}
</script>

<style scoped>
.chronicle-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chronicle-panel__intro h2 {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
}

.chronicle-panel__intro p {
  margin: 0;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
}

.chronicle-panel__filters {
  padding-block: var(--space-1);
}

.chronicle-panel__era-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.chronicle-panel__era-head h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.chronicle-panel__item {
  cursor: pointer;
}

.chronicle-panel__item:hover :deep(.timeline-item-title) {
  color: hsl(var(--primary));
}

.chronicle-panel__detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin-bottom: 0.875rem;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
}

.chronicle-panel__detail-body {
  margin: 0 0 1rem;
  line-height: 1.6;
  font-size: 0.875rem;
  color: hsl(var(--foreground));
}
</style>
