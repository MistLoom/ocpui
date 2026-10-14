import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString } from 'mdast-util-to-string';
import type { Root as MdastRoot } from 'mdast';

/** 从 Markdown 正文提取纯文本（供检索索引） */
export function extractPlainText(markdown: string): string {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as MdastRoot;
  return toString(tree).replace(/\s+/g, ' ').trim();
}
