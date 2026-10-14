# @ocpui/docgen

OCP 文档静态站点生成器。Vite 驱动，消费 `@ocpui/markdown-core` 与 `@ocpui/vue-docs`。

## CLI

```bash
ocp-doc dev          # 开发服务器，HMR
ocp-doc build        # 静态输出 dist/
ocp-doc preview      # 预览 build
ocp-doc index        # 仅重建 manifest 与检索索引
ocp-doc linkcheck    # 死链报告
```

## 配置

在项目根创建 `ocp-doc.config.ts`：

```typescript
import { defineDocgenConfig } from '@ocpui/docgen';

export default defineDocgenConfig({
  collections: [{ id: 'default', src: './docs', base: '/' }],
  markdown: { plugins: ['gfm', 'slug', 'admonition', 'code-meta'] },
  theme: '@ocpui/docgen/theme-default',
  search: { provider: 'minisearch' },
});
```

## 输出

- 静态 HTML + 资产（Vite build）
- `doc-manifest.json`
- `assets/search-index.json`

## 开发态正文更新契约

保存后阅读态必须与磁盘一致。**不要**只依赖 chokidar（同进程 `writeFile` 在 Windows 上常不触发）。

| 层 | 方法 | 谁调用 |
|----|------|--------|
| 服务端 | `refreshDocgenRuntime`（`rebuild` + `invalidateModule` + HMR `ocp-docgen:update`） | 保存 API / 文件监听（`docgenPlugin` 已接好） |
| 全页刷新 | `GET /__ocp-doc/api/runtime` | `virtual:ocp-docgen` 在 serve 态 fetch，按磁盘重建后返回 |
| 会话内乐观更新 | `useDocWiki().applySavedSource` | `DocWikiShell` 保存成功后自动调用 |

自建主题或自建写盘时：写盘成功后必须走与 `refreshDocgenRuntime` 同等的刷新；客户端保存成功应继续经 `DocWikiShell`/`applySavedSource`，不要在业务页各自打补丁。

常量：`DOCGEN_VIRTUAL_ID`、`DOCGEN_HMR_UPDATE_EVENT`、`DOCGEN_RUNTIME_API_PATH`（`@ocpui/docgen` 导出）。

## 示例

```bash
cd packages/ocpui/tool/docgen/examples/demo
pnpm --filter @ocpui/docgen exec ocp-doc dev
```

规格：[doc-wiki-system.md](../../casus/docs/spec/foundation/doc-wiki-system.md) §10
