import { visit } from 'unist-util-visit';
import type { Root as HastRoot, Element } from 'hast';
import type { OcpMarkdownPlugin } from '../types.js';

const GLOSSARY_LINK_PREFIX = '#doc-glossary:';

/** 将 [[term]] 转为可解析的 glossary 链接 */
export function normalizeGlossarySyntax(body: string): string {
  return body.replace(/\[\[([^\]\n]+)\]\]/g, (_match, term: string) => {
    const normalized = term.trim();
    if (!normalized) {
      return _match;
    }
    return `[${normalized}](${GLOSSARY_LINK_PREFIX}${encodeURIComponent(normalized)})`;
  });
}

/** 将 glossary 链接转为 span[data-doc-glossary-term] */
function rehypeGlossaryTerms() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') {
        return;
      }
      const href = String(node.properties?.href ?? '');
      if (!href.startsWith(GLOSSARY_LINK_PREFIX)) {
        return;
      }
      const term = decodeURIComponent(href.slice(GLOSSARY_LINK_PREFIX.length));
      node.tagName = 'span';
      node.properties = {
        className: ['doc-glossary-term'],
        dataDocGlossaryTerm: term,
      };
    });
  };
}

export const glossaryPlugin: OcpMarkdownPlugin = {
  id: 'glossary',
  preprocess: normalizeGlossarySyntax,
  rehypePlugins: [rehypeGlossaryTerms],
};
