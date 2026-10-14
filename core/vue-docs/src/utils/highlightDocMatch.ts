const MARK_CLASS = 'doc-search-mark';
const MARK_ATTR = 'data-doc-search-mark';

/** 清除正文内检索高亮 */
export function clearDocSearchMarks(container: HTMLElement | null | undefined): void {
  if (!container) {
    return;
  }
  container.querySelectorAll(`mark.${MARK_CLASS}, mark[${MARK_ATTR}]`).forEach((node) => {
    const parent = node.parentNode;
    if (!parent) {
      return;
    }
    parent.replaceChild(document.createTextNode(node.textContent ?? ''), node);
    parent.normalize();
  });
}

/** 滚动到锚点并在正文内高亮匹配词 */
export function applyDocSearchNavigation(
  container: HTMLElement | null | undefined,
  options: {
    anchorId?: string;
    query?: string;
    fadeMs?: number;
  },
): void {
  if (!container) {
    return;
  }

  clearDocSearchMarks(container);

  if (options.anchorId) {
    const heading = container.querySelector(`#${CSS.escape(options.anchorId)}`);
    heading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const query = options.query?.trim();
  if (!query || query.length < 2) {
    return;
  }

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const lowerQuery = query.toLowerCase();
  let node: Text | null = walker.nextNode() as Text | null;

  while (node) {
    const text = node.textContent ?? '';
    const index = text.toLowerCase().indexOf(lowerQuery);
    if (index >= 0) {
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + query.length);
      const mark = document.createElement('mark');
      mark.className = MARK_CLASS;
      mark.setAttribute(MARK_ATTR, 'true');
      range.surroundContents(mark);
      if (!options.anchorId) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const fadeMs = options.fadeMs ?? 2400;
      if (fadeMs > 0) {
        window.setTimeout(() => {
          mark.classList.add(`${MARK_CLASS}--fade`);
          window.setTimeout(() => {
            const parent = mark.parentNode;
            if (parent) {
              parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark);
              parent.normalize();
            }
          }, 400);
        }, fadeMs);
      }
      break;
    }
    node = walker.nextNode() as Text | null;
  }
}
