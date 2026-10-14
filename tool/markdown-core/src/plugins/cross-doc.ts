import { visit } from 'unist-util-visit';
import type { Root as HastRoot, Element } from 'hast';
import type { OcpMarkdownPlugin } from '../types.js';

const COLLECTION_LINK_RE = /^[^:#\s]+:[^#\s]+(?:#[\w-]+)?$/;
const MARKDOWN_LINK_RE = /\.md(?:#[\w-]+)?$/i;

function isCrossDocHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')) {
    return false;
  }
  if (trimmed.startsWith('#')) {
    return false;
  }
  return COLLECTION_LINK_RE.test(trimmed) || MARKDOWN_LINK_RE.test(trimmed);
}

/** 为跨文档链接附加 data-doc-cross-href */
function rehypeCrossDocLinks() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') {
        return;
      }
      const href = String(node.properties?.href ?? '');
      if (!isCrossDocHref(href)) {
        return;
      }
      const classNames = Array.isArray(node.properties?.className)
        ? [...node.properties.className]
        : node.properties?.className
          ? [String(node.properties.className)]
          : [];
      classNames.push('doc-cross-link');
      node.properties = {
        ...node.properties,
        className: classNames,
        dataDocCrossHref: href,
        dataDocCrossLink: '',
      };
    });
  };
}

export const crossDocPlugin: OcpMarkdownPlugin = {
  id: 'cross-doc',
  rehypePlugins: [rehypeCrossDocLinks],
};

export { isCrossDocHref };
