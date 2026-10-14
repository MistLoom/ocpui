import type { Plugin } from 'vite';
import {
  compile,
  resolvePrecompilePluginList,
  type DocCollection,
} from '../../../../tool/markdown-core/src/index';
import { PLAYGROUND_DOC_COLLECTION } from '../mock/doc-wiki-collection.js';

const VIRTUAL_ID = 'virtual:playground-doc-collection';
const RESOLVED_ID = '\0virtual:playground-doc-collection';

const PRECOMPILE_PLUGINS = resolvePrecompilePluginList([
  'gfm',
  'slug',
  'admonition',
  'infer-fence-lang',
  'shiki',
  'code-meta',
  'doc-code-block',
  'glossary',
  'cross-doc',
]);

async function enrichCollection(collection: DocCollection): Promise<DocCollection> {
  const sources = await Promise.all(
    collection.sources.map(async (source) => {
      if (source.compiledHtml?.trim()) {
        return source;
      }
      const markdown = source.content ?? source.body ?? '';
      if (!markdown.trim()) {
        return source;
      }
      const result = await compile(markdown, { plugins: PRECOMPILE_PLUGINS });
      return {
        ...source,
        compiledHtml: result.html,
        compiledHeadings: result.headings,
      };
    }),
  );
  return { ...collection, sources };
}

/** Playground 文档集 Node 侧预编译（shiki 高亮） */
export function playgroundDocPrecompilePlugin(): Plugin {
  let enrichedPromise = enrichCollection(PLAYGROUND_DOC_COLLECTION);

  return {
    name: 'playground-doc-precompile',
    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_ID;
      }
    },
    async load(id) {
      if (id !== RESOLVED_ID) {
        return;
      }
      const collection = await enrichedPromise;
      return `export const PLAYGROUND_DOC_COLLECTION = ${JSON.stringify(collection)};`;
    },
    configureServer(server) {
      const rebuild = () => {
        enrichedPromise = enrichCollection(PLAYGROUND_DOC_COLLECTION);
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
        }
      };
      server.watcher.on('change', (file) => {
        if (file.includes('doc-wiki-collection') || file.includes('doc-reader-sample') || file.includes('doc-api-sample')) {
          rebuild();
        }
      });
    },
  };
}
