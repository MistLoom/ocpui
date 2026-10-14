# 容器链

## 层级

```
UiRoot                    # 全局：theme / locale / feedback / portal
 └─ UiScenarioScope       # 可选局部：surface + scene 覆盖
     └─ AppShell          # 应用壳（消费方布局层）
         └─ Shell (T3)    # AdminPage / 全屏 Editor 壳
             ├─ #toolbar  # 筛选/操作条（SizeScope sm）
             ├─ #tabs     # 可选
             └─ Body      # 唯一主内容面
                 └─ Block / Part / Primitive
```

## 决策表

| 场景意图 | 必选容器 | 主内容组件 | 禁止 |
|----------|----------|------------|------|
| 标准列表 CRUD | `AdminPage` + `surface=list` | `DataTable` 或 `AdminWorkList` | `Card` 包 `DataTable`；页根 padding |
| 详情只读 | `AdminPage` 或 `UiScenarioScope surface=detail` | `Descriptions` / `Card` 分组 | 自建 `__header` 样式块 |
| 表单录入 | `scene=editor` + `surface=form` | `Form` + `FormItem` + T0 控件 | 页内自建校验展示逻辑 |
| 弹窗确认 | `surface=overlay` | `Modal` / `Dialog`（overlay 经 `useOverlayLayer` 收口） | `createApp` 挂 Message |
| 抽屉编辑 | `surface=overlay` | `Drawer` | 平行 `Modal`+`Drawer` 双壳 |
| 图表/指标 | `surface=chart` | `Statistic` / `Chart` 系 | 外层再套装饰 `Card` |
| 审计/日志 | `scene=audit` | `Timeline` / `Log` / `DataTable variant=plain` | 高饱和装饰 token |

## surface / scene

- **surface**：`list` · `detail` · `form` · `overlay` · `chart`
- **scene**：`workbench` · `settings` · `editor` · `audit`

由 `UiRoot` 或 `UiScenarioScope` 注入，子组件通过 `useUiScenario()` 读取。

## 定制入口

主题、语言、反馈仅通过 `UiRoot` + `UiScenarioScope` 配置，不在页面内散落 `ConfigProvider`。
