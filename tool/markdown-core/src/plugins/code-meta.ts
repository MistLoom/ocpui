import { visit } from 'unist-util-visit';
import type { Root as HastRoot, Element, Properties } from 'hast';
import type { OcpMarkdownPlugin } from '../types.js';

/** 为 pre/code 附加 DocCodeBlock 消费用 data 属性 */
function rehypeCodeMeta() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'pre') {
        return;
      }

      const codeEl = node.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
      );
      if (!codeEl) {
        return;
      }

      const className = propertiesClassName(codeEl.properties);
      const langMatch = className.find((c) => c.startsWith('language-'));
      const language = langMatch?.slice('language-'.length) ?? '';

      node.properties = {
        ...node.properties,
        dataDocCodeBlock: '',
        dataLanguage: language,
      };
      codeEl.properties = {
        ...codeEl.properties,
        dataLanguage: language,
      };
    });
  };
}

function propertiesClassName(properties: Properties | null | undefined): string[] {
  const value = properties?.className;
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

export const codeMetaPlugin: OcpMarkdownPlugin = {
  id: 'code-meta',
  rehypePlugins: [rehypeCodeMeta],
};
