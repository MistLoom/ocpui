<template>
  <div class="admin-work-list-region" data-ui-dispatch-role="content-host">
  <div v-if="resolved.loading" class="admin-work-list__skel">
    <Skeleton v-for="i in skeletonCount" :key="i" height="48px" />
  </div>
  <div v-else-if="resolved.isForbidden" class="admin-work-list__forbidden">
    <span>{{ forbiddenText || errorText }}</span>
    <slot name="forbidden-action" />
  </div>
  <div v-else-if="resolved.isError" class="admin-work-list__error">
    <span>{{ errorText }}</span>
    <slot name="error-action" />
  </div>
  <Empty
    v-else-if="resolved.isEmpty"
    :title="hasFilter ? noResultTitle : emptyTitle"
    :description="hasFilter ? noResultHint : emptyHint"
  >
    <template #footer>
      <slot name="empty-footer" />
    </template>
  </Empty>
  <div v-else class="admin-work-list">
    <slot />
  </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 类型库式列表体：加载骨架 / 失败 / 空与无结�?/ 行列表�?
 * 页头与筛选仍�?AdminPage 负责�?
 * 可�?regionState 统一 10 态语义（@ocpui/docs/spec/foundation/state-system.md）�?
 */
import { computed } from 'vue';
import { Empty, Skeleton } from '@ocpui/vue';
import {
  adminWorkListFlagsFromState,
  type UiDataState,
} from '../../types/ui-data-state';

const props = withDefaults(
  defineProps<{
    /** 统一区域状态；设置后覆�?loading/isError/isEmpty/isForbidden */
    regionState?: UiDataState;
    loading?: boolean;
    isError?: boolean;
    isEmpty?: boolean;
    isForbidden?: boolean;
    hasFilter?: boolean;
    skeletonCount?: number;
    errorText?: string;
    forbiddenText?: string;
    emptyTitle?: string;
    emptyHint?: string;
    noResultTitle?: string;
    noResultHint?: string;
  }>(),
  {
    regionState: undefined,
    loading: false,
    isError: false,
    isEmpty: false,
    isForbidden: false,
    hasFilter: false,
    skeletonCount: 4,
    errorText: '',
    forbiddenText: '',
    emptyTitle: '',
    emptyHint: '',
    noResultTitle: '',
    noResultHint: '',
  },
);

const resolved = computed(() => {
  if (props.regionState) {
    return adminWorkListFlagsFromState(props.regionState);
  }
  return {
    loading: props.loading,
    isError: props.isError,
    isEmpty: props.isEmpty,
    isForbidden: props.isForbidden,
  };
});
</script>

<style scoped>
.admin-work-list,
.admin-work-list__skel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.admin-work-list__error,
.admin-work-list__forbidden {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.admin-work-list :deep(.awl-row) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.admin-work-list :deep(.awl-row--click) {
  cursor: pointer;
}

.admin-work-list :deep(.awl-row--active) {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.08);
}

.admin-work-list :deep(.awl-row__main) {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.admin-work-list :deep(.awl-row__meta) {
  font-size: 0.85rem;
  color: hsl(var(--muted-foreground));
}
</style>
