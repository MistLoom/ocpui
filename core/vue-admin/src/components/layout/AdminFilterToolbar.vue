<template>
  <div class="admin-filter-toolbar" :class="{ 'admin-filter-toolbar--stacked': isStacked }">
    <div class="admin-filter-toolbar__row">
      <div class="admin-filter-toolbar__filters">
        <slot name="filters" />
        <slot />
      </div>
      <div v-if="$slots.actions" class="admin-filter-toolbar__actions">
        <slot name="actions" />
      </div>
    </div>
    <ActiveFilterTags
      v-if="activeFilters.length > 0"
      :filters="activeFilters"
      @remove="(filter) => emit('remove-filter', filter)"
      @clear-all="emit('clear-filters')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ActiveFilterTags, useBreakpoint, type ActiveFilter } from '@ocpui/vue';

/**
 * 列表页筛选工具栏：左侧筛选控件 + 右侧操作区 + 可选已选条件条。
 * 离散筛选用 FilterTagGroup，关键词用 Search，无界选项用 Select（见组件库改造方案 §0.4）。
 */

const props = withDefaults(
  defineProps<{
    activeFilters?: ActiveFilter[];
    /** 窄屏下操作区换行到筛选下方；默认随断点自动 stacked */
    stacked?: boolean | null;
  }>(),
  {
    activeFilters: () => [],
    stacked: null,
  },
);

const { isMobile } = useBreakpoint();

const isStacked = computed(() => {
  if (props.stacked !== null && props.stacked !== undefined) return props.stacked;
  return isMobile.value;
});

const emit = defineEmits<{
  'remove-filter': [filter: ActiveFilter];
  'clear-filters': [];
}>();
</script>

<style scoped>
.admin-filter-toolbar {
  --admin-filter-select-width: 160px;
  --admin-filter-search-min: 160px;
  --admin-filter-search-max: 320px;

  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  flex: 1 1 100%;
  min-width: 0;
}

.admin-filter-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.admin-filter-toolbar__filters {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* Select 默认 width:100%，在 flex 行内会被拉满；工具栏内固定宽度 */
.admin-filter-toolbar__filters :deep(.select) {
  flex: 0 0 var(--admin-filter-select-width);
  width: var(--admin-filter-select-width);
  max-width: var(--admin-filter-select-width);
}

.admin-filter-toolbar__filters :deep(.filter-tag-group) {
  flex: 0 1 auto;
  max-width: 100%;
}

.admin-filter-toolbar__filters :deep(.search-component) {
  flex: 1 1 var(--admin-filter-search-min);
  width: auto;
  min-width: var(--admin-filter-search-min);
  max-width: var(--admin-filter-search-max);
}

.admin-filter-toolbar__filters :deep(button.btn),
.admin-filter-toolbar__actions :deep(button.btn) {
  flex: 0 0 auto;
  width: auto;
  max-width: none;
  align-self: center;
}

.admin-filter-toolbar__actions :deep(.tag) {
  flex: 0 0 auto;
}

.admin-filter-toolbar__actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: max-content;
  max-width: 100%;
  margin-left: auto;
}

.admin-filter-toolbar--stacked .admin-filter-toolbar__actions {
  flex: 1 1 100%;
  width: auto;
  max-width: none;
  margin-left: 0;
  justify-content: flex-start;
}

@media (max-width: 639.98px) {
  .admin-filter-toolbar__filters :deep(.search-component) {
    flex: 1 1 100%;
    max-width: none;
  }

  .admin-filter-toolbar__actions {
    flex: 1 1 100%;
    width: auto;
    max-width: none;
    margin-left: 0;
    justify-content: flex-start;
  }
}
</style>
