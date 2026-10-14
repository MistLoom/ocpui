# DataTable

T3 列表 Shell，组合 Table、Pagination、Empty 与 Loading，用于标准 CRUD 列表页主内容区。

## 基础

<DemoWrap>
  <DataTableBasicDemo />
</DemoWrap>

## 分页

<DemoWrap>
  <DataTablePaginationDemo />
</DemoWrap>

## 组合

- `Table` — 列渲染与排序
- `Pagination` — 页码切换
- `Empty` — 空数据
- `Loading` — 加载遮罩
- `Search` — 工具栏检索（`#toolbar` 插槽）

## 反模式

- `Card` 包裹 `DataTable`
- 页根额外 padding
- 页内重复筛选条

## 容器

置于 `AdminPage` + `surface=list` 的 `#default` 插槽，勿再套装饰性外层。
