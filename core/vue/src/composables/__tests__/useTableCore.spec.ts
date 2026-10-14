import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import {
  resolveRowKey,
  sortTableData,
  paginateClientData,
  computeTotalPages,
  computeVisiblePages,
  useTableSort,
  useTableSelection,
  columnWidthStyle,
  type TableColumnBase,
} from '../useTableCore';

const columns: TableColumnBase[] = [
  { key: 'name', title: 'Name', sorter: true },
  { key: 'age', title: 'Age', sorter: (a, b) => (a.age as number) - (b.age as number) },
];

const rows = [
  { id: 'a', name: 'Bob', age: 30 },
  { id: 'b', name: 'Alice', age: 20 },
  { id: 'c', name: 'Carol', age: 25 },
];

describe('resolveRowKey', () => {
  it('函数 rowKey', () => {
    expect(resolveRowKey({ id: 1 }, 0, (r) => String(r.id))).toBe('1');
  });

  it('字符串 rowKey 字段', () => {
    expect(resolveRowKey({ id: 'x' }, 0, 'id')).toBe('x');
  });

  it('缺失字段回退 index', () => {
    expect(resolveRowKey({}, 2, 'id')).toBe(2);
  });
});

describe('sortTableData', () => {
  it('无排序列时原样复制', () => {
    expect(sortTableData(rows, columns, '', false)).toEqual(rows);
  });

  it('升序字符串排序', () => {
    const sorted = sortTableData(rows, columns, 'name', 'ascend');
    expect(sorted.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('自定义 sorter 降序', () => {
    const sorted = sortTableData(rows, columns, 'age', 'descend');
    expect(sorted.map((r) => r.age)).toEqual([30, 25, 20]);
  });
});

describe('paginateClientData', () => {
  it('分页切片', () => {
    const data = [1, 2, 3, 4, 5];
    expect(paginateClientData(data, 2, 2)).toEqual([3, 4]);
  });

  it('空数据返回空数组', () => {
    expect(paginateClientData([], 1, 10)).toEqual([]);
  });
});

describe('computeTotalPages', () => {
  it('计算总页数', () => {
    expect(computeTotalPages(0, 10)).toBe(0);
    expect(computeTotalPages(25, 10)).toBe(3);
  });
});

describe('computeVisiblePages', () => {
  it('当前页居中窗口', () => {
    expect(computeVisiblePages(5, 10)).toEqual([3, 4, 5, 6, 7]);
  });
});

describe('useTableSort', () => {
  it('toggleSort 三态循环', () => {
    const { sortColumn, sortOrder, toggleSort } = useTableSort({ columns: () => columns });
    toggleSort(columns[0]);
    expect(sortColumn.value).toBe('name');
    expect(sortOrder.value).toBe('ascend');

    toggleSort(columns[0]);
    expect(sortOrder.value).toBe('descend');

    toggleSort(columns[0]);
    expect(sortOrder.value).toBe(false);
    expect(sortColumn.value).toBe('');
  });
});

describe('useTableSelection', () => {
  it('单选与全选', () => {
    const selectedKeys = ref<(string | number)[]>([]);
    const { toggleRow, toggleAll, isAllSelected, isRowSelected } = useTableSelection({
      data: () => rows,
      rowKey: () => 'id',
      selectedKeys,
    });

    toggleRow(rows[0], 0);
    expect(isRowSelected(rows[0], 0)).toBe(true);

    toggleAll();
    expect(isAllSelected.value).toBe(true);
    expect(selectedKeys.value).toEqual(['a', 'b', 'c']);
  });
});

describe('columnWidthStyle', () => {
  it('数值与字符串宽度', () => {
    expect(columnWidthStyle({ key: 'x', title: 'X', width: 120 })).toEqual({
      width: '120px',
      minWidth: '120px',
    });
    expect(columnWidthStyle({ key: 'x', title: 'X', minWidth: '8rem' })).toEqual({
      minWidth: '8rem',
    });
  });
});
