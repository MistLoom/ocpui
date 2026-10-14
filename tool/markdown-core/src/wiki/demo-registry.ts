import { extractVueDemoSource, demoIdFromSource } from '../plugins/demo.js';
import { getSourceMarkdown } from './manifest.js';
import type { DocCollection } from './types.js';

export interface DocDemoEntry {
  id: string;
  source: string;
  docPath: string;
}

/** 扫描文档集，收集全部 inline vue demo */
export function collectDemoRegistry(collections: DocCollection[]): Record<string, DocDemoEntry> {
  const registry: Record<string, DocDemoEntry> = {};

  for (const collection of collections) {
    for (const docSource of collection.sources) {
      const markdown = getSourceMarkdown(docSource);
      for (const vueSource of extractVueDemoSource(markdown)) {
        const id = demoIdFromSource(vueSource);
        registry[id] = {
          id,
          source: vueSource,
          docPath: docSource.path,
        };
      }
    }
  }

  return registry;
}
