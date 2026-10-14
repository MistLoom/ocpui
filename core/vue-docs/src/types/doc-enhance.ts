/** 跨文档预览解析结果 */
export interface DocCrossPreviewData {
  title: string;
  excerpt: string;
  path?: string;
}

export type DocCrossPreviewResolver = (href: string) => Promise<DocCrossPreviewData | null>;

/** 合并 frontmatter 与集合级 glossary */
export function mergeGlossaryMaps(
  ...maps: Array<Record<string, string> | undefined>
): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const map of maps) {
    if (!map) {
      continue;
    }
    for (const [term, definition] of Object.entries(map)) {
      if (term.trim() && definition.trim()) {
        merged[term.trim()] = definition.trim();
      }
    }
  }
  return merged;
}
