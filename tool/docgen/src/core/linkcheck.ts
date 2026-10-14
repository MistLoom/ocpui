import {
  compile,
  findSourceByPath,
  getSourceMarkdown,
  parseCollectionLink,
  resolveMarkdownHref,
  type DocCollection,
  type DocSource,
} from '@ocpui/markdown-core';

export interface LinkcheckIssue {
  collectionId: string;
  sourcePath: string;
  href: string;
  message: string;
  line?: number;
}

export interface LinkcheckReport {
  checked: number;
  errors: LinkcheckIssue[];
}

const MARKDOWN_LINK_RE = /!?\[[^\]]*\]\(([^)#\s]+)(?:#[\w-]+)?\)/g;

/** 移除代码块与行内代码，避免示例链接误报 */
export function stripCodeFromMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]+`/g, '');
}

function lineNumberAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function findCollection(collections: DocCollection[], collectionId: string): DocCollection | undefined {
  return collections.find((item) => item.id === collectionId);
}

function routeExists(collection: DocCollection, docPath: string): boolean {
  const normalized = docPath.replace(/^\//, '').replace(/\.md$/i, '');
  return Boolean(
    findSourceByPath(collection, `${normalized}.md`) ||
      findSourceByPath(collection, normalized) ||
      collection.sources.some((source: DocSource) => source.path.replace(/\.md$/i, '') === normalized),
  );
}

/** 扫描 Markdown 链接并报告死链 */
export async function runLinkcheck(collections: DocCollection[]): Promise<LinkcheckReport> {
  const errors: LinkcheckIssue[] = [];
  let checked = 0;

  for (const collection of collections) {
    for (const source of collection.sources) {
      if (source.frontmatter.draft) {
        continue;
      }
      const markdown = getSourceMarkdown(source);
      const prose = stripCodeFromMarkdown(markdown);
      const compiled = await compile(markdown, { autolinkHeadings: true });
      const headingIds = new Set(compiled.headings.map((item: { id: string }) => item.id));

      for (const match of prose.matchAll(MARKDOWN_LINK_RE)) {
        const href = match[1]?.trim();
        if (!href) {
          continue;
        }
        checked += 1;
        const line = lineNumberAt(markdown, match.index ?? 0);
        const issueBase = {
          collectionId: collection.id,
          sourcePath: source.path,
          href,
          line,
        };

        if (href.startsWith('#')) {
          const anchor = href.slice(1);
          if (anchor && !headingIds.has(anchor)) {
            errors.push({ ...issueBase, message: `锚点不存在: #${anchor}` });
          }
          continue;
        }

        const collectionLink = parseCollectionLink(href);
        if (collectionLink) {
          const targetCollection = findCollection(collections, collectionLink.collectionId);
          if (!targetCollection) {
            errors.push({ ...issueBase, message: `集合不存在: ${collectionLink.collectionId}` });
            continue;
          }
          if (!routeExists(targetCollection, collectionLink.path)) {
            errors.push({ ...issueBase, message: `跨集合路径不存在: ${collectionLink.path}` });
          }
          continue;
        }

        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
          continue;
        }

        const resolved = resolveMarkdownHref(source.path, href);
        if (!routeExists(collection, resolved)) {
          errors.push({ ...issueBase, message: `内部路径不存在: ${resolved}` });
        }
      }
    }
  }

  return { checked, errors };
}

/** 格式化 linkcheck 输出 */
export function formatLinkcheckReport(report: LinkcheckReport): string {
  if (!report.errors.length) {
    return `[ocp-doc] linkcheck 通过（${report.checked} 个链接）`;
  }
  const lines = report.errors.map(
    (item) =>
      `  ${item.collectionId}:${item.sourcePath}${item.line ? `:${item.line}` : ''} → ${item.href} (${item.message})`,
  );
  return `[ocp-doc] linkcheck 发现 ${report.errors.length} 个问题（共检查 ${report.checked} 个链接）\n${lines.join('\n')}`;
}
