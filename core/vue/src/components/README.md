# UI 组件库

## 目录结构

| 目录 | 用途 |
|------|------|
| animation/ | 动画过渡组件（CollapseTransition、FadeTransition、NumberAnimation、Marquee、SlideTransition、InfiniteScroll 等） |
| business/ | 业务组件（chat：ChatMessage、ChatSender、ChatThinking） |
| composables/ | 组件相关 composable（useHoverActive、useLoading、usePopupPanel、useThemeClass 等） |
| data-display/ | 数据展示组件（Table、List、Card、Tag、Statistic、Progress、Timeline、Carousel、Tree、Chart、Descriptions 等） |
| data-entry/ | 数据录入组件（Input、Select、Checkbox、DatePicker、Suggestion、Form、Upload、Cascader 等） |
| feedback/ | 反馈组件（Modal、Dialog、Drawer、Loading、Message、Notification、Alert、Popover、Tooltip、Result 等） |
| interaction/ | 交互组件（GlobalSearch、ContextMenu、DropZone、KeyboardShortcut、SelectionToolbar 等） |
| layout/ | 布局组件（AdminPage、AdminWorkList、Grid、Flex、Layout、Split、ResponsiveLayout、SizeScope 等） |
| navigation/ | 导航组件（Tabs、Breadcrumb、Pagination、Menu、Steps、Dropdown、PageHeader 等） |
| utility/ | 工具组件（Button、Icon、Avatar、Badge、Empty、Skeleton、Typography、ThemeToggle、ThemeSelector、GlobalStyle 等） |
| types/ | 共享类型定义 |
| utils/ | 工具函数 |

## 使用方式

组件通过 `@/components/ui` 统一导入，部分组件支持 unplugin-vue-components 自动导入。

## 列表页布局

分区：`AdminPage` → header → tabs（可选）→ toolbar → body（唯一内容面）。

硬规则：

1. 页面 padding 只由 `AppShell` 负责，页面根节点不得再加 padding。
2. `DataTable` 默认 `variant="surface"` 自带内容面，外层禁止再包 `Card`。
3. `Card` 仅用于详情分组、表单区块、统计块等归组，不参与列表壳。
4. 筛选放在 `AdminPage` 的 `#toolbar`（或 `DataTable` 的 `#toolbar`），禁止塞进 `Card` header。
5. 页头用 `AdminPage` 的 `title`/`#extra` 或 `PageHeader`，禁止各页复制 `__header` 样式块。

正例：

```vue
<AdminPage title="板块" subtitle="...">
  <template #extra>
    <RefreshButton :loading="loading" @refresh="reload" />
    <Button variant="primary">新建</Button>
  </template>
  <template #toolbar>
    <Input prefix-icon="search" ... />
    <FilterTagGroup ... />
  </template>
  <DataTable :columns="..." :data="..." />
</AdminPage>
```

反例：`Card` 包裹 `DataTable`；页根再写 `padding: 20px`；筛选写在 `Card` 的 `#title`；离散筛选用 `Select`。

## 表格

- **列表页公开表面**：优先使用 `DataTable`（含 `variant` surface/plain、`size` sm|md|lg、分页、toolbar slot）。
- `Table` 为兼容层（`@deprecated`），尺寸已对齐 `sm|md|lg`；新代码勿新增 `Table` 引用。
- 外层禁止再包 `Card`。详情卡内嵌表用 `DataTable variant="plain"`。

## 组合与尺寸约束

1. 尺寸枚举唯一为 `sm | md | lg`（高度 token：32 / 36 / 40）。禁止 `small/medium/large` 与控件各自发明高度。
2. 尺寸解析链：显式 `size` prop → `FormItem` → `Form` → `SizeScope`/`AdminPage` toolbar → 默认 `md`。实现：`useComponentSize`。
3. Form 注入键必须使用 `FORM_CONTEXT_KEY` / `FORM_ITEM_CONTEXT_KEY`（Symbol），禁止字符串 `provide('formContext')`。
4. 锚定弹出层统一走 `PopupPanel` / `useFloatingPosition`（`@floating-ui/dom` + `autoUpdate`）。Select 使用 `placement="bottom-start"` + `match-width`。禁止各组件硬编码假宽高算坐标。
5. `AdminPage` `#toolbar` 通过 `SizeScope size="sm"` 注入紧凑密度；Input / Select / Button / Picker / Search / IconButton / RefreshButton / Checkbox / Radio / FilterTagGroup / SegmentedControl / Slider / Rate 未写 size 时继承该密度。
6. `Icon` 只解析 `lucide-vue-next`（及 `resolve-icon.ts` 中的业务别名），禁止再堆内联 SVG 字典；自定义图形用 `svg` 属性。Lucide 必须显式 `fill="none"`（实心名除外），禁止传 `undefined` 覆盖默认填充。
7. 离散筛选用 `FilterTagGroup`。无界选项列表才用 `Select`。关键词筛选用 `Input` `prefix-icon="search"`。
8. `ThemeToggle` 必须走 `useThemeTransition`（View Transitions），禁止直接 `toggleTheme()`。
9. 列表页壳只用 `AdminPage`；列表体加载/空/错用 `AdminWorkList`。禁止平行页壳。
10. 空状态用 `Empty`。
11. 视图切换用 `SegmentedControl`。多选标签用 `FilterTagGroup` `multiple`。
12. 上传用 `Upload`；抽屉用 `Drawer`；指标用 `Statistic` / `MetricCard`。禁止再包一层业务壳。

## 注意事项

- 新增组件必须同步更新对应目录的 index.ts
- 下架组件必须同步清理引用与 i18n 键
- 主题相关组件（Header/Footer）不属于 UI 组件库，位于 components/ 根目录
