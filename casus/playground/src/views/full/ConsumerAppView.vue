<template>
  <div class="consumer-view">
    <header v-if="!isMobile" class="consumer-view__intro">
      <h1>跨端内容应用</h1>
      <p>
        发现流 · 编年历程 · 全局检索 · 个人中心。桌面端顶栏 Tab，移动端 BottomNav + safe-area。
        缩窄浏览器宽度可观察 Grid 列数、Drawer 方向、Timeline 模式切换。
      </p>
      <Chip size="sm">{{ layoutHint }}</Chip>
    </header>
    <ConsumerAppWorkbench />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Chip, useBreakpoint } from '@ocpui/vue';
import ConsumerAppWorkbench from '@/business/ConsumerAppWorkbench.vue';

const { isMobile, isTablet, currentBreakpoint } = useBreakpoint();

const layoutHint = computed(() => {
  if (isMobile.value) return `移动端 · ${currentBreakpoint.value}`;
  if (isTablet.value) return `平板 · ${currentBreakpoint.value}`;
  return `桌面 · ${currentBreakpoint.value}`;
});
</script>

<style scoped>
.consumer-view__intro {
  margin-bottom: 0.75rem;
  padding: 0 0.25rem;
}

.consumer-view__intro h1 {
  margin: 0 0 0.375rem;
  font-size: 1.25rem;
}

.consumer-view__intro p {
  margin: 0 0 0.75rem;
  max-width: 720px;
  font-size: 0.875rem;
  line-height: 1.55;
  color: hsl(var(--muted-foreground));
}
</style>
