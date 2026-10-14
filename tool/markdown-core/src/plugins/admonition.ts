import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import type { Root as MdastRoot } from 'mdast';
import type { OcpMarkdownPlugin } from '../types.js';

const ADMONITION_TYPES = new Set(['note', 'tip', 'info', 'warning', 'danger', 'caution']);

/**
 * 将 VitePress 风格 `::: tip [Title]` 转为 remark-directive 语法 `:::tip[Title]`
 */
export function normalizeAdmonitionSyntax(body: string): string {
  return body.replace(/^::: (\w+)(?:[ \t]+([^\n]+))?[ \t]*$/gm, (_match, type: string, title?: string) => {
    if (title?.trim()) {
      return `:::${type}[${title.trim()}]`;
    }
    return `:::${type}`;
  });
}

/** 校验 admonition 容器类型 */
function remarkValidateAdmonitionTypes() {
  return (tree: MdastRoot) => {
    visit(tree, 'containerDirective', (node) => {
      if (!ADMONITION_TYPES.has(node.name)) {
        return;
      }
    });
  };
}

/** admonition 容器 → 带 data 属性的 aside（rehype 阶段由 handler 渲染） */
export const admonitionPlugin: OcpMarkdownPlugin = {
  id: 'admonition',
  preprocess: normalizeAdmonitionSyntax,
  remarkPlugins: [remarkDirective, remarkValidateAdmonitionTypes],
};

export { ADMONITION_TYPES };
