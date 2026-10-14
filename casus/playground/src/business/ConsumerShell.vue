<template>
  <div
    class="consumer-shell"
    :class="{ 'consumer-shell--mobile': isMobile }"
    data-ui-dispatch-role="content-host"
  >
    <header v-if="isMobile" class="consumer-shell__mobile-bar">
      <span class="consumer-shell__logo">OCP UI</span>
      <Chip size="sm">{{ breakpointLabel }}</Chip>
    </header>

    <header v-if="!isMobile" class="consumer-shell__header">
      <div class="consumer-shell__brand">
        <span class="consumer-shell__logo">OCP UI</span>
        <Tag size="sm" variant="primary">C 端</Tag>
      </div>
      <nav class="consumer-shell__top-nav" role="tablist">
        <button
          v-for="item in navItems"
          :key="String(item.key)"
          type="button"
          role="tab"
          class="consumer-shell__top-tab"
          :class="{ 'consumer-shell__top-tab--active': modelValue === item.key }"
          :aria-selected="modelValue === item.key"
          @click="selectTab(item.key)"
        >
          <Icon v-if="item.icon" :name="item.icon" size="sm" />
          {{ item.label }}
          <span v-if="item.badge" class="consumer-shell__badge">{{ item.badge }}</span>
        </button>
      </nav>
      <div class="consumer-shell__header-meta">
        <Chip>{{ breakpointLabel }}</Chip>
      </div>
    </header>

    <main class="consumer-shell__main">
      <slot />
    </main>

    <BottomNav
      v-if="isMobile"
      :model-value="modelValue"
      :items="navItems"
      @update:model-value="selectTab"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  BottomNav,
  Chip,
  Icon,
  Tag,
  useBreakpoint,
  type BottomNavItem,
} from '@ocpui/vue';

const props = defineProps<{
  modelValue: string;
  navItems: BottomNavItem[];
}>();

const emit = defineEmits<{
  'update:modelValue': [key: string];
}>();

const { isMobile, currentBreakpoint } = useBreakpoint();

const breakpointLabel = computed(() => {
  const bp = currentBreakpoint.value;
  const labels: Record<string, string> = {
    xs: '手机',
    sm: '大屏手机',
    md: '平板',
    lg: '桌面',
    xl: '宽屏',
    xxl: '超宽',
  };
  return labels[bp] ?? bp;
});

function selectTab(key: string | number) {
  emit('update:modelValue', String(key));
}
</script>

<style scoped>
.consumer-shell {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.consumer-shell--mobile .consumer-shell__main {
  padding-bottom: calc(var(--bottom-nav-h) + var(--safe-area-bottom) + 0.75rem);
}

.consumer-shell__mobile-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem var(--page-inline-xs);
  padding-top: calc(0.5rem + var(--safe-area-top));
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--surface-container-low));
}

.consumer-shell__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--surface-container-low));
  flex-wrap: wrap;
}

.consumer-shell__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.consumer-shell__logo {
  font-weight: 700;
  letter-spacing: 0.04em;
}

.consumer-shell__top-nav {
  display: flex;
  gap: 0.25rem;
  flex: 1;
  flex-wrap: wrap;
}

.consumer-shell__top-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  cursor: pointer;
  min-height: var(--touch-min-size);
}

.consumer-shell__top-tab--active {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  font-weight: 600;
}

.consumer-shell__badge {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
  background: hsl(var(--error));
  color: hsl(var(--primary-foreground));
}

.consumer-shell__header-meta {
  margin-left: auto;
}

.consumer-shell__main {
  flex: 1;
  min-width: 0;
}
</style>
