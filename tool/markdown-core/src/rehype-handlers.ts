import type { ContainerDirective } from 'mdast-util-directive';
import type { Code } from 'mdast';
import type { Element, ElementContent, Properties } from 'hast';
import { toString } from 'mdast-util-to-string';
import { ADMONITION_TYPES } from './plugins/admonition.js';
import { demoIdFromSource } from './plugins/demo.js';

type RehypeHandlerState = {
  all: (node: ContainerDirective) => ElementContent[];
  patch: (from: ContainerDirective, to: Element) => void;
  applyData: (from: ContainerDirective, to: Element) => Element;
};

/** remark-rehype 自定义 handler：admonition 容器 → aside */
export function containerDirectiveHandler(
  state: RehypeHandlerState,
  node: ContainerDirective,
): Element {
  if (node.name === 'demo') {
    return renderDemoDirective(state, node);
  }

  if (!ADMONITION_TYPES.has(node.name)) {
    const fallback: Element = {
      type: 'element',
      tagName: 'div',
      properties: { className: [`directive-${node.name}`] },
      children: state.all(node),
    };
    state.patch(node, fallback);
    return state.applyData(node, fallback);
  }

  const type = node.name;
  const title = extractDirectiveTitle(node);
  const contentNodes = title ? node.children.slice(1) : node.children;
  const content = state.all({ ...node, children: contentNodes });

  const properties: Properties = {
    className: ['doc-admonition', `doc-admonition--${type}`],
    dataAdmonitionType: type,
  };
  if (title) {
    properties.dataAdmonitionTitle = title;
  }

  const children: ElementContent[] = [];
  if (title) {
    children.push({
      type: 'element',
      tagName: 'p',
      properties: { className: ['doc-admonition__title'] },
      children: [{ type: 'text', value: title }],
    });
  }

  children.push({
    type: 'element',
    tagName: 'div',
    properties: { className: ['doc-admonition__body'] },
    children: content,
  });

  const result: Element = {
    type: 'element',
    tagName: 'aside',
    properties,
    children,
  };
  state.patch(node, result);
  return state.applyData(node, result);
}

function extractDirectiveTitle(node: ContainerDirective): string | undefined {
  const first = node.children[0];
  if (first?.type === 'paragraph' && first.data?.directiveLabel) {
    const text = toString(first).trim();
    return text.length > 0 ? text : undefined;
  }
  return undefined;
}

/** demo 容器 → 可挂载预览占位 */
function renderDemoDirective(state: RehypeHandlerState, node: ContainerDirective): Element {
  const title = extractDirectiveTitle(node);
  const codeNode = node.children.find(
    (child): child is Code => child.type === 'code' && (child.lang === 'vue' || child.lang === 'html'),
  );
  const vueSource = codeNode?.value?.trim() ?? '';
  const demoId = demoIdFromSource(vueSource);

  const properties: Properties = {
    className: ['doc-demo'],
    dataDocDemoId: demoId,
  };
  if (title) {
    properties.dataDocDemoTitle = title;
  }

  const children: ElementContent[] = [
    {
      type: 'element',
      tagName: 'div',
      properties: { className: ['doc-demo__preview'] },
      children: [],
    },
    {
      type: 'element',
      tagName: 'details',
      properties: { className: ['doc-demo__source'] },
      children: [
        {
          type: 'element',
          tagName: 'summary',
          properties: { className: ['doc-demo__source-toggle'] },
          children: [{ type: 'text', value: '查看代码' }],
        },
        {
          type: 'element',
          tagName: 'pre',
          properties: {
            className: ['doc-code-block', 'language-vue'],
            dataLanguage: 'vue',
            dataDocCodeBlock: '',
          },
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-vue'] },
              children: [{ type: 'text', value: vueSource }],
            },
          ],
        },
      ],
    },
  ];

  const result: Element = {
    type: 'element',
    tagName: 'div',
    properties,
    children,
  };
  state.patch(node, result);
  return state.applyData(node, result);
}
