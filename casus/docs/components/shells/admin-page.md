---
title: AdminPage
description: 后台列表页 Shell
order: 1
tags: [T3, shell, admin]
---

# AdminPage

Registry：`C:ADMIN-PAGE` · `@ocpui/vue-admin`

Admin 列表/详情页的 focus-host Shell，编排筛选区、列表区与 10 态。

## 结构

```text
AdminPage
├─ #toolbar → AdminFilterToolbar
├─ #default → DataTable / AdminWorkList
└─ chrome → PageHeader / 反馈通道
```

## 组合要点

| 项 | 说明 |
| --- | --- |
| dispatchRole | focus-host |
| handlesStates | loading / empty / error / ready |
| 反馈 | action 通道确认；system 通道 notify |

## 反模式

- 在 Shell 外包裹装饰性 Card 重复 PageHeader
- 列表空态用 toast 代替 Empty

## 参考

- Registry：`packages/ocpui/core/vue-admin/registry/shells/admin-page.md`
- 演示：`pnpm playground:dev` → Admin 场景
