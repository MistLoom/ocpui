<template>
  <UiScenarioScope surface="list" presentation-mode="scan">
    <div class="discover-feed">
      <section class="discover-feed__hero">
        <Carousel
          :items="heroSlides"
          aspect-ratio="16/9"
          :show-arrows="!isMobile"
          @change="onHeroChange"
        >
          <template #item="{ item }">
            <div class="discover-feed__slide" :style="slideStyle(item)">
              <div class="discover-feed__slide-text">
                <h2>{{ item.title }}</h2>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </template>
        </Carousel>
      </section>

      <section class="discover-feed__filters">
        <FilterTagGroup
          v-model="activeCategory"
          :options="categoryOptions"
          size="sm"
        />
        <div v-if="activeCategory !== '全部'" class="discover-feed__active">
          <ActiveFilterTags
            size="sm"
            :filters="[{ key: 'cat', label: '分类', value: activeCategory, valueLabel: activeCategory }]"
            @remove="activeCategory = '全部'"
          />
        </div>
      </section>

      <InfiniteScroll
        class="discover-feed__list"
        :native="isMobile"
        :loading="loading"
        :finished="finished"
        :distance="120"
        @load="loadMore"
      >
        <Grid :cols="{ xs: 1, sm: 2, lg: 3, xl: 4 }" gap="md">
          <GridItem v-for="item in visibleItems" :key="item.id">
            <MediaFeedCard :item="item" @select="openDetail" />
          </GridItem>
        </Grid>
      </InfiniteScroll>

      <Drawer
        v-model="detailOpen"
        :title="selected?.title"
        :placement="isMobile ? 'bottom' : 'right'"
        size="md"
        :height="isMobile ? '80%' : 300"
      >
        <template v-if="selected">
          <div class="discover-feed__detail-cover" :style="{ background: selected.cover }" />
          <Descriptions :column="1" size="sm">
            <DescriptionsItem label="分类">{{ selected.category }}</DescriptionsItem>
            <DescriptionsItem label="作者">{{ selected.author }}</DescriptionsItem>
            <DescriptionsItem label="纪元">{{ selected.epoch }}</DescriptionsItem>
            <DescriptionsItem label="阅读">{{ selected.readMin }} 分钟</DescriptionsItem>
          </Descriptions>
          <p class="discover-feed__detail-body">{{ selected.summary }}</p>
          <div class="discover-feed__detail-actions">
            <Button size="sm" variant="primary" @click="onLike">点赞</Button>
            <Button size="sm" variant="secondary" @click="detailOpen = false">关闭</Button>
          </div>
        </template>
      </Drawer>
    </div>
  </UiScenarioScope>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  ActiveFilterTags,
  Button,
  Carousel,
  Descriptions,
  DescriptionsItem,
  Drawer,
  FilterTagGroup,
  Grid,
  GridItem,
  InfiniteScroll,
  UiScenarioScope,
  useBreakpoint,
  useUiActionFeedback,
} from '@ocpui/vue';
import MediaFeedCard from '@/business/MediaFeedCard.vue';
import {
  getCategories,
  getHeroSlides,
  getInitialFeed,
  fetchMoreFeed,
  type FeedItem,
} from '@/mock/consumer';

const { isMobile } = useBreakpoint();
const action = useUiActionFeedback();

const heroSlides = getHeroSlides();
const activeCategory = ref('全部');
const items = ref(getInitialFeed());
const page = ref(1);
const loading = ref(false);
const finished = ref(false);
const detailOpen = ref(false);
const selected = ref<FeedItem | null>(null);

const categoryOptions = computed(() =>
  getCategories().map((c) => ({ label: c, value: c })),
);

const visibleItems = computed(() => {
  if (activeCategory.value === '全部') return items.value;
  return items.value.filter((i) => i.category === activeCategory.value);
});

watch(activeCategory, () => {
  page.value = 1;
  finished.value = false;
});

function slideStyle(item: { title?: string }) {
  const hues = [220, 160, 30, 280];
  const h = hues[(item.title?.length ?? 0) % hues.length];
  return {
    background: `linear-gradient(135deg, hsl(${h} 65% 42%), hsl(${(h + 40) % 360} 55% 52%))`,
  };
}

function onHeroChange(index: number) {
  void index;
}

function openDetail(item: FeedItem) {
  selected.value = item;
  detailOpen.value = true;
}

function onLike() {
  action.message.success('已点赞');
}

async function loadMore() {
  if (loading.value || finished.value) return;
  loading.value = true;
  try {
    const batch = await fetchMoreFeed(page.value, activeCategory.value);
    if (batch.length === 0) {
      finished.value = true;
    } else {
      items.value = [...items.value, ...batch];
      page.value += 1;
      if (page.value >= 4) finished.value = true;
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.discover-feed {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.discover-feed__hero {
  border-radius: 12px;
  overflow: hidden;
  margin-inline: calc(-1 * var(--page-inline-xs, 12px));
}

@media (min-width: 640px) {
  .discover-feed {
    gap: 1rem;
    padding: 0.25rem 0;
  }

  .discover-feed__hero {
    margin-inline: 0;
  }
}

.discover-feed__slide {
  display: flex;
  align-items: flex-end;
  height: 100%;
  padding: var(--page-inline-sm) var(--page-inline-sm) var(--page-inline-xs);
  color: #fff;
}

.discover-feed__slide-text h2 {
  margin: 0 0 0.375rem;
  font-size: clamp(1rem, 4vw, 1.375rem);
  line-height: 1.35;
}

.discover-feed__slide-text p {
  margin: 0;
  font-size: clamp(0.8125rem, 3.2vw, 0.9375rem);
  line-height: 1.45;
  opacity: 0.92;
}

.discover-feed__filters {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.discover-feed__active {
  padding-block: var(--space-1);
}

.discover-feed__list {
  min-width: 0;
}

.discover-feed__detail-cover {
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  margin-bottom: 0.875rem;
}

.discover-feed__detail-body {
  margin: 0.875rem 0;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}

.discover-feed__detail-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-bottom: var(--safe-area-bottom);
}
</style>
