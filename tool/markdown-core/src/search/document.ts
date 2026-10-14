import { splitFrontmatter, compile } from '../compile.js';
import { extractPlainText } from './plain-text.js';
import type { DocSearchDocument } from './types.js';

/** 从 Markdown 源构建检索文档 */
export async function buildSearchDocumentFromMarkdown(
  docId: string,
  path: string,
  source: string,
): Promise<DocSearchDocument> {
  const { frontmatter, body } = splitFrontmatter(source);
  const compiled = await compile(source, { autolinkHeadings: true });
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    compiled.headings.find((item) => item.depth === 1)?.text ||
    docId;

  return {
    id: docId,
    docId,
    path,
    title,
    headings: compiled.headings
      .filter((item) => item.depth >= 2)
      .map((item) => ({ id: item.id, text: item.text })),
    body: extractPlainText(body),
    glossary:
      frontmatter.glossary && typeof frontmatter.glossary === 'object'
        ? (frontmatter.glossary as Record<string, string>)
        : undefined,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : undefined,
  };
}
