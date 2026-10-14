import { visit } from 'unist-util-visit';
import type { Code, Root } from 'mdast';
import type { OcpMarkdownPlugin } from '../types.js';
import { inferFenceLanguage } from '../shiki/infer-fence-lang.js';

/** 为无 lang 的围栏推断 tree 等语言，供 shiki 高亮 */
function remarkInferFenceLang() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      if (node.lang?.trim()) {
        return;
      }
      const inferred = inferFenceLanguage(node.value);
      if (inferred) {
        node.lang = inferred;
      }
    });
  };
}

export const inferFenceLangPlugin: OcpMarkdownPlugin = {
  id: 'infer-fence-lang',
  remarkPlugins: [remarkInferFenceLang],
};

export { inferFenceLanguage } from '../shiki/infer-fence-lang.js';
