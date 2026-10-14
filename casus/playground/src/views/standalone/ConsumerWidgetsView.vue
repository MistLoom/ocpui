<template>
  <div class="consumer-widgets">
    <section class="playground-card">
      <h2>响应式断点</h2>
      <p class="consumer-widgets__hint">useBreakpoint 与主题 token 对齐，供 Grid / Shell 消费。</p>
      <div class="consumer-widgets__bp-grid">
        <Chip>xs: {{ matches.xs ? '✓' : '—' }}</Chip>
        <Chip>sm: {{ matches.sm ? '✓' : '—' }}</Chip>
        <Chip>md: {{ matches.md ? '✓' : '—' }}</Chip>
        <Chip>lg: {{ matches.lg ? '✓' : '—' }}</Chip>
        <Chip>xl: {{ matches.xl ? '✓' : '—' }}</Chip>
      </div>
      <p>isMobile={{ isMobile }} · current={{ currentBreakpoint }}</p>
    </section>

    <section class="playground-card">
      <h2>BottomNav</h2>
      <div class="consumer-widgets__bottom-demo">
        <BottomNav v-model="navKey" :items="navItems" />
      </div>
    </section>

    <section class="playground-card">
      <h2>Carousel · aspectRatio + 触控</h2>
      <Carousel
        :items="slides"
        aspect-ratio="16/9"
        :height="200"
        :show-arrows="false"
      />
    </section>

    <section class="playground-card">
      <h2>Grid 响应式</h2>
      <Grid :cols="{ xs: 1, sm: 2, md: 3, lg: 4 }" gap="sm">
        <GridItem v-for="n in 8" :key="n">
          <Card :title="`卡片 ${n}`" size="sm">列数随断点变化</Card>
        </GridItem>
      </Grid>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  BottomNav,
  Card,
  Carousel,
  Chip,
  Grid,
  GridItem,
  useBreakpoint,
  type BottomNavItem,
} from '@ocpui/vue';

const { matches, isMobile, currentBreakpoint } = useBreakpoint();

const navKey = ref('home');
const navItems: BottomNavItem[] = [
  { key: 'home', label: '首页', icon: 'home' },
  { key: 'feed', label: '发现', icon: 'compass' },
  { key: 'me', label: '我的', icon: 'user' },
];

const slides = [
  { title: 'Slide A', description: '独立模式无 UiRoot', image: '' },
  { title: 'Slide B', description: '可嵌入文档 / Story', image: '' },
];
</script>

<style scoped>
.consumer-widgets {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.consumer-widgets h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.consumer-widgets__hint {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
}

.consumer-widgets__bp-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.consumer-widgets__bottom-demo {
  position: relative;
  min-height: calc(var(--bottom-nav-h) + 2rem);
  border: 1px dashed hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
}

.consumer-widgets__bottom-demo :deep(.bottom-nav) {
  position: absolute;
}
</style>
