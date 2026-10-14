<template>
  <!--
    @deprecated 列表页请优先使用 DataTable。
    Table 保留为兼容层；尺寸已统一为 sm|md|lg。
  -->
  <div :class="tableClass" :aria-busy="loading ? 'true' : undefined">
    <!-- Loading State -->
    <div v-if="loading" class="table-loading" role="status" aria-live="polite">
      <span class="table-loading-spinner" aria-hidden="true" />
      <span class="table-loading-text">{{ loadingText }}</span>
    </div>

    <!-- Batch Action Bar -->
    <div v-if="hasRowSelection && selectedKeys.length > 0" class="table-batch-bar">
      <span class="table-batch-bar-info">已选择 {{ selectedKeys.length }} 项</span>
      <div class="table-batch-bar-actions">
        <slot name="batchActions" :selectedKeys="selectedKeys" :selectedRows="selectedRows" :clearSelection="clearSelection" />
        <button type="button" class="table-batch-bar-clear" @click="clearSelection">取消选择</button>
      </div>
    </div>

    <!-- Table Wrapper -->
    <div class="table-wrapper" :style="wrapperStyle">
      <table class="table-inner" :class="{ 'table-inner--bordered': bordered }">
        <!-- Header -->
        <thead v-if="showHeader" class="table-head">
          <tr>
            <th v-if="hasRowSelection" class="table-header table-header--checkbox" style="width: 40px">
              <input
                type="checkbox"
                class="table-checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="handleSelectAll"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="getHeaderClass(column)"
              :style="getHeaderStyle(column)"
              @click="handleHeaderClick(column)"
            >
              <div class="table-header-cell">
                <span class="table-header-title">
                  <slot v-if="$slots[`header-${column.key}`]" :name="`header-${column.key}`" :column="column" />
                  <template v-else>{{ column.title }}</template>
                </span>
                <span v-if="column.sorter" class="table-sorter" :class="getSorterClass(column)">
                  <svg viewBox="0 0 12 12" fill="currentColor" class="table-sorter-icon table-sorter-icon--up">
                    <path d="M6 2L2 6H10L6 2Z"/>
                  </svg>
                  <svg viewBox="0 0 12 12" fill="currentColor" class="table-sorter-icon table-sorter-icon--down">
                    <path d="M6 10L2 6H10L6 10Z"/>
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="table-body">
          <template v-if="processedData.length > 0">
            <tr
              v-for="(row, rowIndex) in processedData"
              :key="getRowKey(row, rowIndex)"
              :class="getRowClass(row, rowIndex)"
              @click="handleRowClick(row, rowIndex)"
              @dblclick="handleRowDblClick(row, rowIndex)"
              @mouseenter="handleRowMouseEnter(row, rowIndex)"
              @mouseleave="handleRowMouseLeave(row, rowIndex)"
              @contextmenu.prevent="hasContextMenu && handleContextMenu($event, row, rowIndex)"
            >
              <td v-if="hasRowSelection" class="table-cell table-cell--checkbox">
                <input
                  type="checkbox"
                  class="table-checkbox"
                  :checked="isRowSelected(row, rowIndex)"
                  @click.stop
                  @change="handleSelectRow(row, rowIndex)"
                />
              </td>
              <td
                v-for="column in columns"
                :key="column.key"
                :class="getCellClass(column, row, rowIndex)"
                :style="getCellStyle(column)"
              >
                <Tooltip
                  v-if="column.tooltip && !($slots[`cell-${column.key}`] || column.render)"
                  :content="getTooltipContent(column, row)"
                  placement="top"
                  :delay="300"
                >
                  <slot
                    v-if="$slots[`cell-${column.key}`]"
                    :name="`cell-${column.key}`"
                    :row="row"
                    :column="column"
                    :rowIndex="rowIndex"
                    :value="row[column.key]"
                  />
                  <template v-else-if="column.render && typeof column.render === 'function'">
                    <TableRenderCell :render="column.render" :row="row" :column="column" :row-index="rowIndex" />
                  </template>
                  <template v-else-if="column.formatter && typeof column.formatter === 'function'">
                    {{ column.formatter(row[column.key], row, rowIndex) }}
                  </template>
                  <template v-else>{{ row[column.key] }}</template>
                </Tooltip>
                <template v-else>
                  <slot
                    v-if="$slots[`cell-${column.key}`]"
                    :name="`cell-${column.key}`"
                    :row="row"
                    :column="column"
                    :rowIndex="rowIndex"
                    :value="row[column.key]"
                  />
                  <template v-else-if="column.render && typeof column.render === 'function'">
                    <TableRenderCell :render="column.render" :row="row" :column="column" :row-index="rowIndex" />
                  </template>
                  <template v-else-if="column.formatter && typeof column.formatter === 'function'">
                    {{ column.formatter(row[column.key], row, rowIndex) }}
                  </template>
                  <template v-else>{{ row[column.key] }}</template>
                </template>
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <tr v-else class="table-empty-row">
            <td :colspan="emptyColspan" class="table-empty-cell">
              <slot name="empty">
                <div class="table-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="table-empty-icon">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18"/>
                    <path d="M9 21V9"/>
                  </svg>
                  <span class="table-empty-text">{{ emptyText }}</span>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>

        <!-- Footer -->
        <tfoot v-if="$slots.footer" class="table-foot">
          <tr>
            <td :colspan="emptyColspan" class="table-foot-cell">
              <slot name="footer" />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && total > 0" class="table-pagination">
      <div class="table-pagination-info">
        共 {{ total }} 条记录
      </div>
      <div class="table-pagination-controls">
        <button
          type="button"
          class="table-pagination-btn"
          :disabled="currentPage === 1"
          @click="handlePageChange(1)"
          aria-label="首页"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M9 1.5L4 6L9 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 1.5L1 6L6 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          class="table-pagination-btn"
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
          aria-label="上一页"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="table-pagination-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            class="table-pagination-page"
            :class="{ 'table-pagination-page--active': page === currentPage }"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
        </div>
        <button
          type="button"
          class="table-pagination-btn"
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
          aria-label="下一页"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          class="table-pagination-btn"
          :disabled="currentPage === totalPages"
          @click="handlePageChange(totalPages)"
          aria-label="末页"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M3 1.5L8 6L3 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 1.5L11 6L6 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Context Menu -->
    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @close="contextMenuVisible = false"
      @select="handleContextMenuAction"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, ref, VNode, type PropType } from 'vue';
import Tooltip from '../feedback/Tooltip.vue';
import ContextMenu, { type ContextMenuItem } from '../feedback/ContextMenu.vue';

type TableColumnAlign = 'left' | 'center' | 'right';
type TableSortOrder = 'ascend' | 'descend' | false;
/** 标准尺寸；兼容旧 small/medium/large */
type TableSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';

function normalizeTableSize(size: TableSize | undefined): 'sm' | 'md' | 'lg' {
  if (size === 'sm' || size === 'small') return 'sm';
  if (size === 'lg' || size === 'large') return 'lg';
  return 'md';
}

interface TableColumn {
  key: string;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: TableColumnAlign;
  fixed?: 'left' | 'right';
  sorter?: boolean | ((a: Record<string, unknown>, b: Record<string, unknown>) => number);
  render?: (row: Record<string, unknown>, column: TableColumn, rowIndex: number) => VNode;
  formatter?: (value: unknown, row: Record<string, unknown>, rowIndex: number) => string;
  ellipsis?: boolean;
  tooltip?: boolean | ((value: unknown, row: Record<string, unknown>) => string);
}

interface TableRowSelection {
  selectedRowKeys?: string[];
  onChange?: (selectedRowKeys: string[]) => void;
}

const TableRenderCell = defineComponent({
  name: 'TableRenderCell',
  props: {
    render: {
      type: Function as PropType<(row: Record<string, unknown>, column: TableColumn, rowIndex: number) => unknown>,
      required: true,
    },
    row: { type: Object as PropType<Record<string, unknown>>, required: true },
    column: { type: Object as PropType<TableColumn>, required: true },
    rowIndex: { type: Number, required: true },
  },
  setup(props) {
    return () => {
      const out = props.render(props.row, props.column, props.rowIndex);
      if (typeof out === 'string' || typeof out === 'number') return String(out);
      return out as VNode;
    };
  },
});

/** surface：列表唯一内容面（默认）；plain：无外框，仅用于已在合法父表面内嵌 */
type TableVariant = 'surface' | 'plain';

interface Props {
  columns: TableColumn[];
  /** 行数据可为任意具名接口；组件按 columns 字段配置读取，内部统一收窄为记录视图 */
  data: object[];
  rowKey?: string | ((row: object) => string);
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  showHeader?: boolean;
  size?: TableSize;
  maxHeight?: number | string;
  pagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  total?: number;
  customClass?: string;
  rowSelection?: boolean | TableRowSelection;
  contextMenu?: ContextMenuItem[];
  /**
   * 列表页默认 surface，外层不得再包 Card。
   * plain 仅用于已在合法父表面内嵌的场景。
   */
  variant?: TableVariant;
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: undefined,
  bordered: false,
  striped: false,
  hoverable: true,
  loading: false,
  loadingText: '加载中...',
  emptyText: '暂无数据',
  showHeader: true,
  size: 'md',
  maxHeight: undefined,
  pagination: false,
  pageSize: 10,
  currentPage: 1,
  total: 0,
  customClass: '',
  variant: 'surface',
});

const emit = defineEmits<{
  'row-click': [row: Record<string, unknown>, rowIndex: number];
  'row-dblclick': [row: Record<string, unknown>, rowIndex: number];
  'row-enter': [row: Record<string, unknown>, rowIndex: number];
  'row-leave': [row: Record<string, unknown>, rowIndex: number];
  'sort-change': [sortInfo: { column: TableColumn; order: TableSortOrder }];
  'page-change': [page: number];
  'update:currentPage': [page: number];
  'selection-change': [selectedKeys: string[], selectedRows: Record<string, unknown>[]];
  'context-menu-action': [payload: { action: string; row: Record<string, unknown>; rowIndex: number }];
}>();

const sortColumn = ref<string>('');
const sortOrder = ref<TableSortOrder>(false);
const internalCurrentPage = ref(props.currentPage);

// Row Selection
const internalSelectedKeys = ref<string[]>([]);

// 具名接口行在边界一次性收窄为字段驱动的记录视图，内部逻辑统一使用
const rows = computed<Record<string, unknown>[]>(() =>
  props.data as Record<string, unknown>[],
);

const rowSelectionConfig = computed<TableRowSelection | null>(() => {
  if (!props.rowSelection) return null;
  if (typeof props.rowSelection === 'boolean') return {};
  return props.rowSelection;
});

const hasRowSelection = computed(() => rowSelectionConfig.value !== null);

const selectedKeys = computed({
  get: () => rowSelectionConfig.value?.selectedRowKeys ?? internalSelectedKeys.value,
  set: (val) => {
    internalSelectedKeys.value = val;
    rowSelectionConfig.value?.onChange?.(val);
    emit('selection-change', val, selectedRows.value);
  },
});

const selectedRows = computed(() => {
  const keys = selectedKeys.value;
  return rows.value.filter((row, index) => keys.includes(getRowKey(row, index)));
});

const isAllSelected = computed(() => {
  if (rows.value.length === 0) return false;
  const keys = selectedKeys.value;
  return rows.value.every((row, index) => keys.includes(getRowKey(row, index)));
});

const isIndeterminate = computed(() => {
  if (rows.value.length === 0) return false;
  const keys = selectedKeys.value;
  const selectedCount = rows.value.filter((row, index) => keys.includes(getRowKey(row, index))).length;
  return selectedCount > 0 && selectedCount < rows.value.length;
});

const emptyColspan = computed(() => {
  let count = props.columns.length;
  if (hasRowSelection.value) count++;
  return count;
});

function isRowSelected(row: Record<string, unknown>, rowIndex: number): boolean {
  return selectedKeys.value.includes(getRowKey(row, rowIndex));
}

function handleSelectAll() {
  if (isAllSelected.value) {
    selectedKeys.value = [];
  } else {
    selectedKeys.value = rows.value.map((row, index) => getRowKey(row, index));
  }
}

function handleSelectRow(row: Record<string, unknown>, rowIndex: number) {
  const key = getRowKey(row, rowIndex);
  const keys = [...selectedKeys.value];
  const idx = keys.indexOf(key);
  if (idx >= 0) {
    keys.splice(idx, 1);
  } else {
    keys.push(key);
  }
  selectedKeys.value = keys;
}

function clearSelection() {
  selectedKeys.value = [];
}

// Context Menu
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const contextMenuRow = ref<Record<string, unknown> | null>(null);
const contextMenuRowIndex = ref(-1);

const hasContextMenu = computed(() => {
  return Array.isArray(props.contextMenu) && props.contextMenu.length > 0;
});

const contextMenuItems = computed(() => {
  return props.contextMenu ?? [];
});

function handleContextMenu(event: MouseEvent, row: Record<string, unknown>, rowIndex: number) {
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  contextMenuRow.value = row;
  contextMenuRowIndex.value = rowIndex;
  contextMenuVisible.value = true;
}

function handleContextMenuAction(item: ContextMenuItem) {
  if (contextMenuRow.value) {
    emit('context-menu-action', {
      action: item.key,
      row: contextMenuRow.value,
      rowIndex: contextMenuRowIndex.value,
    });
  }
}

const tableClass = computed(() => {
  const size = normalizeTableSize(props.size);
  const classes = ['table', `table--${size}`, `table--${props.variant}`];
  if (props.striped) classes.push('table--striped');
  if (props.hoverable) classes.push('table--hoverable');
  if (props.loading) classes.push('table--loading');
  if (props.bordered) classes.push('table--bordered');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const wrapperStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.maxHeight !== undefined) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight;
    style.overflowY = 'auto';
  }
  return style;
});

const totalPages = computed(() => Math.ceil(props.total / props.pageSize));

const currentPage = computed({
  get: () => props.currentPage || internalCurrentPage.value,
  set: (val) => {
    internalCurrentPage.value = val;
    emit('update:currentPage', val);
  },
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);
  
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(total, start + 4);
    } else {
      start = Math.max(1, end - 4);
    }
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const processedData = computed(() => {
  let result = [...rows.value];
  
  if (sortColumn.value && sortOrder.value) {
    const column = props.columns.find(col => col.key === sortColumn.value);
    if (column?.sorter && typeof column.sorter === 'function') {
      const sorterFn = column.sorter as (a: Record<string, unknown>, b: Record<string, unknown>) => number;
      result.sort((a, b) => {
        const order = sorterFn(a, b);
        return sortOrder.value === 'ascend' ? order : -order;
      });
    } else if (column?.sorter === true) {
      result.sort((a, b) => {
        const aVal = a[sortColumn.value] as number | string;
        const bVal = b[sortColumn.value] as number | string;
        if (aVal === bVal) return 0;
        const compare = aVal > bVal ? 1 : -1;
        return sortOrder.value === 'ascend' ? compare : -compare;
      });
    }
  }
  
  return result;
});

const getRowKey = (row: Record<string, unknown>, index: number): string => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row);
  }
  if (props.rowKey) {
    return String(row[props.rowKey] ?? index);
  }
  return String(index);
};

const getHeaderClass = (column: TableColumn) => {
  const classes: string[] = ['table-header'];
  if (column.align) classes.push(`table-header--${column.align}`);
  if (column.sorter) classes.push('table-header--sortable');
  if (sortColumn.value === column.key && sortOrder.value) {
    classes.push(`table-header--sorted-${sortOrder.value}`);
  }
  if (column.fixed) classes.push(`table-header--fixed-${column.fixed}`);
  return classes;
};

const getHeaderStyle = (column: TableColumn) => {
  const style: Record<string, string> = {};
  if (column.width) {
    style.width = typeof column.width === 'number' ? `${column.width}px` : column.width;
    style.minWidth = style.width;
  }
  if (column.minWidth) {
    style.minWidth = typeof column.minWidth === 'number' ? `${column.minWidth}px` : column.minWidth;
  }
  return style;
};

const getSorterClass = (column: TableColumn) => {
  const classes: string[] = [];
  if (sortColumn.value === column.key) {
    if (sortOrder.value === 'ascend') classes.push('table-sorter--ascend');
    if (sortOrder.value === 'descend') classes.push('table-sorter--descend');
  }
  return classes;
};

const getRowClass = (row: Record<string, unknown>, rowIndex: number) => {
  const classes: (string | Record<string, boolean>)[] = ['table-row'];
  if (props.striped && rowIndex % 2 === 1) classes.push('table-row--striped');
  if (hasRowSelection.value && isRowSelected(row, rowIndex)) classes.push('table-row--selected');
  return classes;
};

const getCellClass = (column: TableColumn, _row: Record<string, unknown>, _rowIndex: number) => {
  const classes: string[] = ['table-cell'];
  if (column.align) classes.push(`table-cell--${column.align}`);
  if (column.ellipsis) classes.push('table-cell--ellipsis');
  if (column.fixed) classes.push(`table-cell--fixed-${column.fixed}`);
  return classes;
};

const getCellStyle = (column: TableColumn) => {
  const style: Record<string, string> = {};
  if (column.width) {
    style.width = typeof column.width === 'number' ? `${column.width}px` : column.width;
    style.minWidth = style.width;
  }
  return style;
};

const handleHeaderClick = (column: TableColumn) => {
  if (!column.sorter) return;
  
  if (sortColumn.value === column.key) {
    if (sortOrder.value === 'ascend') {
      sortOrder.value = 'descend';
    } else if (sortOrder.value === 'descend') {
      sortOrder.value = false;
      sortColumn.value = '';
    }
  } else {
    sortColumn.value = column.key;
    sortOrder.value = 'ascend';
  }
  
  emit('sort-change', { column, order: sortOrder.value });
};

const handleRowClick = (row: Record<string, unknown>, rowIndex: number) => {
  emit('row-click', row, rowIndex);
};

const handleRowDblClick = (row: Record<string, unknown>, rowIndex: number) => {
  emit('row-dblclick', row, rowIndex);
};

const handleRowMouseEnter = (row: Record<string, unknown>, rowIndex: number) => {
  emit('row-enter', row, rowIndex);
};

const handleRowMouseLeave = (row: Record<string, unknown>, rowIndex: number) => {
  emit('row-leave', row, rowIndex);
};

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  emit('page-change', page);
};

const getTooltipContent = (column: TableColumn, row: Record<string, unknown>): string => {
  if (typeof column.tooltip === 'function') {
    return column.tooltip(row[column.key], row);
  }
  return String(row[column.key] ?? '');
};

defineExpose({
  sortColumn,
  sortOrder,
  currentPage,
  clearSelection,
  selectedKeys,
});
</script>

<style scoped>
.table {
  position: relative;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
}

/* 列表唯一内容面；外层禁止再包 Card */
.table--surface {
  background: hsl(var(--surface));
  border-radius: 16px;
  border: 1px solid hsl(var(--border));
}

.table--plain {
  background: transparent;
  border-radius: 0;
  border: none;
}

/* Batch Action Bar */
.table-batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: hsl(var(--primary) / 0.06);
  border-bottom: 1px solid hsl(var(--primary) / 0.15);
}

.table-batch-bar-info {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--primary));
}

.table-batch-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-batch-bar-clear {
  padding: 4px 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--surface));
  font-size: 12px;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.table-batch-bar-clear:hover {
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

/* Checkbox */
.table-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: hsl(var(--primary));
}

.table-header--checkbox {
  padding: 14px 12px;
  text-align: center;
}

.table-cell--checkbox {
  padding: 14px 12px;
  text-align: center;
}

.table-row--selected {
  background: hsl(var(--primary) / 0.04);
}

.table--hoverable .table-row--selected:hover {
  background: hsl(var(--primary) / 0.07);
}

.table-wrapper {
  overflow-x: auto;
}

.table-inner {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.table-inner--bordered {
  border: 1px solid hsl(var(--border));
}

.table-head {
  background: hsl(var(--surface-container-high));
}

.table-header {
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--text-secondary));
  text-align: left;
  border-bottom: 1px solid hsl(var(--border));
  white-space: nowrap;
  transition: background 0.2s;
}

.table-header--center {
  text-align: center;
}

.table-header--right {
  text-align: right;
}

.table-header--sortable {
  cursor: pointer;
  user-select: none;
}

.table-header--sortable:hover {
  background: hsl(var(--surface-hover));
}

.table-header-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.table-header-title {
  display: inline-flex;
  align-items: center;
}

.table-sorter {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.table-header--sortable:hover .table-sorter {
  opacity: 0.6;
}

.table-sorter--ascend,
.table-sorter--descend {
  opacity: 1;
}

.table-sorter-icon {
  width: 10px;
  height: 6px;
  color: hsl(var(--text-muted));
}

.table-sorter--ascend .table-sorter-icon--up,
.table-sorter--descend .table-sorter-icon--down {
  color: hsl(var(--primary));
}

.table-body {
  background: hsl(var(--surface));
}

.table-row {
  transition: background 0.2s;
}

.table--hoverable .table-row:hover {
  background: hsl(var(--surface-hover));
}

.table--striped .table-row--striped {
  background: hsl(var(--surface-container-high) / 0.5);
}

.table-cell {
  padding: 14px 16px;
  font-size: 14px;
  color: hsl(var(--text));
  border-bottom: 1px solid hsl(var(--border));
  transition: background 0.2s;
}

.table-cell--center {
  text-align: center;
}

.table-cell--right {
  text-align: right;
}

.table-cell--ellipsis {
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-empty-row {
  height: 200px;
}

.table-empty-cell {
  padding: 40px 16px;
  text-align: center;
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.table-empty-icon {
  width: 48px;
  height: 48px;
  color: hsl(var(--text-muted));
}

.table-empty-text {
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.table-foot {
  background: hsl(var(--surface-container-high));
}

.table-foot-cell {
  padding: 12px 16px;
  border-top: 1px solid hsl(var(--border));
}

.table-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: hsl(var(--background) / 0.8);
  /* 数据态占位：不 blur、不吞指针，下层内容仍可滚动查看（state-system §3） */
  pointer-events: none;
  z-index: 10;
}

.table-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: table-spin 0.8s linear infinite;
}

@keyframes table-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .table-loading-spinner {
    animation: none;
    border-top-color: hsl(var(--primary));
  }
}

.table-loading-text {
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid hsl(var(--border));
}

.table-pagination-info {
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.table-pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.table-pagination-btn:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.table-pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-pagination-btn svg {
  width: 12px;
  height: 12px;
}

.table-pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.table-pagination-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  color: hsl(var(--text));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.table-pagination-page:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.table-pagination-page--active {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.table-pagination-page--active:hover {
  background: hsl(var(--primary) / 0.9);
  border-color: hsl(var(--primary) / 0.9);
}

/* Size variants（sm|md|lg；兼容旧 small/large 类名不再使用） */
.table--sm .table-header {
  padding: 10px 12px;
  font-size: 12px;
}

.table--sm .table-cell {
  padding: 10px 12px;
  font-size: 13px;
}

.table--lg .table-header {
  padding: 18px 20px;
  font-size: 14px;
}

.table--lg .table-cell {
  padding: 18px 20px;
  font-size: 15px;
}

/* Responsive styles */
@media (max-width: 575.98px) {
  .table {
    border-radius: 12px;
  }
  
  .table-header {
    padding: 12px 14px;
    font-size: var(--font-size-sm);
  }
  
  .table-cell {
    padding: 12px 14px;
    font-size: var(--font-size-sm);
  }
  
  .table-empty-row {
    height: 150px;
  }
  
  .table-empty-cell {
    padding: 30px 14px;
  }
  
  .table-empty-icon {
    width: 36px;
    height: 36px;
  }
  
  .table-empty-text {
    font-size: var(--font-size-sm);
  }
  
  .table-pagination {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }
  
  .table-pagination-controls {
    width: 100%;
    justify-content: center;
  }
  
  .table-pagination-btn {
    width: 36px;
    height: 36px;
  }
  
  .table-pagination-page {
    min-width: 36px;
    height: 36px;
  }
  
  .table-pagination-info {
    font-size: var(--font-size-sm);
  }
}
</style>
