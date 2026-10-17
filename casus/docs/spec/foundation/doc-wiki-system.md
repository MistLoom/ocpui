---
id: F:DOC-WIKI
doc_type: foundation
parent: O:ROOT
related:
  - O:ESSENCE
  - F:TIER-CARRIER
  - F:CONTAINER-CHAIN
  - F:INTERACTION-NET
  - F:MOTION
  - F:REGISTRY-SPEC
  - F:VISUAL-LANG
  - G:AUTHORING
  - G:T4-BOUNDARY
  - I:DOCS-SYNC
design_intent: "以主流 Markdown 解析栈与 OCP 组件契约，提供可检索 Wiki 阅读/编辑与静态发布能力"
scope: "MD 解析管线、阅读/编辑组件、Wiki 数据模型、检索、SSG、样式微调、创新交互"
status: stable
---

# 文档 Wiki 体系

## 1. 职责锚定

### 本质职责

为 **Markdown 文档集**（操作手册、说明文档、内部 Wiki、公开文档站）提供：

1. **运行时阅读/编辑 UI**（Vue 组件，遵循 OCP Tier/Registry/状态/交互/动效契约）
2. **可检索的多文档 Wiki 模型**（集合、版本、权限边界由应用层注入）
3. **静态站点生成器**（SSG，输出可部署静态资源，能力对标 MkDocs Material 与 VitePress 的核心阅读体验）

解析与 AST 转换 **MUST** 使用主流开源栈（unified / remark / rehype / mdast），**禁止**自研 Markdown 词法/语法解析器。

### 发展方向

- 解析管线与 UI 解耦：`@ocpui/markdown-core` 供 SSG 与运行时共用
- 阅读场景专用 `presentationMode: read`（见 §8），与 admin `scan/summary` 正交
- 检索、跨链、名词表以 **可插拔插件 + T2 Block** 暴露，非 Shell 内硬编码

### 不负责

| 边界 | 归属 |
|------|------|
| 文档 CRUD API、权限、审计 | T4 / 应用 `logic/*` |
| 业务 Wiki 工作流（审批、发布闸门） | T4 |
| 永久并存两套 SSG | 否；D8 收敛 `@ocpui/docs` 至 docgen（§10.4） |
| 富文本非 MD 格式（Office、PDF 正文编辑） | 范围外；PDF 仅链接/嵌入 |

## 2. 对标能力矩阵

| 能力 | MkDocs Material | VitePress | OCP Doc Wiki（目标） |
|------|-----------------|-----------|----------------------|
| 多文档 + 侧栏导航 | ✅ nav / toc | ✅ sidebar | ✅ `DocWikiShell` + 集合 manifest |
| 页内 TOC / 锚点 | ✅ toc.integrate | ✅ aside | ✅ `DocToc` + heading slug 插件 |
| 全文检索 | ✅ search | ✅ local search | ✅ 索引插件 + `DocSearchSurface`（见 §9） |
| 代码高亮 / 复制 | ✅ | ✅ | ✅ `DocCodeBlock`（shiki 或 rehype 生态） |
| 提示块 admonition | ✅ | ✅ custom container | ✅ `DocAdmonition` |
| 暗色 / 主题 | ✅ | ✅ | ✅ `theme-editorial` + 阅读 token 扩展 |
| 静态导出 | ✅ mkdocs build | ✅ vitepress build | ✅ `@ocpui/docgen build` |
| 死链检查 | 插件 | ✅ | ✅ SSG 阶段 `linkcheck` 插件 |
| 跨页 instant | ✅ | ✅ SPA | ✅ 可选 `prefetch` + 路由壳 |
| 名词表 / 术语 | ✅ glossary 插件 | 部分 | ✅ `DocGlossaryTerm` + 索引（§11） |
| 样式微调 | ✅ extra css | ✅ custom css | ✅ 阅读偏好 + CSS 变量（§12） |
| 源码编辑 | 外部 | 外部 | ✅ `DocEditorShell` + 同源预览 |
| 块级所见即所得 | — | — | ✅ `DocBlockEditor`（prose / admonition / demo） |

**非目标（首版）**：多作者实时协同编辑、完整 Git 集成 UI、Mermaid 图表。

## 3. 包归属与 Tier

```
ocpui/                 (仓库根)
  core/
    vue/               @ocpui/vue              — T0–T2 原语、运行时
    vue-admin/         @ocpui/vue-admin        — T2–T3 Shell
    vue-docs/          @ocpui/vue-docs         — T1–T3 阅读/编辑组件
  tool/
    markdown-core/     @ocpui/markdown-core   — 解析管线、插件、类型、索引构建（无 Vue）
    docgen/            @ocpui/docgen           — SSG CLI（Vite 驱动，消费 markdown-core + vue-docs）
  casus/
    docs/              @ocpui/docs             — 设计规格与指南（docgen SSG）
    playground/        @ocpui/playground       — 可运行演示
```

| Tier | 包 | 组件/模块示例 |
|------|-----|--------------|
| T0 | `@ocpui/vue`（复用） | Button, Input, Tooltip, Skeleton |
| T1 | `@ocpui/vue-docs` | `DocToolbar`, `DocAside`, `DocBreadcrumb` |
| T2 | `@ocpui/vue-docs` | `MarkdownBody`, `DocToc`, `DocAdmonition`, `DocCodeBlock`, `DocGlossaryTerm`, `DocCrossPreview` |
| T3 | `@ocpui/vue-docs` | `DocReaderShell`, `DocWikiShell`, `DocEditorShell` |
| T4 | `apps/*/ui-business` | 绑定 API 的 Wiki 管理页、发布流程、权限门 |

T4 **禁止**进入 `core/*`、`tool/*`（[G:T4-BOUNDARY](../guides/t4-boundary.md)）。

## 4. 解析与渲染架构

### 4.1 技术选型（固定）

| 层 | 选型 | 说明 |
|----|------|------|
| 解析 | `remark-parse` + `remark-gfm` | GFM 为默认方言；CommonMark 子集可配置关闭 |
| MD → HTML AST | `remark-rehype` + `rehype-sanitize` | 安全默认；允许扩展 schema |
| HTML → Vue | `rehype-vue` 或 `@ocpui/markdown-core` 自定义 handler 映射到 OCP 组件 | **禁止** `v-html` 直出未消毒 HTML |
|  slug | `rehype-slug` + `rehype-autolink-headings` | 与 TOC、检索 heading 一致 |
| 高亮 | `shiki` + `rehype-shiki`（或 `@shikijs/rehype`） | 与 SSG 构建时缓存主题 |
| 元数据 | `gray-matter` / `vfile-matter` | frontmatter 与正文分离 |

编辑态 **MUST** 使用同一 `compile(markdown, options)` 入口；预览与 SSG 输出仅差 `basePath` / `assetPrefix`。

### 4.2 插件契约

插件 **MUST** 注册为 `@ocpui/markdown-core` 的命名插件，具备：

```typescript
interface OcpMarkdownPlugin {
  id: string                    // 如 'gfm' | 'admonition' | 'glossary'
  remarkPlugins?: PluggableList
  rehypePlugins?: PluggableList
  /** SSG 索引贡献字段 */
  indexContributors?: IndexContributor[]
}
```

内置插件（首版）：

| id | 职责 |
|----|------|
| `gfm` | 表格、任务列表、删除线 |
| `admonition` | `::: tip` 等容器 → `DocAdmonition` |
| `slug` | 标题锚点 |
| `code-meta` | 行号、标题、复制按钮 meta |
| `glossary` | `[[term]]` 或 `[^term]` 链接名词表 |
| `cross-doc` | 相对路径 / `collection:path` 链接解析 + 预览卡片数据 |

### 4.3 禁止

- 手写 Markdown 正则切分正文
- 阅读器与 SSG 各维护一套解析逻辑
- 绕过 `rehype-sanitize` 渲染用户/外部 MD

## 5. 文档与 Wiki 数据模型

### 5.1 逻辑实体（应用层注入，core 仅定义类型）

```typescript
/** 单个 MD 源 */
interface DocSource {
  id: string
  path: string                 // 集合内唯一，如 'guide/install.md'
  locale?: string
  frontmatter: DocFrontmatter
  body: string                   // 不含 frontmatter
  revision?: string              // etag / git sha / version id
}

/** 文档集（Wiki 集合 / 手册 / 公开站源） */
interface DocCollection {
  id: string
  title: string
  basePath: string
  defaultLocale: string
  nav?: DocNavNode[]             // 侧栏；可来自 _meta.json 或 frontmatter 树
  sources: DocSource[]
}

interface DocFrontmatter {
  title?: string
  description?: string
  order?: number
  tags?: string[]
  draft?: boolean
  /** 名词表条目：term → definition markdown */
  glossary?: Record<string, string>
  /** 阅读偏好默认值 */
  reading?: DocReadingPrefs
}
```

### 5.2 导航 manifest

SSG 与运行时 **SHOULD** 共用 `doc-manifest.json`（构建产物或 API 返回）：

```json
{
  "collectionId": "product-manual",
  "routes": [
    { "path": "/guide/install", "sourcePath": "guide/install.md", "title": "安装" }
  ],
  "navTree": [],
  "searchIndexPath": "/assets/search-index.json"
}
```

### 5.3 多集合 Wiki

- 单 `DocWikiShell` 实例绑定 **一个当前集合**；集合切换由 chrome-host（Tab / Select）驱动，**不**整页 reload
- 跨集合链接：**MUST** 使用 `collection:path` 语法（如 `[安装](manual:guide/install.md)`）或绝对 URI；禁止隐式相对路径跨集合

`collection:path` 解析规则：

| 部分 | 说明 |
|------|------|
| `collection` | 目标 `DocCollection.id` |
| `path` | 目标集合内 `DocSource.path`（含扩展名） |
| 锚点 | 可选 `#heading-slug`，与页内 slug 一致 |

## 6. 组件清单

### 6.1 T2 Block

| ID | 名称 | duty | handlesStates |
|----|------|------|---------------|
| `C:MARKDOWN-BODY` | MarkdownBody | 将编译结果渲染为可访问 DOM/组件树 | loading, error, ready |
| `C:DOC-TOC` | DocToc | 展示当前文目录；滚动 spy 与锚点跳转 | ready, empty |
| `C:DOC-ADMONITION` | DocAdmonition | 渲染 tip/warning/info 等语义块 | ready |
| `C:DOC-CODE-BLOCK` | DocCodeBlock | 高亮、复制、行号、语言标签 | ready |
| `C:DOC-GLOSSARY-TERM` | DocGlossaryTerm | 术语标记 + 浮层释义 | ready |
| `C:DOC-CROSS-PREVIEW` | DocCrossPreview | 悬停/聚焦时展示目标页摘要卡片 | loading, ready, error |
| `C:DOC-READING-PREFS` | DocReadingPrefs | 字号、行宽、行高、主题微调 | ready |

### 6.2 T3 Shell

| ID | 名称 | dispatchRole | duty |
|----|------|--------------|------|
| `C:DOC-READER-SHELL` | DocReaderShell | focus-host | 单页阅读：正文 + 可选 TOC + 阅读偏好 |
| `C:DOC-WIKI-SHELL` | DocWikiShell | focus-host | 多文档 Wiki：nav + 正文区 + 检索入口 + 面包屑 |
| `C:DOC-EDITOR-SHELL` | DocEditorShell | focus-host | 所见即所得/源码/分屏三模式编辑；元数据经 Drawer 收束 |

`DocWikiShell` composes（registry 目标态）：

```yaml
composes:
  - C:DOC-READER-SHELL
  - C:DOC-TOC
  - C:DOC-READING-PREFS
  - Tree                    # 侧栏 nav，复用 @ocpui/vue
  - GlobalSearch            # 检索面壳，见 §9
slots: [nav-header, nav-footer, article-footer, chrome-actions]
handlesStates: [loading, error, empty, ready]
feedbackChannel: action
presentationMode: read
```

### 6.3 组合模式

| ID | 场景 |
|----|------|
| `K:DOC-WIKI-PAGE` | DocWikiShell + 应用注入 collection |
| `K:DOC-READ-ONLY-PAGE` | DocReaderShell + 单 DocSource |
| `K:DOC-EDIT-PAGE` | DocEditorShell + 保存 action（T4 接 API） |

## 7. 容器链与阅读场景调度

### 7.1 presentationMode: read

在 `UiScenarioScope` 扩展枚举值 **`read`**（与 admin 四模式正交）：

| 属性 | read 模式策略 |
|------|--------------|
| 信息密度 | 以可读性优先；默认宽行宽 ~72ch，可用户微调 |
| 焦点 | 正文 focus-host；侧栏/TOC 为 chrome，不抢键盘焦点 |
| 动效 | 页内锚点 scroll：`purpose: explain_focus`, tier: micro |
| 系统事件 | 索引后台重建 → systemChannel notify，不打断阅读 |

挂载示例：

```
UiRoot
 └─ UiScenarioScope (surface: editorial, presentationMode: read)
     └─ DocWikiShell (T3, focus-host)
         ├─ #chrome-host → DocToolbar / 检索触发
         ├─ #nav → Tree
         └─ #body → MarkdownBody + DocToc
```

### 7.2 dispatchRole 分配

| 区域 | dispatchRole |
|------|--------------|
| 侧栏 nav | chrome-host |
| 正文 + 页内 TOC | focus-host（DocReaderShell Body） |
| 跨页预览卡 / 名词浮层 | overlay-host；`focusPolicy: restore-trigger` |
| 检索全屏面 | overlay-host；CommandPalette 式快捷键 |

## 8. 交互网络（阅读专用）

### 8.1 通道映射

| 场景 | 通道 | UI |
|------|------|-----|
| 保存编辑、确认覆盖 | action | ConfirmDialog + inline 校验 |
| 死链、编译错误 | action | 编辑区 gutter + 跳转行 |
| 索引重建完成 | system | notify，不 modal |
| 后台文档被他人更新 | system | 正文顶栏 subtle banner +「刷新」 |
| 检索无结果 | action | 检索面内 Empty，非 toast |

### 8.2 创新交互（最短路径）

以下 **SHOULD** 首版实现，形式不限于传统「搜索框 → 列表」：

| 能力 | 行为 | 组件 |
|------|------|------|
| **跨文件速览** | 内链 hover / `Alt+hover` 展示 `DocCrossPreview`；Enter 打开，Esc 关闭 | C:DOC-CROSS-PREVIEW |
| **名词解释** | 文内术语标记悬停浮层；集合级 glossary 合并 frontmatter | C:DOC-GLOSSARY-TERM |
| **快速检索** | `Ctrl+K` 打开 `DocSearchSurface`：混合 heading / 正文 / 术语 / 路径；选中即跳转并高亮片段 | 扩展 GlobalSearch / CommandPalette |
| **阅读位置恢复** | 离开再返回：恢复 scroll + 侧栏展开路径（应用 persist 或 sessionStorage） | Shell prop `preserveReadingPosition` |
| **并行参照** | 可选 Split：左文右文（对照手册）；复用 `Split` | DocWikiShell slot |

禁止：检索结果仅 toast；系统推送用 dialog 打断阅读。

## 9. 检索系统

### 9.1 索引构建

- **SSG 构建时**：`@ocpui/docgen` 生成 `search-index.json`（flexsearch / minisearch / 或 lunr — 择一固定，首版推荐 **minisearch**）
- **运行时 Wiki**：同源 API 提供 index blob；`DocWikiShell` 懒加载

索引字段（包括但不限于）：

| 字段 | 权重 |
|------|------|
| title | 高 |
| headings | 高 |
| body plain text | 中 |
| glossary terms | 中 |
| path / tags | 低 |

### 9.2 DocSearchSurface

- **MUST** 支持键盘导航、分类 tab（页面 / 标题 / 术语）
- **SHOULD** 展示上下文 snippet + 跳转后 scroll 到匹配段（`mark` 高亮，可配置自动淡出）
- 与 `GlobalSearch`（`@ocpui/vue`）关系：复用 overlay 与快捷键壳；**替换**结果渲染为文档专用行项，registry `composes: [GlobalSearch]` 或抽 `C:SEARCH-SURFACE` 基座（实施时二选一，见 §15）

## 10. 静态站点生成器 `@ocpui/docgen`

### 10.1 CLI

```bash
ocp-doc dev          # 开发服务器，HMR
ocp-doc build        # 静态输出 dist/
ocp-doc preview      # 预览 build
ocp-doc index        # 仅重建检索索引
ocp-doc linkcheck    # 死链报告
```

### 10.2 配置 `ocp-doc.config.ts`

```typescript
export default defineDocgenConfig({
  collections: [{ id: 'default', src: './docs', base: '/' }],
  markdown: { plugins: ['gfm', 'admonition', 'glossary', 'cross-doc'] },
  theme: '@ocpui/vue-docs/theme-default',
  search: { provider: 'minisearch' },
  vite: { /* 透传 */ },
})
```

### 10.3 输出

- HTML + 资产：与 VitePress 类似，支持 base path
- `doc-manifest.json` + `search-index.json`
- 可选 SSR 片段供嵌入 admin iframe

### 10.4 与 `@ocpui/docs` 关系（已确认：D8 收敛）

| 阶段 | 说明 |
|------|------|
| **D8 收敛后** | `@ocpui/docs` 已迁移至 `@ocpui/docgen` + `vue-docs` theme；VitePress 已移除 ✅ |

## 11. 编辑能力 `DocEditorShell`

### 11.1 编辑器视图

`DocEditorShell`（T3，focus-host）提供 **三模式**，由 chrome 工具栏 `SegmentedControl` 切换：

| 模式 | 载体 | 布局 |
|------|------|------|
| 所见即所得 | `DocVisualEditor`（Milkdown Crepe） | 单栏，行宽对齐 `--doc-measure`，正文为唯一焦点 |
| 源码 | `DocMarkdownEditor`（CodeMirror 6，整份正文） | 单栏 |
| 分屏 | `DocMarkdownEditor` + `MarkdownBody` 实时预览 | 左编辑 / 右预览（≥1024px） |

- **默认模式按正文推断**：含 `:::` 容器（admonition / demo）等块级扩展语法时默认源码（Crepe 不呈现扩展语法），否则默认所见即所得；可由 `defaultMode` 显式覆盖
- **扩展语法兜底**：可视化解析失败（`DocVisualEditor` error）自动回退源码模式（见 §11.2）
- **元数据（frontmatter）与正文分离**：`DocFrontmatterPanel` 默认不渲染，经 chrome「元数据」入口在右侧 `Drawer`（overlay-host）展开；面板内保留结构化表单 + Raw 切换。Drawer 为 Teleport 浮层，不挤占、不干扰正文焦点
- 编辑器只读写**正文**（`splitFrontmatter`/`stringifyFrontmatter` 维护边界）；frontmatter 改动仅经 Drawer 面板，避免元信息混入编辑视图

> 块级所见即所得（按 `prose`/`admonition`/`demo` 切分逐块编辑）为后续扩展方向；切分/序列化工具 `splitDocBlocks` / `serializeDocBlocks`（`@ocpui/markdown-core`）已就位，但首版不提供块编辑壳。

### 11.2 状态

| 状态 | 表达 |
|------|------|
| 未保存 | chrome 保存按钮 + 标题旁标记 |
| 编译错误 | action：gutter 标记 + 预览区 ErrorStateBlock |
| 保存中 | action：按钮 submitting |
| 冲突（revision） | action：ConfirmDialog 三向（覆盖 / 合并 / 取消） |
| 可视化解析失败 | 自动回退源码模式 |
| 保存成功 / 失败 | Shell 内 `toast.success` / `toast.error`（不由站点分散实现） |

保存 API **由 T4 注入** `saveRequest`，Shell 不内置 fetch。

### 11.3 开发态正文刷新（防漂移）

| 入口 | 职责 |
|------|------|
| `refreshDocgenRuntime`（`@ocpui/docgen`） | 写盘后重建 payload、失效 `virtual:ocp-docgen`、推送 HMR |
| `GET /__ocp-doc/api/runtime` | 全页刷新权威源（serve 态按磁盘重建，禁止依赖 virtual 嵌死的旧 JSON） |
| `useDocWiki.applySavedSource` | 会话内乐观覆盖，退出编辑立即可见 |

自建写盘/主题不得旁路上述入口。

## 12. 样式与阅读体验

### 12.1 Theme 扩展

在 `@ocpui/vue-docs` 上提供 **阅读 token**（`styles/doc-reading.css`；正文排版真源为 `styles/doc-prose.css`，阅读与所见即所得共用）：

| Token | 用途 |
|-------|------|
| `--doc-measure` | 正文行宽 |
| `--doc-font-size` | 正文字号阶梯 |
| `--doc-leading` | 行高 |
| `--doc-heading-scale` | 标题递进 |
| `--doc-code-bg` | 代码块背景 |
| `--doc-aside-width` | TOC / 侧栏宽 |

正文标题色为 `--text`。标题锚点为 append（右侧 `#`），由 `markdown-core` slug 插件与阅读 CSS 契约对齐。

`DocReadingPrefs` 写入 `data-doc-*` 或 CSS 变量，持久化到 `localStorage`（键：`ocp-doc-prefs`）。

### 12.2 排版要求

- 正文：标题层级不可跳级（lint 规则可选）
- 表格：小屏横向滚动，不压扁字号
- 图片：`loading=lazy`；可选 zoom（overlay-host）
- 打印：`@media print` 隐藏 nav / 检索

### 12.3 无障碍

- 锚点链接可见 focus
- TOC：`aria-current="location"`
- 检索：listbox + aria-activedescendant
- `prefers-reduced-motion`：锚点滚动 instant

## 13. 动效（阅读场景）

| 场景 | motion 四元组 |
|------|--------------|
| 侧栏 nav 展开 | trigger: expand_panel, purpose: explain_spatial_origin, tier: light |
| 页内 TOC spy 指示条 | trigger: focus_transfer, purpose: explain_focus, tier: micro |
| 跨页预览卡 | trigger: overlay_open, purpose: explain_spatial_origin, tier: light, mustNot: [steal_focus] |
| 检索面打开 | trigger: overlay_open, purpose: explain_focus, tier: light |
| 文档切换 | trigger: user_select, purpose: explain_state, tier: light, mustNot: [reorder_selection] |
| 元数据 Drawer | trigger: overlay_open, purpose: explain_spatial_origin, tier: light, mustNot: [steal_focus] |

## 14. Registry 与 CI

- 新组件 **MUST** 在 `core/vue-docs/registry/` 登记 v2 frontmatter
- animation/overlay 类 **MUST** 填 `motion`
- T2+ **MUST** `handlesStates`；T3 **MUST** `dispatchRole`
- CI 扩展：
  - `check-doc-compile`：fixture MD 可编译
  - `check-doc-sanitize`：XSS fixture 不通过
  - snapshot：TOC / admonition 结构

## 15. 实施阶段

| 阶段 | 内容 | 产出 |
|------|------|------|
| **D0** | 本文档 + index 导航 | spec 就绪 ✅ |
| **D1** | `@ocpui/markdown-core` + 内置插件 gfm/slug/admonition | compile API ✅ |
| **D2** | T2：MarkdownBody, DocToc, DocAdmonition, DocCodeBlock | vue-docs 包 ✅ |
| **D3** | T3：DocReaderShell, DocReadingPrefs | playground 阅读 demo ✅ |
| **D4** | 检索索引 + DocSearchSurface | minisearch + GlobalSearch 集成 ✅ |
| **D5** | DocWikiShell + manifest | 多文档 demo ✅ |
| **D6** | `@ocpui/docgen` build/dev | 静态站对标 VitePress 核心路径 ✅ |
| **D7** | DocEditorShell + glossary/cross-preview | 编辑 + 创新交互 ✅ |
| **D8** | registry + CI + `@ocpui/docs` 收敛至 docgen | stable + VitePress 下线 ✅ |

## 16. 决策追溯

| 决策 | 依据 | 表现 |
|------|------|------|
| unified 栈 | 主流、可插拔、SSG/运行时共用 | §4.1 |
| 三 package 拆分 | 解析无 Vue 依赖；SSG 可 Node 跑 | §3 |
| 不对标 WYSIWYG | 需求明确 MD；降低与解析器分歧 | §11 |
| read presentationMode | 阅读与 admin 密度策略冲突 | §7.1 |
| minisearch 首版 | 浏览器 + Node 同库，体积可控 | §9.1 |
| GlobalSearch 复用壳 | 已有 overlay/快捷键/通道 | §9.2 |
| T4 存 API | G:T4-BOUNDARY | §3, §11.2 |
| D8 收敛 VitePress | 避免双 SSG 维护 | §10.4, D8 |
| 首版不含 Mermaid | 控制范围与构建体积 | §4.2 内置插件表 |
| 跨集合 `collection:path` | 显式、可机读、可 linkcheck | §5.3 |
| 检索库 minisearch | 浏览器 + Node 同库 | §9.1 |

## 17. 已确认决策（2026-09-07）

| 项 | 结论 |
|----|------|
| SSG 与 VitePress | **D8 收敛**至 docgen，不长期并存 |
| Mermaid | **首版不内置**；后续若需以独立插件扩展 |
| 跨集合链接 | **`collection:path`** 为规范语法 |
| 检索库 | **minisearch**（索引格式版本化，可换 lunr） |
