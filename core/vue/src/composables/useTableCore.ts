import type { Ref } from 'vue';
import { computed, ref } from 'vue';

export type TableColumnAlign = 'left' | 'center' | 'right';
export type TableSortOrder = 'ascend' | 'descend' | false;

export interface TableColumnBase {
  key: string;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: TableColumnAlign;
  fixed?: 'left' | 'right';
  sorter?: boolean | ((a: Record<string, unknown>, b: Record<string, unknown>) => number);
  ellipsis?: boolean;
}

/** 解析行唯一键 */
export function resolveRowKey(
  row: Record<string, unknown>,
  index: number,
  rowKey: string | ((row: Record<string, unknown>) => string | number) = 'id',
  fallbackId?: string | number,
): string | number {
  if (typeof rowKey === 'function') return rowKey(row);
  const key = row[rowKey];
  if (key !== undefined && key !== null) return key as string | number;
  return fallbackId ?? index;
}

/** 对数据应用排序 */
export function sortTableData<T extends Record<string, unknown>>(
  data: T[],
  columns: TableColumnBase[],
  sortColumn: string,
  sortOrder: TableSortOrder,
): T[] {
  if (!sortColumn || !sortOrder) return [...data];
  const column = columns.find((col) => col.key === sortColumn);
  if (!column?.sorter) return [...data];

  const result = [...data];
  if (typeof column.sorter === 'function') {
    const sorterFn = column.sorter;
    result.sort((a, b) => {
      const order = sorterFn(a, b);
      return sortOrder === 'ascend' ? order : -order;
    });
  } else {
    result.sort((a, b) => {
      const aVal = a[sortColumn] as number | string;
      const bVal = b[sortColumn] as number | string;
      if (aVal === bVal) return 0;
      const compare = aVal > bVal ? 1 : -1;
      return sortOrder === 'ascend' ? compare : -compare;
    });
  }
  return result;
}

/** 客户端分页切片 */
export function paginateClientData<T>(
  data: T[],
  currentPage: number,
  pageSize: number,
): T[] {
  const size = Math.max(1, pageSize);
  const totalPages = data.length <= 0 ? 0 : Math.ceil(data.length / size);
  const page = totalPages <= 0 ? 1 : Math.min(Math.max(1, currentPage), totalPages);
  const start = (page - 1) * size;
  return data.slice(start, start + size);
}

export function computeTotalPages(total: number, pageSize: number): number {
  const size = Math.max(1, pageSize);
  if (total <= 0) return 0;
  return Math.ceil(total / size);
}

export function computeVisiblePages(currentPage: number, totalPages: number): number[] {
  const pages: number[] = [];
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(totalPages, start + 4);
    else start = Math.max(1, end - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

export interface UseTableSortOptions<T extends TableColumnBase> {
  columns: () => T[];
  onSortChange?: (payload: { column: T; order: TableSortOrder }) => void;
}

export function useTableSort<T extends TableColumnBase>(options: UseTableSortOptions<T>) {
  const sortColumn = ref('');
  const sortOrder = ref<TableSortOrder>(false);

  function toggleSort(column: T): void {
    if (!column.sorter) return;
    if (sortColumn.value === column.key) {
      if (sortOrder.value === 'ascend') sortOrder.value = 'descend';
      else if (sortOrder.value === 'descend') {
        sortOrder.value = false;
        sortColumn.value = '';
      }
    } else {
      sortColumn.value = column.key;
      sortOrder.value = 'ascend';
    }
    options.onSortChange?.({ column, order: sortOrder.value });
  }

  function sorterClass(column: T, prefix: string): string[] {
    const classes: string[] = [];
    if (sortColumn.value === column.key) {
      if (sortOrder.value === 'ascend') classes.push(`${prefix}--ascend`);
      if (sortOrder.value === 'descend') classes.push(`${prefix}--descend`);
    }
    return classes;
  }

  function sortedHeaderClass(column: T, baseClass: string): string[] {
    const classes = [baseClass];
    if (column.align) classes.push(`${baseClass}--${column.align}`);
    if (column.sorter) classes.push(`${baseClass}--sortable`);
    if (sortColumn.value === column.key && sortOrder.value) {
      classes.push(`${baseClass}--sorted-${sortOrder.value}`);
    }
    if (column.fixed) classes.push(`${baseClass}--fixed-${column.fixed}`);
    return classes;
  }

  function applySort<D extends Record<string, unknown>>(data: D[]): D[] {
    return sortTableData(data, options.columns(), sortColumn.value, sortOrder.value);
  }

  return { sortColumn, sortOrder, toggleSort, sorterClass, sortedHeaderClass, applySort };
}

export interface UseTableSelectionOptions {
  data: () => Record<string, unknown>[];
  rowKey: () => string | ((row: Record<string, unknown>) => string | number);
  selectedKeys: Ref<(string | number)[]>;
  multiple?: () => boolean;
  onSelect?: (keys: (string | number)[], rows: Record<string, unknown>[]) => void;
  genFallbackId?: (index: number) => string | number;
}

export function useTableSelection(options: UseTableSelectionOptions) {
  const selectedRows = computed(() =>
    options.data().filter((row, index) => {
      const key = resolveRowKey(row, index, options.rowKey(), options.genFallbackId?.(index));
      return options.selectedKeys.value.includes(key);
    }),
  );

  const isAllSelected = computed(() => {
    const rows = options.data();
    if (rows.length === 0) return false;
    return rows.every((row, index) => {
      const key = resolveRowKey(row, index, options.rowKey(), options.genFallbackId?.(index));
      return options.selectedKeys.value.includes(key);
    });
  });

  const isIndeterminate = computed(() => {
    const rows = options.data();
    if (rows.length === 0) return false;
    const count = rows.filter((row, index) => {
      const key = resolveRowKey(row, index, options.rowKey(), options.genFallbackId?.(index));
      return options.selectedKeys.value.includes(key);
    }).length;
    return count > 0 && count < rows.length;
  });

  function isRowSelected(row: Record<string, unknown>, rowIndex: number): boolean {
    const key = resolveRowKey(row, rowIndex, options.rowKey(), options.genFallbackId?.(rowIndex));
    return options.selectedKeys.value.includes(key);
  }

  function toggleRow(row: Record<string, unknown>, rowIndex: number): void {
    const key = resolveRowKey(row, rowIndex, options.rowKey(), options.genFallbackId?.(rowIndex));
    const keys = [...options.selectedKeys.value];
    const idx = keys.indexOf(key);
    if (idx >= 0) keys.splice(idx, 1);
    else if (options.multiple?.() !== false) keys.push(key);
    else keys.splice(0, keys.length, key);
    options.selectedKeys.value = keys;
    options.onSelect?.(keys, selectedRows.value);
  }

  function toggleAll(): void {
    if (isAllSelected.value) {
      options.selectedKeys.value = [];
    } else {
      options.selectedKeys.value = options.data().map((row, index) =>
        resolveRowKey(row, index, options.rowKey(), options.genFallbackId?.(index)),
      );
    }
    options.onSelect?.(options.selectedKeys.value, selectedRows.value);
  }

  function clearSelection(): void {
    options.selectedKeys.value = [];
    options.onSelect?.([], []);
  }

  return {
    selectedRows,
    isAllSelected,
    isIndeterminate,
    isRowSelected,
    toggleRow,
    toggleAll,
    clearSelection,
  };
}

export function columnWidthStyle(column: TableColumnBase): Record<string, string> {
  const style: Record<string, string> = {};
  if (column.width) {
    style.width = typeof column.width === 'number' ? `${column.width}px` : column.width;
    style.minWidth = style.width;
  }
  if (column.minWidth) {
    style.minWidth =
      typeof column.minWidth === 'number' ? `${column.minWidth}px` : column.minWidth;
  }
  return style;
}
