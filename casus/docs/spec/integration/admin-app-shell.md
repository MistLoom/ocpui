---
id: I:APP-SHELL
doc_type: integration
parent: O:ROOT
related:
  - F:CONTAINER-CHAIN
  - G:T4-BOUNDARY
design_intent: "定义包外 AppShell 与 OCP 容器链的挂载契约"
scope: "消费方 AppShell 职责、slots、上下文传递"
status: stable
---

# AppShell 包外契约

## 1. 为何包外

AppShell 绑定：

- 路由与菜单
- 权限与责任范围
- 通知中心、命令入口
- 应用级 store

上述属 **L4/L5**，不可进 `@ocpui/vue-admin`（改造方案 §1.3 已确认）。

## 2. 容器链位置

```
UiRoot（应用入口 main.ts）
 └─ UiScenarioScope?（页面级）
     └─ AppShell（消费方 layouts/AppShell.vue）
         └─ T3 Shell（AdminPage 等）
```

AppShell **MUST** 在 UiRoot 内；**MAY** 在 UiScenarioScope 外（全局壳）或内（局部覆盖）。

## 3. AppShell 职责

| 职责 | 实现 |
|------|------|
| 导航结构 | SideBar, TopBar |
| 责任/命令上下文 | 传入 T4 或 page props |
| 系统通知入口 | systemChannel → Notify 中心 |
| Outlet | `<router-view />` 挂载 T3/T4 |

## 4. AppShell 不承担

- 列表 loading/empty（AdminWorkList）
- 表格行渲染（DataTable）
- 领域表单校验（T4）
- 替代 UiRoot 的 theme/feedback

## 5. 上下文传递

AppShell → 页面 **SHOULD** provide（应用层）：

```typescript
interface AppShellContext {
  responsibilityScope?: unknown  // 责任范围
  entryReason?: string           // 进入理由（L5）
  restorePoint?: unknown         // 恢复节点
}
```

OCP 组件 **不读取** 上述字段；T4 读取并传给 Shell props（如 AdminWorkList 文案）。

## 6. 跨页恢复

| 项 | 负责层 |
|----|--------|
| scroll/selection 存储 | apps store 或 router meta |
| Shell preserve props | T3 文档化 hooks |
| 返回时状态说明 | T4 页面逻辑 |

## 7. 与 NotificationCenter

系统事件 → systemChannel → AppShell Notify  
**禁止** Notify 打开时强制 route 跳转抢焦点（对齐 F:MOTION mustNot）。

## 8. 决策追溯

| 决策 | 依据 | 表现 |
|------|------|------|
| 不抽 AppChrome 进包 | 应用绑定 | packages 无 AppShell |
| UiRoot 在 AppShell 外 | feedback 单入口 | main.ts 挂载 |
