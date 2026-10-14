import { ADMONITION_TYPES } from '../plugins/admonition.js';

export type DocBlockKind = 'prose' | 'admonition' | 'demo' | 'raw';

export type DocAdmonitionType = 'note' | 'tip' | 'info' | 'warning' | 'danger' | 'caution';

export interface DocProseBlock {
  id: string;
  kind: 'prose';
  markdown: string;
}

export interface DocAdmonitionBlock {
  id: string;
  kind: 'admonition';
  type: DocAdmonitionType;
  title: string;
  body: string;
}

export interface DocDemoBlock {
  id: string;
  kind: 'demo';
  title: string;
  fenceLang: 'vue' | 'html';
  code: string;
}

export interface DocRawBlock {
  id: string;
  kind: 'raw';
  markdown: string;
}

export type DocBlock = DocProseBlock | DocAdmonitionBlock | DocDemoBlock | DocRawBlock;

const CONTAINER_OPEN_RE = /^:::\s*(\w+)(?:[ \t]+(.+))?[ \t]*$/;
const CONTAINER_CLOSE_RE = /^:::[ \t]*$/;

function createId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}

function pushProse(blocks: DocBlock[], buffer: string[], index: number) {
  const markdown = buffer.join('\n').replace(/^\n+/, '').replace(/\n+$/, '');
  buffer.length = 0;
  if (!markdown.trim()) {
    return;
  }
  blocks.push({
    id: createId('prose', index),
    kind: 'prose',
    markdown,
  });
}

function parseDemoInner(inner: string): Pick<DocDemoBlock, 'fenceLang' | 'code'> | null {
  const fenceMatch = inner.match(/```(vue|html)?[^\n]*\n([\s\S]*?)```/);
  if (!fenceMatch?.[2]?.trim()) {
    return null;
  }
  return {
    fenceLang: fenceMatch[1] === 'html' ? 'html' : 'vue',
    code: fenceMatch[2].replace(/\n$/, ''),
  };
}

/**
 * 将 Markdown 正文切为 prose / admonition / demo / raw 块（不处理 frontmatter）
 */
export function splitDocBlocks(body: string): DocBlock[] {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const blocks: DocBlock[] = [];
  const proseBuffer: string[] = [];
  let blockIndex = 0;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const open = line.match(CONTAINER_OPEN_RE);
    if (!open) {
      proseBuffer.push(line);
      i += 1;
      continue;
    }

    pushProse(blocks, proseBuffer, blockIndex);
    blockIndex += 1;

    const name = open[1] ?? '';
    const title = (open[2] ?? '').trim();
    const innerLines: string[] = [];
    i += 1;
    let closed = false;
    while (i < lines.length) {
      const current = lines[i] ?? '';
      if (CONTAINER_CLOSE_RE.test(current)) {
        closed = true;
        i += 1;
        break;
      }
      innerLines.push(current);
      i += 1;
    }

    const inner = innerLines.join('\n');
    if (!closed) {
      blocks.push({
        id: createId('raw', blockIndex),
        kind: 'raw',
        markdown: `${line}\n${inner}`.trimEnd(),
      });
      blockIndex += 1;
      continue;
    }

    if (name === 'demo') {
      const demo = parseDemoInner(inner);
      if (demo) {
        blocks.push({
          id: createId('demo', blockIndex),
          kind: 'demo',
          title,
          fenceLang: demo.fenceLang,
          code: demo.code,
        });
      } else {
        blocks.push({
          id: createId('raw', blockIndex),
          kind: 'raw',
          markdown: `::: demo${title ? ` ${title}` : ''}\n${inner}\n:::`,
        });
      }
      blockIndex += 1;
      continue;
    }

    if (ADMONITION_TYPES.has(name)) {
      blocks.push({
        id: createId('admonition', blockIndex),
        kind: 'admonition',
        type: name as DocAdmonitionType,
        title,
        body: inner.replace(/^\n+/, '').replace(/\n+$/, ''),
      });
      blockIndex += 1;
      continue;
    }

    blocks.push({
      id: createId('raw', blockIndex),
      kind: 'raw',
      markdown: `::: ${name}${title ? ` ${title}` : ''}\n${inner}\n:::`,
    });
    blockIndex += 1;
  }

  pushProse(blocks, proseBuffer, blockIndex);
  return blocks;
}

/** 将块序列还原为 Markdown 正文 */
export function serializeDocBlocks(blocks: DocBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.kind === 'prose') {
      if (block.markdown.trim()) {
        parts.push(block.markdown.trimEnd());
      }
      continue;
    }
    if (block.kind === 'admonition') {
      const head = block.title.trim()
        ? `::: ${block.type} ${block.title.trim()}`
        : `::: ${block.type}`;
      parts.push(`${head}\n${block.body.trimEnd()}\n:::`);
      continue;
    }
    if (block.kind === 'demo') {
      const head = block.title.trim() ? `::: demo ${block.title.trim()}` : '::: demo';
      parts.push(`${head}\n\`\`\`${block.fenceLang}\n${block.code.trimEnd()}\n\`\`\`\n:::`);
      continue;
    }
    if (block.markdown.trim()) {
      parts.push(block.markdown.trimEnd());
    }
  }
  return parts.join('\n\n').trimEnd() + (parts.length ? '\n' : '');
}
