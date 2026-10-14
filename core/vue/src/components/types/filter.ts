/**
 * 活动筛选标签（ActiveFilterTags）数据契约
 * 从 SFC 提取到类型层，供 data-display barrel 与包根 re-export
 */
export interface ActiveFilter {
  /** 筛选条件唯一键 */
  key: string;
  /** 字段名（标签左半） */
  label: string;
  /** 原始筛选值 */
  value: unknown;
  /** 筛选值展示文案（标签右半） */
  valueLabel: string;
  /** 可选图标名 */
  icon?: string;
}
