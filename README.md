# OCP UI

Vue 3 设计系统与组件库 monorepo：`@ocpui/vue`（原语与运行时）、`@ocpui/vue-admin`（后台 Shell）、`@ocpui/vue-docs`（文档 Wiki 组件），以及 Markdown 管线与文档站工具链。

## 仓库结构

```
core/           可发布的 Vue 包
  vue/          @ocpui/vue
  vue-admin/    @ocpui/vue-admin
  vue-docs/     @ocpui/vue-docs
tool/           工具链
  markdown-core/  @ocpui/markdown-core
  docgen/         @ocpui/docgen（ocp-doc CLI）
casus/          案例与内容
  docs/         @ocpui/docs（设计规格与组件文档站）
  playground/   @ocpui/playground（演示应用）
```

## 快速开始

环境：Node.js ≥ 20，[pnpm](https://pnpm.io/) 9。

```bash
pnpm install
pnpm playground:dev    # http://localhost:5175
pnpm docs:dev          # 文档站（默认 5190）
```

接入步骤：[core/vue/docs/QUICKSTART.md](./core/vue/docs/QUICKSTART.md)

设计体系入口：[casus/docs/spec/index.md](./casus/docs/spec/index.md)

## 包一览

| 包 | 说明 | 文档 |
|----|------|------|
| **@ocpui/vue** | 原语/区块、UiRoot、反馈、主题、Vite/Nuxt 集成 | [core/vue/README.md](./core/vue/README.md) |
| **@ocpui/vue-admin** | AdminPage、DataTable、列表范式 | [core/vue-admin/README.md](./core/vue-admin/README.md) |
| **@ocpui/vue-docs** | MD Wiki 阅读/编辑组件 | [core/vue-docs/README.md](./core/vue-docs/README.md) |
| **@ocpui/markdown-core** | unified/remark/rehype 管线 | [tool/markdown-core/README.md](./tool/markdown-core/README.md) |
| **@ocpui/docgen** | 文档 SSG（`ocp-doc`） | [tool/docgen/README.md](./tool/docgen/README.md) |

## 质量门禁

```bash
pnpm check    # 各包 typecheck / 契约检查 / registry 同步
pnpm test     # 单元测试
pnpm publish:dry   # 构建 dist 并校验真实 tarball（vue、vue-admin），详见 core/vue/README.md「发布」
```

## 许可证

[MIT](./LICENSE)
