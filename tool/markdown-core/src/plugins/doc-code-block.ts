import { visit } from 'unist-util-visit';
import type { Root as HastRoot, Element, ElementContent } from 'hast';
import type { OcpMarkdownPlugin } from '../types.js';

function readLanguage(codeEl: Element): string {
  const className = propertiesClassName(codeEl.properties);
  const fromClass = className.find((c) => c.startsWith('language-'));
  if (fromClass) {
    return fromClass.slice('language-'.length);
  }
  const fromData = codeEl.properties?.dataLanguage;
  if (typeof fromData === 'string') {
    return fromData;
  }
  return '';
}

function propertiesClassName(properties: Element['properties'] | undefined): string[] {
  const value = properties?.className;
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

function mergeClassName(existing: Element['properties'] | undefined, ...classes: string[]): string[] {
  const current = propertiesClassName(existing);
  return [...new Set([...current, ...classes].filter(Boolean))];
}

function isShikiHighlighted(codeEl: Element): boolean {
  function walk(node: Element): boolean {
    if (node.properties?.style) {
      return true;
    }
    for (const child of node.children) {
      if (child.type === 'element' && walk(child)) {
        return true;
      }
    }
    return false;
  }
  return walk(codeEl);
}

/** 规范化 pre/code 块结构，补全 doc-code-block meta；仅在高亮后保留 shiki class */
function rehypeDocCodeBlock() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (!parent || index == null) {
        return;
      }

      // 块级 code 缺少 pre 时补 wrapper
      if (node.tagName === 'code' && !(parent.type === 'element' && parent.tagName === 'pre')) {
        const language = readLanguage(node);
        const isBlockCandidate =
          language.length > 0
          || (typeof node.properties?.dataLanguage === 'string' && node.properties.dataLanguage.length > 0)
          || node.children.some((child) => child.type === 'text' && child.value.includes('\n'));

        if (!isBlockCandidate) {
          return;
        }

        const highlighted = isShikiHighlighted(node);
        const pre: Element = {
          type: 'element',
          tagName: 'pre',
          properties: {
            className: mergeClassName(undefined, 'doc-code-block', ...(highlighted ? ['shiki'] : [])),
            dataDocCodeBlock: '',
            dataLanguage: language,
          },
          children: [node as ElementContent],
        };
        node.properties = {
          ...node.properties,
          dataLanguage: language,
        };
        parent.children[index] = pre;
        return;
      }

      if (node.tagName !== 'pre') {
        return;
      }

      const codeEl = node.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
      );
      if (!codeEl) {
        return;
      }

      const language = readLanguage(codeEl)
        || (typeof node.properties?.dataLanguage === 'string' ? node.properties.dataLanguage : '');

      const highlighted = isShikiHighlighted(codeEl);
      node.properties = {
        ...node.properties,
        className: mergeClassName(node.properties, 'doc-code-block', ...(highlighted ? ['shiki'] : [])),
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

export const docCodeBlockPlugin: OcpMarkdownPlugin = {
  id: 'doc-code-block',
  rehypePlugins: [rehypeDocCodeBlock],
};
