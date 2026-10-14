<template>
  <nav :class="paginationClass" role="navigation" aria-label="pagination navigation">
    <ul class="pagination-list">
      <li class="pagination-item">
        <button
          class="pagination-btn pagination-prev"
          :disabled="isPrevDisabled"
          @click="handlePrev"
          @keydown="handlePrevKeydown"
          :tabindex="isPrevDisabled ? -1 : 0"
          :aria-label="t('pagination.prev')"
          :aria-disabled="isPrevDisabled"
        >
          <svg viewBox="0 0 12 12" fill="currentColor">
            <path d="M7.5 2L3 6L7.5 10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </li>
      <li
        v-for="pageItem in pages"
        :key="pageItem.key"
        class="pagination-item"
      >
        <button
          v-if="pageItem.type === 'page'"
          class="pagination-btn"
          :class="{ 'pagination-active': pageItem.value === currentPage, 'pagination-loading': loading && pageItem.value === currentPage }"
          @click="handlePageChange(pageItem.value)"
          @keydown="handlePageKeydown(pageItem.value, $event)"
          :tabindex="0"
          :aria-label="t('pagination.page', { page: pageItem.value })"
          :aria-current="pageItem.value === currentPage ? 'page' : undefined"
        >
          <span v-if="loading && pageItem.value === currentPage" class="pagination-spinner" />
          <span v-else>{{ pageItem.value }}</span>
        </button>
        <span v-else class="pagination-ellipsis" aria-hidden="true">...</span>
      </li>
      <li class="pagination-item">
        <button
          class="pagination-btn pagination-next"
          :disabled="isNextDisabled"
          @click="handleNext"
          @keydown="handleNextKeydown"
          :tabindex="isNextDisabled ? -1 : 0"
          :aria-label="t('pagination.next')"
          :aria-disabled="isNextDisabled"
        >
          <svg viewBox="0 0 12 12" fill="currentColor">
            <path d="M4.5 2L9 6L4.5 10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </li>
    </ul>
    <div v-if="showTotal" class="pagination-total">
      {{ t('pagination.total', { total }) }}
    </div>
    <div v-if="showSizeChanger && !simple" class="pagination-size-changer">
      <select
        :value="currentPageSize"
        class="pagination-select"
        @change="handleSizeChange"
        @keydown="handleSizeKeydown"
        :tabindex="0"
        :aria-label="t('pagination.pageSize')"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ t('pagination.pageSizeOption', { size }) }}
        </option>
      </select>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

/**
 * 分页组件，支持 URL 同步、加载状态和 i18n
 *
 * @props modelValue - 当前页码
 * @props total - 总条数
 * @props pageSize - 每页条数，默认为 10
 * @props pageSizes - 每页条数选项，默认为 [10, 20, 50, 100]
 * @props siblingCount - 显示的 sibling 页码数量，默认为 1
 * @props showTotal - 是否显示总条数，默认为 false
 * @props showSizeChanger - 是否显示每页条数选择器，默认为 false
 * @props syncRoute - 是否同步到 URL query，默认为 false
 * @props loading - 是否显示加载状态，默认为 false
 * @props disabled - 是否整体禁用，默认为 false
 * @props simple - 简洁模式（隐藏页码，仅显示上一页/下一页）
 * @props size - 分页尺寸，可选 'sm' | 'md' | 'lg'，默认为 'md'
 * @props customClass - 自定义类名
 *
 * @emits update:modelValue - 页码变化时触发
 * @emits change - 页码变化时触发（完整语义：{ page, pageSize, total }）
 * @emits pageSizeChange - 每页条数变化时触发
 * @emits pageChange - 完整分页信息变化时触发（{ page, pageSize, total }）
 *
 * @usage
 * <Pagination
 *   v-model="currentPage"
 *   :total="total"
 *   :pageSize="pageSize"
 *   :syncRoute="true"
 *   :pageSizes="[10, 20, 50]"
 *   @pageSizeChange="handlePageSizeChange"
 *   @pageChange="handlePageChange"
 * />
 */

interface Props {
  modelValue: number;
  total: number;
  pageSize?: number;
  siblingCount?: number;
  showTotal?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  syncRoute?: boolean;
  loading?: boolean;
  disabled?: boolean;
  simple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  total: 0,
  pageSize: 10,
  siblingCount: 1,
  showTotal: false,
  showSizeChanger: false,
  pageSizeOptions: () => [10, 20, 50, 100],
  syncRoute: false,
  loading: false,
  disabled: false,
  simple: false,
  size: 'md',
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [number];
  'change': [number];
  'pageSizeChange': [number];
  'pageChange': [payload: { page: number; pageSize: number; total: number }];
}>();

const { uiT: t } = useUiT();

// 尝试导入 vue-router（仅在 syncRoute 为 true 时使用）
let route: ReturnType<typeof import('vue-router').useRoute> | null = null;
let router: ReturnType<typeof import('vue-router').useRouter> | null = null;

if (props.syncRoute) {
  try {
    const vueRouter = await import('vue-router');
    route = vueRouter.useRoute();
    router = vueRouter.useRouter();
  } catch {
    // vue-router not available, syncRoute will be disabled
  }
}

// 内部状态
const currentPage = ref(props.modelValue);
const currentPageSize = ref(props.pageSize);

// 从 URL 同步初始值
onMounted(() => {
  if (props.syncRoute && route) {
    const query = route.query;
    const urlPage = query.page ? Number(query.page) : null;
    const urlPageSize = query.pageSize ? Number(query.pageSize) : null;

    if (urlPage && !isNaN(urlPage) && urlPage >= 1) {
      currentPage.value = urlPage;
      emit('update:modelValue', urlPage);
    }
    if (urlPageSize && !isNaN(urlPageSize)) {
      currentPageSize.value = urlPageSize;
    }
  }
});

// 监听外部 modelValue 变化
watch(() => props.modelValue, (val) => {
  if (val !== currentPage.value) {
    currentPage.value = val;
  }
});

watch(() => props.pageSize, (val) => {
  if (val !== currentPageSize.value) {
    currentPageSize.value = val;
  }
});

// 计算总页数
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.total / currentPageSize.value));
});

// 禁用状态计算
const isPrevDisabled = computed(() => {
  return props.disabled || props.loading || currentPage.value <= 1;
});

const isNextDisabled = computed(() => {
  return props.disabled || props.loading || currentPage.value >= totalPages.value;
});

const paginationClass = computed(() => {
  const classes = ['pagination', `pagination-${props.size}`];
  if (props.loading) classes.push('pagination--loading');
  if (props.disabled) classes.push('pagination--disabled');
  if (props.simple) classes.push('pagination--simple');
  if (props.customClass) classes.push(props.customClass);
  return classes.join(' ');
});

// 更新 URL
const updateUrl = (page: number, pageSize: number) => {
  if (!props.syncRoute || !router || !route) return;

  const query: Record<string, string> = { ...route.query as Record<string, string> };
  query.page = String(page);
  query.pageSize = String(pageSize);

  router.replace({ query }).catch(() => {
    // ignore navigation error
  });
};

// 触发完整分页信息事件
const emitPageChange = (page: number) => {
  emit('pageChange', {
    page,
    pageSize: currentPageSize.value,
    total: props.total,
  });
};

const handlePrev = () => {
  if (isPrevDisabled.value) return;
  const newPage = currentPage.value - 1;
  currentPage.value = newPage;
  emit('update:modelValue', newPage);
  emit('change', newPage);
  emitPageChange(newPage);
  updateUrl(newPage, currentPageSize.value);
};

const handleNext = () => {
  if (isNextDisabled.value) return;
  const newPage = currentPage.value + 1;
  currentPage.value = newPage;
  emit('update:modelValue', newPage);
  emit('change', newPage);
  emitPageChange(newPage);
  updateUrl(newPage, currentPageSize.value);
};

const handlePageChange = (page: number | undefined) => {
  if (page === undefined || page === currentPage.value || props.disabled || props.loading) return;
  if (page < 1 || page > totalPages.value) return;

  currentPage.value = page;
  emit('update:modelValue', page);
  emit('change', page);
  emitPageChange(page);
  updateUrl(page, currentPageSize.value);
};

const handleSizeChange = (event: Event) => {
  const size = Number((event.target as HTMLSelectElement).value);
  if (isNaN(size)) return;

  currentPageSize.value = size;
  currentPage.value = 1; // 重置到第一页
  emit('update:modelValue', 1);
  emit('pageSizeChange', size);
  emitPageChange(1);
  updateUrl(1, size);
};

const handlePrevKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handlePrev();
  }
};

const handleNextKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleNext();
  }
};

const handlePageKeydown = (page: number | undefined, event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handlePageChange(page);
  }
};

const handleSizeKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    (event.target as HTMLSelectElement).focus();
  }
};

// 页码列表计算（简洁模式不显示页码）
const pages = computed(() => {
  if (props.simple) return [];

  const result: Array<
    | { key: string; type: 'page'; value: number }
    | { key: string; type: 'ellipsis' }
  > = [];
  const current = Math.max(1, Math.min(currentPage.value, totalPages.value));
  const total = totalPages.value;
  const sibling = props.siblingCount;

  if (total <= 1) {
    return result;
  }

  const leftSiblingIndex = Math.max(current - sibling, 1);
  const rightSiblingIndex = Math.min(current + sibling, total);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < total - 1;

  if (showLeftEllipsis && showRightEllipsis) {
    result.push({ key: '1', type: 'page', value: 1 });
    result.push({ key: 'left-ellipsis', type: 'ellipsis' });
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      result.push({ key: String(i), type: 'page', value: i });
    }
    result.push({ key: 'right-ellipsis', type: 'ellipsis' });
    result.push({ key: String(total), type: 'page', value: total });
  } else if (showLeftEllipsis) {
    result.push({ key: '1', type: 'page', value: 1 });
    result.push({ key: 'left-ellipsis', type: 'ellipsis' });
    for (let i = Math.max(1, total - 2 * sibling); i <= total; i++) {
      result.push({ key: String(i), type: 'page', value: i });
    }
  } else if (showRightEllipsis) {
    for (let i = 1; i <= Math.min(2 * sibling + 1, total); i++) {
      result.push({ key: String(i), type: 'page', value: i });
    }
    result.push({ key: 'right-ellipsis', type: 'ellipsis' });
    result.push({ key: String(total), type: 'page', value: total });
  } else {
    for (let i = 1; i <= total; i++) {
      result.push({ key: String(i), type: 'page', value: i });
    }
  }

  return result;
});
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.pagination-list {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pagination-item {
  display: flex;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  position: relative;
  overflow: hidden;
}

.pagination-btn:hover:not(:disabled) {
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-active {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--surface));
  box-shadow: var(--shadow-sm);
}

.pagination-loading {
  pointer-events: none;
}

.pagination-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: pagination-spin 0.8s linear infinite;
}

@keyframes pagination-spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination-prev,
.pagination-next {
  position: relative;
}

.pagination-prev svg,
.pagination-next svg {
  width: 12px;
  height: 12px;
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  color: hsl(var(--text-muted));
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.pagination-total {
  font-size: 14px;
  color: hsl(var(--text-secondary));
  animation: slideIn 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.pagination-select {
  padding: 6px 12px;
  font-size: 14px;
  color: hsl(var(--text));
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.pagination-select:hover {
  border-color: hsl(var(--primary));
}

.pagination-select:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
}

.pagination--disabled {
  pointer-events: none;
  opacity: 0.6;
}

.pagination--loading .pagination-btn:not(.pagination-active) {
  opacity: 0.7;
}

.pagination-sm .pagination-btn {
  min-width: 28px;
  height: 28px;
  font-size: 13px;
}

.pagination-lg .pagination-btn {
  min-width: 40px;
  height: 40px;
  font-size: 16px;
}

/* 简洁模式 */
.pagination--simple .pagination-list {
  gap: 8px;
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .pagination {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .pagination-list {
    gap: 6px;
  }

  .pagination-btn {
    min-width: 44px;
    height: 44px;
    font-size: var(--font-size-sm);
    padding: 0 10px;
    border-radius: 10px;
  }

  .pagination-ellipsis {
    min-width: 44px;
    height: 44px;
  }

  .pagination-prev svg,
  .pagination-next svg {
    width: 14px;
    height: 14px;
  }

  .pagination-total {
    font-size: var(--font-size-sm);
  }

  .pagination-select {
    width: 100%;
    padding: 10px 14px;
    min-height: 44px;
    font-size: var(--font-size-sm);
    border-radius: 10px;
  }

  .pagination-btn:hover:not(:disabled) {
    border-color: hsl(var(--primary));
    color: hsl(var(--primary));
  }

  .pagination-active:hover {
    background: hsl(var(--primary) / 0.9);
  }

  .pagination-sm .pagination-btn {
    min-width: 40px;
    height: 40px;
  }

  .pagination-sm .pagination-ellipsis {
    min-width: 40px;
    height: 40px;
  }

  .pagination-lg .pagination-btn {
    min-width: 48px;
    height: 48px;
  }

  .pagination-lg .pagination-ellipsis {
    min-width: 48px;
    height: 48px;
  }
}
</style>
