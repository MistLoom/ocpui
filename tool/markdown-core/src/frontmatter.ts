import { parse, stringify } from 'yaml';
import type { DocFrontmatter } from './types.js';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 解析 frontmatter 与正文（浏览器 / Node 通用，不依赖 Buffer） */
export function splitFrontmatter(source: string): { frontmatter: DocFrontmatter; body: string } {
  const match = source.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: {}, body: source };
  }

  const [, yamlBlock, body] = match;
  if (!yamlBlock.trim()) {
    return { frontmatter: {}, body };
  }

  try {
    const parsed = parse(yamlBlock);
    return {
      frontmatter: (isPlainObject(parsed) ? parsed : {}) as DocFrontmatter,
      body,
    };
  } catch {
    return { frontmatter: {}, body };
  }
}

function compactFrontmatter(frontmatter: DocFrontmatter): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(frontmatter).filter(([, value]) => value !== undefined),
  );
}

/** 将 frontmatter 与正文合并为 Markdown 源 */
export function stringifyFrontmatter(body: string, frontmatter: DocFrontmatter): string {
  const data = compactFrontmatter(frontmatter);
  if (Object.keys(data).length === 0) {
    return body;
  }

  const yamlBlock = stringify(data, { lineWidth: 0 }).trimEnd();
  if (!body) {
    return `---\n${yamlBlock}\n---\n`;
  }

  const normalizedBody = body.startsWith('\n') ? body : `\n${body}`;
  return `---\n${yamlBlock}\n---${normalizedBody}`;
}

/** 仅输出 frontmatter YAML 块（不含 --- 分隔符） */
export function formatFrontmatterYaml(frontmatter: DocFrontmatter): string {
  const data = compactFrontmatter(frontmatter);
  if (Object.keys(data).length === 0) {
    return '';
  }
  return stringify(data, { lineWidth: 0 }).trimEnd();
}
