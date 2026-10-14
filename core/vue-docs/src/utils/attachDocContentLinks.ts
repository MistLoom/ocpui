import type { DocCollection } from '@ocpui/markdown-core';
import { resolveDocLinkTarget } from '@ocpui/markdown-core';

export interface DocContentLinkOptions {
  collection: DocCollection;
  sourcePath: string;
  onNavigate: (sourceId: string, anchor?: string) => void;
}

/** 拦截正文内文档链接点击（含 .md / 相对路径 / collection:path） */
export function attachDocContentLinks(
  root: HTMLElement,
  options: DocContentLinkOptions,
): () => void {
  function handleClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const anchorEl = (event.target as HTMLElement | null)?.closest('a');
    if (!anchorEl || !root.contains(anchorEl)) {
      return;
    }

    const href = anchorEl.getAttribute('href');
    if (!href) {
      return;
    }

    const target = resolveDocLinkTarget(options.collection, options.sourcePath, href);
    if (!target) {
      return;
    }

    event.preventDefault();
    options.onNavigate(target.sourceId, target.anchor);
  }

  root.addEventListener('click', handleClick);
  return () => root.removeEventListener('click', handleClick);
}
