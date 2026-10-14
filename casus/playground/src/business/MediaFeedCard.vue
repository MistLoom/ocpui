<template>
  <Card
    hoverable
    :size="isMobile ? 'sm' : 'md'"
    :shadow="isMobile ? 'never' : 'hover'"
    custom-class="media-feed-card"
    @click="emit('select', item)"
  >
    <template #cover>
      <div class="media-feed-card__cover" :style="{ background: item.cover }">
        <Tag size="sm" variant="info" custom-class="media-feed-card__tag">{{ item.category }}</Tag>
      </div>
    </template>
    <div class="media-feed-card__body">
      <h3 class="media-feed-card__title">{{ item.title }}</h3>
      <p class="media-feed-card__summary">{{ item.summary }}</p>
      <div class="media-feed-card__meta">
        <span>{{ item.author }}</span>
        <span>{{ item.readMin }} 分钟</span>
        <span>{{ item.likes }} 赞</span>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card, Tag, useBreakpoint } from '@ocpui/vue';
import type { FeedItem } from '@/mock/consumer';

defineProps<{
  item: FeedItem;
}>();

const emit = defineEmits<{
  select: [item: FeedItem];
}>();

const { isMobile } = useBreakpoint();
</script>

<style scoped>
.media-feed-card {
  cursor: pointer;
  height: 100%;
}

.media-feed-card__cover {
  position: relative;
  aspect-ratio: 16 / 9;
}

.media-feed-card__tag {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
}

.media-feed-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.media-feed-card__title {
  margin: 0;
  font-weight: 600;
  font-size: 0.9375rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.media-feed-card__summary {
  margin: 0;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.media-feed-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 0.625rem;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.125rem;
}
</style>
