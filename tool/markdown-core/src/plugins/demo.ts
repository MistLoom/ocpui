import { visit } from 'unist-util-visit';
import type { Root as MdastRoot, Code } from 'mdast';
import type { OcpMarkdownPlugin } from '../types.js';

/** 从 demo 容器 directive 中提取 vue 源码 */
export function extractVueDemoSource(body: string): string[] {
  const sources: string[] = [];
  const blockPattern = /:::\s*demo[^\n]*\n([\s\S]*?)\n:::/g;
  let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(body)) !== null) {
    const inner = match[1] ?? '';
    const fenceMatch = inner.match(/```(?:vue|html)?[^\n]*\n([\s\S]*?)```/);
    if (fenceMatch?.[1]?.trim()) {
      sources.push(fenceMatch[1].trim());
    }
  }
  return sources;
}

/** 由 vue 源码生成稳定 demo id */
export function demoIdFromSource(vueSource: string): string {
  let hash = 5381;
  for (let index = 0; index < vueSource.length; index += 1) {
    hash = (hash * 33) ^ vueSource.charCodeAt(index);
  }
  return `demo-${(hash >>> 0).toString(36)}`;
}

/** 将 VitePress 风格 `::: demo` 转为 remark-directive 语法 */
export function normalizeDemoSyntax(body: string): string {
  return body.replace(/^:::\s*demo(?:[ \t]+([^\n]+))?[ \t]*$/gm, (_match, title?: string) => {
    if (title?.trim()) {
      return `:::demo[${title.trim()}]`;
    }
    return ':::demo';
  });
}

function remarkValidateDemoBlocks() {
  return (tree: MdastRoot) => {
    visit(tree, 'containerDirective', (node) => {
      if (node.name !== 'demo') {
        return;
      }
      const codeNode = node.children.find(
        (child): child is Code => child.type === 'code' && (child.lang === 'vue' || child.lang === 'html'),
      );
      if (!codeNode?.value?.trim()) {
        throw new Error('[markdown-core] demo 容器须包含 ```vue 代码块');
      }
    });
  };
}

export const demoPlugin: OcpMarkdownPlugin = {
  id: 'demo',
  preprocess: normalizeDemoSyntax,
  remarkPlugins: [remarkValidateDemoBlocks],
};
