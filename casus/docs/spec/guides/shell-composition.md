---
id: G:SHELL
doc_type: guide
parent: O:ROOT
related:
  - F:CONTAINER-CHAIN
  - F:STATE-SYSTEM
  - C:ADMIN-WORK-LIST
  - C:ADMIN-PAGE
  - C:DATA-TABLE
design_intent: "T3 Shell 组合与状态编排的标准模式"
scope: "AdminPage、AdminWorkList、DataTable 组合 recipe"
status: stable
---

# Shell 组合

## 1. 标准列表页（K:ADMIN-LIST-PAGE）

```vue
<UiRoot surface="list" scene="workbench">
  <UiScenarioScope presentation-mode="scan">
    <AdminPage>
      <template #toolbar>
        <SizeScope size="sm">
          <!-- FilterTagGroup, Search, actions -->
        </SizeScope>
      </template>
      <AdminWorkList
        :loading="state === 'loading'"
        :is-error="state === 'error'"
        :is-empty="state === 'empty'"
        :has-filter="hasFilter"
      >
        <DataTable ... />
      </AdminWorkList>
    </AdminPage>
  </UiScenarioScope>
</UiRoot>
```

### 职责分工

| 组件 | dispatchRole | 职责 |
|------|--------------|------|
| AdminPage | focus-host | 布局、toolbar/body 分割 |
| AdminWorkList | content-host | 10 态分支（逐步扩展） |
| DataTable | — | ready 态行渲染、批量选择 |

## 2. 状态编排

推荐 `useUiRegionState`（S2）驱动 AdminWorkList props：

```
initial → loading → ready | empty | error | partial_error | forbidden
用户提交 → submitting → success | error
success → success_followup（可选）
```

**禁止**在 DataTable 内再写一套 loading/empty。

## 3. 表单页

```vue
<UiScenarioScope surface="form" scene="editor" presentation-mode="progressive">
  <AdminPage>
    <Form>...</Form>
  </AdminPage>
</UiScenarioScope>
```

- 校验：actionChannel 内联
- 提交：按钮 loading + submitting 态
- 阻断：Dialog overlay-host

## 4. 详情页

`surface="detail"`, `presentation-mode="detail"`  
主内容：Descriptions / Card 分组；不用 AdminWorkList。

## 5. 浮层编辑

`surface="overlay"` + Drawer  
motion.purpose = explain_spatial_origin  
focusPolicy = restore-trigger

## 6. 列表更新纪律

- 新行：队列入口提示，不重排选中（motion mustNot）
- 行 patch：原位更新
- 批量结果：分组 stable 落位

## 7. Slot 约定

| Shell | Slot | 用途 |
|-------|------|------|
| AdminPage | #toolbar | 筛选/操作 |
| AdminPage | #tabs | 可选视图切换 |
| AdminPage | default | Body |
| AdminWorkList | #error-action | 重试 |
| AdminWorkList | #empty-footer | 调整筛选/创建 |
| DataTable | #toolbar, #footer | 表格级操作 |

## 8. 决策追溯

| 决策 | 表现 |
|------|------|
| 页头与列表体分离 | AdminPage vs AdminWorkList |
| 类型库式列表体 | 注释已说明；规格升格为 10 态 |
| DataTable 不包 Card | registry antiPatterns |
