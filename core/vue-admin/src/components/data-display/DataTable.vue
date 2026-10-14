<!--
DataTable 数据表格组件（列表页公开表面）

列表页优先使用本组件，勿用 Card 再包一层。Table 为兼容层。

## 组件说明
数据表格组件，支持排序、分页、选择、展开等功能

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | TableColumn[] | [] | 表格列配置 |
| data | Record<string, unknown>[] | [] | 表格数据 |
| rowKey | string \| ((row: Record<string, unknown>) => string) | 'id' | 行唯一标识 |
| bordered | boolean | false | 是否显示边框 |
| striped | boolean | false | 是否显示斑马纹 |
| hoverable | boolean | true | 是否支持行悬停 |
| loading | boolean | false | 是否显示加载状态 |
| loadingText | string | '加载中...' | 加载状态文本 |
| emptyText | string | '暂无数据' | 空数据文本 |
| maxHeight | number | 0 | 表格最大高度 |
| pagination | boolean | false | 是否显示分页 |
| pageSize | number | 10 | 每页数据条数 |
| currentPage | number | 1 | 当前页码 |
| total | number | 0 | 总数据条数 |
| showSizeChanger | boolean | false | 是否显示每页条数选择器 |
| pageSizeOptions | number[] | [10, 20, 50, 100] | 每页条数选项 |
| selectable | boolean | false | 是否支持选择 |
| selectedKeys | (string \| number)[] | [] | 选中的行标识 |
| multiple | boolean | true | 是否支持多选 |
| expandable | boolean | false | 是否支持展开 |
| expandedKeys | (string \| number)[] | [] | 展开的行标识 |
| customClass | string | '' | 自定义类名 |
| paginationMode | 'client' \| 'server' | 'server' | client：本地 data 全量时组件内分页切片；server：data 仅为当前页 |
| variant | 'surface' \| 'plain' | 'surface' | 列表表面；plain 仅用于已在合法父表面内嵌 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | 行高密度 |

## 事件
| 事件名 | 参数 | 说明 |
|-------|------|------|
| row-click | row: Record<string, unknown>, rowIndex: number | 行点击事件 |
| row-dblclick | row: Record<string, unknown>, rowIndex: number | 行双击事件 |
| sort-change | sortInfo: { column: TableColumn; order: TableSortOrder } | 排序变化事件 |
| page-change | page: number | 页码变化事件 |
| page-size-change | pageSize: number | 每页条数变化事件 |
| select | selectedKeys: (string \| number)[], selectedRows: Record<string, unknown>[] | 选择事件 |
| select-all | selectedKeys: (string \| number)[], selectedRows: Record<string, unknown>[] | 全选事件 |
| expand | expandedKeys: (string \| number)[], expandedRows: Record<string, unknown>[] | 展开事件 |

## 暴露方法
| 方法名 | 说明 |
|-------|------|
| clearSelection | 清空选择 |
| selectAll | 全选 |

## 使用示例
```vue
<template>
  <DataTable
    :columns="columns"
    :data="data"
    :pagination="true"
    :total="total"
    @page-change="handlePageChange"
    @sort-change="handleSortChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTable from '@ocpui/vue-admin/data-display/DataTable';

const columns = [
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄', sorter: true },
  { key: 'address', title: '地址' }
];

const data = ref([
  { id: 1, name: '张三', age: 20, address: '北京市' },
  { id: 2, name: '李四', age: 25, address: '上海市' },
  { id: 3, name: '王五', age: 30, address: '广州市' }
]);

const total = ref(3);

const handlePageChange = (page: number) => {
};

const handleSortChange = (sortInfo: { column: any; order: any }) => {
};
</script>
```
-->
<template>
  <div :class="dataTableClass">
    <div v-if="loading" class="datatable-loading">
      <span class="datatable-loading-spinner" />
      <span class="datatable-loading-text">{{ loadingText }}</span>
    </div>
    
    <div v-if="$slots.toolbar" class="datatable-toolbar">
      <slot name="toolbar" />
    </div>
    
    <div class="datatable-wrapper" :style="{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }">
      <table class="datatable-inner" :class="{ 'datatable-inner--bordered': bordered }">
        <thead class="datatable-head">
          <tr>
            <th v-if="expandable" class="datatable-header datatable-header--expand" style="width: 48px;">
              <span class="datatable-header-title">{{ t('components.dataDisplay.dataTable.expand') }}</span>
            </th>
            <th v-if="selectable" class="datatable-header datatable-header--select" style="width: 48px;">
              <label class="datatable-checkbox">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isIndeterminate"
                  @change="handleSelectAllWrapped"
                />
                <span class="datatable-checkbox-indicator"></span>
              </label>
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="getHeaderClass(column)"
              :style="getHeaderStyle(column)"
              @click="handleHeaderClick(column)"
            >
              <div class="datatable-header-cell">
                <span class="datatable-header-title">
                  <slot v-if="$slots[`header-${column.key}`]" :name="`header-${column.key}`" :column="column" />
                  <template v-else>{{ column.title }}</template>
                </span>
                <span v-if="column.sorter" class="datatable-sorter" :class="getSorterClass(column)">
                  <svg viewBox="0 0 12 12" fill="currentColor" class="datatable-sorter-icon datatable-sorter-icon--up">
                    <path d="M6 2L2 6H10L6 2Z"/>
                  </svg>
                  <svg viewBox="0 0 12 12" fill="currentColor" class="datatable-sorter-icon datatable-sorter-icon--down">
                    <path d="M6 10L2 6H10L6 10Z"/>
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        
        <tbody class="datatable-body">
          <template v-if="processedData.length > 0">
            <template v-for="(row, rowIndex) in processedData" :key="getRowKey(row, rowIndex)">
              <tr
                :class="getRowClass(row, rowIndex)"
                @click="handleRowClick(row, rowIndex)"
                @dblclick="handleRowDblClick(row, rowIndex)"
              >
                <td v-if="expandable" class="datatable-cell datatable-cell--expand">
                  <button
                    type="button"
                    class="datatable-expand-btn"
                    :class="{ 'datatable-expand-btn--expanded': isExpanded(row) }"
                    @click.stop="handleExpand(row)"
                    :aria-expanded="isExpanded(row)"
                    :aria-label="isExpanded(row) ? t('components.dataDisplay.dataTable.collapse') : t('components.dataDisplay.dataTable.expand')"
                  >
                    <svg viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </td>
                <td v-if="selectable" class="datatable-cell datatable-cell--select">
                  <label class="datatable-checkbox">
                    <input
                      type="checkbox"
                      :checked="isSelected(row)"
                      @change="handleSelect(row, rowIndex)"
                      @click.stop
                    />
                    <span class="datatable-checkbox-indicator"></span>
                  </label>
                </td>
                <td
                  v-for="column in columns"
                  :key="column.key"
                  :class="getCellClass(column)"
                  :style="getCellStyle(column)"
                >
                  <slot v-if="$slots[`cell-${column.key}`]" :name="`cell-${column.key}`" :row="row" :column="column" :rowIndex="rowIndex" />
                  <template v-else-if="column.render">
                    <DataTableRenderCell
                      :render="column.render"
                      :row="row"
                      :column="column"
                      :row-index="rowIndex"
                    />
                  </template>
                  <template v-else>{{ row[column.key] }}</template>
                </td>
              </tr>
              <tr v-if="expandable && isExpanded(row)" class="datatable-expand-row">
                <td :colspan="totalColumns" class="datatable-expand-content">
                  <slot name="expand" :row="row" :rowIndex="rowIndex" />
                </td>
              </tr>
            </template>
          </template>
          <tr v-else class="datatable-empty-row">
            <td :colspan="totalColumns" class="datatable-empty-cell">
              <slot name="empty">
                <div class="datatable-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="datatable-empty-icon">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18"/>
                    <path d="M9 21V9"/>
                  </svg>
                  <span class="datatable-empty-text">{{ displayEmptyText }}</span>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
        
        <tfoot v-if="$slots.footer" class="datatable-foot">
          <tr>
            <td :colspan="totalColumns" class="datatable-foot-cell">
              <slot name="footer" />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div v-if="pagination && effectiveTotal > 0" class="datatable-pagination">
      <div class="datatable-pagination-info">
        <template v-if="selectable && selectedRows.length > 0">
          {{ t('components.dataDisplay.dataTable.selectedRecords', { selected: selectedRows.length, total: effectiveTotal }) }}
        </template>
        <template v-else>
          {{ t('components.dataDisplay.dataTable.totalRecords', { total: effectiveTotal }) }}
        </template>
      </div>
      <div class="datatable-pagination-size" v-if="showSizeChanger">
        <select v-model="internalPageSize" class="datatable-pagination-select" @change="handlePageSizeChange">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }} {{ t('components.pagination.pageSizeOption') }}</option>
        </select>
      </div>
      <div class="datatable-pagination-controls">
        <button
          type="button"
          class="datatable-pagination-btn"
          :disabled="internalCurrentPage === 1"
          @click="handlePageChange(1)"
          :aria-label="t('components.pagination.firstPage')"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M9 1.5L4 6L9 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 1.5L1 6L6 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          class="datatable-pagination-btn"
          :disabled="internalCurrentPage === 1"
          @click="handlePageChange(internalCurrentPage - 1)"
          :aria-label="t('components.pagination.prevPage')"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="datatable-pagination-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            class="datatable-pagination-page"
            :class="{ 'datatable-pagination-page--active': page === internalCurrentPage }"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
        </div>
        <button
          type="button"
          class="datatable-pagination-btn"
          :disabled="internalCurrentPage === totalPages"
          @click="handlePageChange(internalCurrentPage + 1)"
          :aria-label="t('components.pagination.nextPage')"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          class="datatable-pagination-btn"
          :disabled="internalCurrentPage === totalPages"
          @click="handlePageChange(totalPages)"
          :aria-label="t('components.pagination.lastPage')"
        >
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M3 1.5L8 6L3 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 1.5L11 6L6 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, ref, VNode, watch, type PropType } from 'vue';
import { genId } from '@ocpui/vue/utils';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import {
  computeTotalPages,
  computeVisiblePages,
  paginateClientData,
  resolveRowKey,
  sortTableData,
  columnWidthStyle,
  useTableSort,
  useTableSelection,
  type TableSortOrder,
} from '@ocpui/vue/composables/useTableCore';

const { uiT: t } = useUiT();

type TableColumnAlign = 'left' | 'center' | 'right';

interface TableColumn {
  key: string;
  title: string;
  width?: number | string;
  align?: TableColumnAlign;
  fixed?: 'left' | 'right';
  sorter?: boolean | ((a: Record<string, unknown>, b: Record<string, unknown>) => number);
  render?: (row: Record<string, unknown>, column: TableColumn, rowIndex: number) => VNode | string | number;
  ellipsis?: boolean;
}

/** render 返回 VNode 或纯文本；禁止把字符串交给 component :is */
const DataTableRenderCell = defineComponent({
  name: 'DataTableRenderCell',
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
type DataTableVariant = 'surface' | 'plain';

interface Props {
  columns: TableColumn[];
  /** 行数据可为任意具名业务接口；内部按 columns 字段读取并收窄为记录视图 */
  data: object[];
  rowKey?: string | ((row: object) => string);
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  maxHeight?: number;
  pagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  total?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  multiple?: boolean;
  expandable?: boolean;
  expandedKeys?: (string | number)[];
  customClass?: string;
  /**
   * 分页数据来源：server 由父级只传入当前页；client 在组件内对 data 排序后按页切片。
   */
  paginationMode?: 'client' | 'server';
  /**
   * 列表页默认 surface，外层不得再包 Card。
   * plain 仅用于已在合法父表面内嵌的场景。
   */
  variant?: DataTableVariant;
  /** 行高密度：sm|md|lg */
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  data: () => [],
  rowKey: 'id',
  bordered: false,
  striped: false,
  hoverable: true,
  loading: false,
  loadingText: undefined,
  emptyText: undefined,
  maxHeight: 0,
  pagination: false,
  pageSize: 10,
  currentPage: 1,
  total: 0,
  showSizeChanger: false,
  pageSizeOptions: () => [10, 20, 50, 100],
  selectable: false,
  selectedKeys: () => [],
  multiple: true,
  expandable: false,
  expandedKeys: () => [],
  customClass: '',
  paginationMode: 'server',
  variant: 'surface',
  size: 'md',
});

const emit = defineEmits<{
  'row-click': [row: Record<string, unknown>, rowIndex: number];
  'row-dblclick': [row: Record<string, unknown>, rowIndex: number];
  'sort-change': [sortInfo: { column: TableColumn; order: TableSortOrder }];
  'page-change': [page: number];
  'page-size-change': [pageSize: number];
  'select': [selectedKeys: (string | number)[], selectedRows: Record<string, unknown>[]];
  'select-all': [selectedKeys: (string | number)[], selectedRows: Record<string, unknown>[]];
  'expand': [expandedKeys: (string | number)[], expandedRows: Record<string, unknown>[]];
}>();

const internalSelectedKeys = ref<(string | number)[]>([...props.selectedKeys]);
const internalExpandedKeys = ref<(string | number)[]>([...props.expandedKeys]);

// 具名业务行在边界一次性收窄为字段驱动的记录视图，内部逻辑统一使用
const rows = computed<Record<string, unknown>[]>(() =>
  props.data as Record<string, unknown>[],
);

const { sortColumn, sortOrder, toggleSort, sorterClass, sortedHeaderClass } = useTableSort<TableColumn>({
  columns: () => props.columns,
  onSortChange: (payload) => emit('sort-change', payload),
});

const selection = useTableSelection({
  data: () => rows.value,
  rowKey: () => props.rowKey,
  selectedKeys: internalSelectedKeys,
  multiple: () => props.multiple,
  onSelect: (keys, rows) => emit('select', keys, rows),
  genFallbackId: (index) => genId(),
});

// 监听props变化，同步内部状态
watch(() => props.currentPage, (newPage) => {
  internalCurrentPage.value = newPage;
});

watch(() => props.pageSize, (newSize) => {
  internalPageSize.value = newSize;
});

watch(() => props.selectedKeys, (newKeys) => {
  internalSelectedKeys.value = [...newKeys];
}, { deep: true });

watch(() => props.expandedKeys, (newKeys) => {
  internalExpandedKeys.value = [...newKeys];
}, { deep: true });

const internalCurrentPage = ref(props.currentPage);
const internalPageSize = ref(props.pageSize);

const dataTableClass = computed(() => {
  const classes = ['datatable', `datatable--${props.variant}`, `datatable--${props.size}`];
  if (props.striped) classes.push('datatable--striped');
  if (props.hoverable) classes.push('datatable--hoverable');
  if (props.loading) classes.push('datatable--loading');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const displayLoadingText = computed(() => props.loadingText ?? t('components.dataDisplay.dataTable.loadingText'));
const displayEmptyText = computed(() => props.emptyText ?? t('components.dataDisplay.dataTable.emptyText'));

const totalColumns = computed(() => {
  let count = props.columns.length;
  if (props.expandable) count++;
  if (props.selectable) count++;
  return count;
});

/** 用于分页条数与总页数：客户端分页以 data 长度为准 */
const effectiveTotal = computed(() =>
  props.pagination && props.paginationMode === 'client' ? rows.value.length : props.total
);

const totalPages = computed(() =>
  computeTotalPages(effectiveTotal.value, internalPageSize.value),
);

const visiblePages = computed(() =>
  computeVisiblePages(internalCurrentPage.value, totalPages.value),
);

const processedData = computed(() => {
  let result = sortTableData(rows.value, props.columns, sortColumn.value, sortOrder.value);

  if (props.pagination && props.paginationMode === 'client') {
    result = paginateClientData(result, internalCurrentPage.value, internalPageSize.value);
  }

  return result;
});

const {
  selectedRows,
  isAllSelected,
  isIndeterminate,
  toggleRow: handleSelect,
  toggleAll: handleSelectAll,
  clearSelection,
} = selection;

const getRowKey = (row: Record<string, unknown>, index = 0): string | number =>
  resolveRowKey(row, index, props.rowKey, genId());

const getHeaderClass = (column: TableColumn) =>
  sortedHeaderClass(column, 'datatable-header');

const getHeaderStyle = (column: TableColumn) => columnWidthStyle(column);

const getSorterClass = (column: TableColumn) =>
  sorterClass(column, 'datatable-sorter');

const getRowClass = (row: Record<string, unknown>, rowIndex: number) => {
  const classes = ['datatable-row'];
  if (props.striped && rowIndex % 2 === 1) classes.push('datatable-row--striped');
  if (isSelected(row, rowIndex)) classes.push('datatable-row--selected');
  return classes;
};

const getCellClass = (column: TableColumn) => {
  const classes: string[] = ['datatable-cell'];
  if (column.align) classes.push(`datatable-cell--${column.align}`);
  if (column.ellipsis) classes.push('datatable-cell--ellipsis');
  return classes;
};

const getCellStyle = (column: TableColumn) => columnWidthStyle(column);

function isSelected(row: Record<string, unknown>, rowIndex?: number): boolean {
  const index = rowIndex ?? rows.value.indexOf(row);
  return selection.isRowSelected(row, index);
}

const isExpanded = (row: Record<string, unknown>) => {
  const rowIndex = rows.value.indexOf(row);
  const key = getRowKey(row, rowIndex);
  return internalExpandedKeys.value.includes(key);
};

const handleHeaderClick = (column: TableColumn) => toggleSort(column);

const handleRowClick = (row: Record<string, unknown>, rowIndex: number) => {
  emit('row-click', row, rowIndex);
};

const handleRowDblClick = (row: Record<string, unknown>, rowIndex: number) => {
  emit('row-dblclick', row, rowIndex);
};

function handleSelectAllWrapped() {
  handleSelectAll();
  emit('select-all', [...internalSelectedKeys.value], selectedRows.value);
}

const handleExpand = (row: Record<string, unknown>) => {
  // 遍历数据找到当前行的索引
  const rowIndex = rows.value.indexOf(row);
  const key = getRowKey(row, rowIndex);
  const index = internalExpandedKeys.value.indexOf(key);
  
  if (index > -1) {
    internalExpandedKeys.value.splice(index, 1);
  } else {
    internalExpandedKeys.value.push(key);
  }
  
  const expandedRows = rows.value.filter(r => {
    const rIndex = rows.value.indexOf(r);
    const rKey = getRowKey(r, rIndex);
    return internalExpandedKeys.value.includes(rKey);
  });
  emit('expand', [...internalExpandedKeys.value], expandedRows);
};

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  internalCurrentPage.value = page;
  emit('page-change', page);
};

const handlePageSizeChange = () => {
  internalCurrentPage.value = 1;
  emit('page-size-change', internalPageSize.value);
};

const selectAll = () => {
  internalSelectedKeys.value = rows.value.map((row, index) => getRowKey(row, index));
};

defineExpose({
  sortColumn,
  sortOrder,
  currentPage: internalCurrentPage,
  pageSize: internalPageSize,
  selectedKeys: internalSelectedKeys,
  expandedKeys: internalExpandedKeys,
  clearSelection,
  selectAll,
});
</script>

<style scoped>
.datatable {
  position: relative;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
}

/* 列表唯一内容面；外层禁止再包 Card */
.datatable--surface {
  background: hsl(var(--surface));
  border-radius: 16px;
  border: 1px solid hsl(var(--border));
}

.datatable--plain {
  background: transparent;
  border-radius: 0;
  border: none;
}

.datatable--sm .datatable-header {
  padding: 10px 12px;
  font-size: 12px;
}

.datatable--sm .datatable-cell {
  padding: 10px 12px;
  font-size: 13px;
}

.datatable--lg .datatable-header {
  padding: 18px 20px;
  font-size: 14px;
}

.datatable--lg .datatable-cell {
  padding: 18px 20px;
  font-size: 15px;
}

.datatable-toolbar {
  padding: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.datatable-wrapper {
  overflow-x: auto;
  overflow-y: auto;
}

.datatable-inner {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.datatable-inner--bordered {
  border: 1px solid hsl(var(--border));
}

.datatable-head {
  background: hsl(var(--surface-container-high));
}

.datatable-header {
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--text-secondary));
  text-align: left;
  border-bottom: 1px solid hsl(var(--border));
  white-space: nowrap;
  transition: background 0.2s;
}

.datatable-header--center {
  text-align: center;
}

.datatable-header--right {
  text-align: right;
}

.datatable-header--expand,
.datatable-header--select {
  text-align: center;
  padding: 14px 12px;
}

.datatable-header--sortable {
  cursor: pointer;
  user-select: none;
}

.datatable-header--sortable:hover {
  background: hsl(var(--surface-hover));
}

.datatable-header-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.datatable-header-title {
  display: inline-flex;
  align-items: center;
}

.datatable-sorter {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.datatable-header--sortable:hover .datatable-sorter {
  opacity: 0.6;
}

.datatable-sorter--ascend,
.datatable-sorter--descend {
  opacity: 1;
}

.datatable-sorter-icon {
  width: 10px;
  height: 6px;
  color: hsl(var(--text-muted));
}

.datatable-sorter--ascend .datatable-sorter-icon--up,
.datatable-sorter--descend .datatable-sorter-icon--down {
  color: hsl(var(--primary));
}

.datatable-body {
  background: hsl(var(--surface));
}

.datatable-row {
  transition: background 0.2s;
}

.datatable--hoverable .datatable-row:hover {
  background: hsl(var(--surface-hover));
}

.datatable--striped .datatable-row--striped {
  background: hsl(var(--surface-container-high) / 0.5);
}

.datatable-row--selected {
  background: hsl(var(--primary) / 0.05);
}

.datatable-cell {
  padding: 14px 16px;
  font-size: 14px;
  color: hsl(var(--text));
  border-bottom: 1px solid hsl(var(--border));
  transition: background 0.2s;
}

.datatable-cell--center {
  text-align: center;
}

.datatable-cell--right {
  text-align: right;
}

.datatable-cell--ellipsis {
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.datatable-cell--expand,
.datatable-cell--select {
  text-align: center;
  padding: 10px 12px;
}

.datatable-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.datatable-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.datatable-checkbox-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.datatable-checkbox input:checked + .datatable-checkbox-indicator {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.datatable-checkbox input:checked + .datatable-checkbox-indicator::after {
  content: '';
  display: block;
  width: 5px;
  height: 9px;
  border: solid hsl(var(--primary-foreground));
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translateY(0);
}

.datatable-checkbox input:indeterminate + .datatable-checkbox-indicator {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.datatable-checkbox input:indeterminate + .datatable-checkbox-indicator::after {
  content: '';
  display: block;
  width: 10px;
  height: 2px;
  background: hsl(var(--primary-foreground));
}

.datatable-expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.datatable-expand-btn:hover {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text));
}

.datatable-expand-btn--expanded svg {
  transform: rotate(180deg);
}

.datatable-expand-btn svg {
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
}

.datatable-expand-row {
  background: hsl(var(--surface-container-high) / 0.5);
}

.datatable-expand-content {
  padding: 16px 24px;
  border-bottom: 1px solid hsl(var(--border));
}

.datatable-empty-row {
  height: 200px;
}

.datatable-empty-cell {
  padding: 40px 16px;
  text-align: center;
}

.datatable-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.datatable-empty-icon {
  width: 48px;
  height: 48px;
  color: hsl(var(--text-muted));
}

.datatable-empty-text {
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.datatable-foot {
  background: hsl(var(--surface-container-high));
}

.datatable-foot-cell {
  padding: 12px 16px;
  border-top: 1px solid hsl(var(--border));
}

.datatable-loading {
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
  backdrop-filter: blur(4px);
  z-index: 10;
}

.datatable-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: datatable-spin 0.8s linear infinite;
}

@keyframes datatable-spin {
  to { transform: rotate(360deg); }
}

.datatable-loading-text {
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.datatable-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid hsl(var(--border));
  flex-wrap: wrap;
  gap: 12px;
}

.datatable-pagination-info {
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.datatable-pagination-info strong {
  color: hsl(var(--primary));
  font-weight: 600;
}

.datatable-pagination-size {
  display: flex;
  align-items: center;
}

.datatable-pagination-select {
  padding: 6px 12px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  font-size: 14px;
  color: hsl(var(--text));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.datatable-pagination-select:hover {
  border-color: hsl(var(--border-hover));
}

.datatable-pagination-select:focus {
  border-color: hsl(var(--primary));
  outline: none;
}

.datatable-pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.datatable-pagination-btn {
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

.datatable-pagination-btn:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.datatable-pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.datatable-pagination-btn svg {
  width: 12px;
  height: 12px;
}

.datatable-pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.datatable-pagination-page {
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

.datatable-pagination-page:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.datatable-pagination-page--active {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.datatable-pagination-page--active:hover {
  background: hsl(var(--primary) / 0.9);
  border-color: hsl(var(--primary) / 0.9);
}

.datatable--loading .datatable-wrapper {
  pointer-events: none;
}
/* 响应式样式 */
@media (max-width: 575.98px) {
  .datatable {
    border-radius: 12px;
  }
  
  .datatable-header {
    padding: 12px 14px;
    font-size: 14px;
  }
  
  .datatable-header--expand,
  .datatable-header--select {
    padding: 12px 10px;
  }
  
  .datatable-cell {
    padding: 12px 14px;
    font-size: 14px;
  }
  
  .datatable-cell--expand,
  .datatable-cell--select {
    padding: 10px;
  }
  
  .datatable-empty-row {
    height: 150px;
  }
  
  .datatable-empty-cell {
    padding: 30px 14px;
  }
  
  .datatable-empty-icon {
    width: 36px;
    height: 36px;
  }
  
  .datatable-empty-text {
    font-size: 14px;
  }
  
  .datatable-pagination {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }
  
  .datatable-pagination-controls {
    width: 100%;
    justify-content: center;
  }
  
  .datatable-pagination-btn {
    width: 36px;
    height: 36px;
  }
  
  .datatable-pagination-page {
    min-width: 36px;
    height: 36px;
  }
  
  .datatable-pagination-info {
    font-size: 14px;
  }
  
  .datatable-pagination-size {
    width: 100%;
  }
  
  .datatable-pagination-select {
    width: 100%;
    padding: 8px 12px;
    min-height: 40px;
  }
  
  .datatable-expand-content {
    padding: 12px 16px;
  }
}
</style>
