import fs from 'node:fs';
import path from 'node:path';
import {
  buildManifestFromCollection,
  buildSearchDocumentFromMarkdown,
  collectDemoRegistry,
  compile,
  createDocSearchEngine,
  getSourceMarkdown,
  inferFenceLanguage,
  isSyntaxHighlightedHtml,
  resolvePrecompilePluginList,
  type DocCollection,
  type DocDemoEntry,
  type DocManifest,
  type DocSearchIndexPayload,
  type DocSource,
} from '@ocpui/markdown-core';
import type { ResolvedDocgenConfig } from '../config.js';
import { collectAllCollections } from './collect-collection.js';

export interface DocgenRuntimePayload {
  collections: DocCollection[];
  manifests: DocManifest[];
  markdownPlugins: ResolvedDocgenConfig['markdownPlugins'];
  searchIndexes: DocSearchIndexPayload[];
  demoRegistry: Record<string, DocDemoEntry>;
  /** 开发态是否启用源码编辑 */
  editEnabled?: boolean;
}

/** 为 collection 内各 source 预编译 HTML（Node 侧 shiki） */
async function enrichCollectionCompiledHtml(
  collection: DocCollection,
  markdownPlugins: ResolvedDocgenConfig['markdownPlugins'],
): Promise<DocCollection> {
  const sources = await Promise.all(
    collection.sources.map(async (source) => {
      if (source.compiledHtml?.trim()) {
        return source;
      }
      const markdown = getSourceMarkdown(source);
      if (!markdown.trim()) {
        return source;
      }
      try {
        const compilePlugins = resolvePrecompilePluginList(markdownPlugins);
        const result = await compile(markdown, { plugins: compilePlugins });
        const usesShiki = markdownPlugins.includes('shiki');
        if (usesShiki) {
          const needsHighlight = [...markdown.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)].some((match) => {
            const rawLang = match[1]?.trim().split(/\s+/)[0] ?? '';
            if (rawLang) {
              return true;
            }
            return Boolean(inferFenceLanguage(match[2] ?? ''));
          });
          if (needsHighlight && !isSyntaxHighlightedHtml(result.html)) {
            console.warn(`[ocp-doc] 预编译未产生语法高亮: ${source.path}`);
          }
        }
        return {
          ...source,
          compiledHtml: result.html,
          compiledHeadings: result.headings,
        } satisfies DocSource;
      } catch (cause) {
        console.warn(`[ocp-doc] 预编译失败: ${source.path}`, cause);
        return source;
      }
    }),
  );
  return { ...collection, sources };
}

/** 构建检索索引 */
export async function buildSearchIndexPayload(collections: DocCollection[]): Promise<DocSearchIndexPayload> {
  const documents = await Promise.all(
    collections.flatMap((collection) =>
      collection.sources
        .filter((source: DocSource) => !source.frontmatter.draft)
        .map((source: DocSource) =>
          buildSearchDocumentFromMarkdown(source.id, source.path, getSourceMarkdown(source)),
        ),
    ),
  );
  return createDocSearchEngine(documents).toPayload();
}

/** 构建 dev/build 运行时注入数据 */
export async function buildRuntimePayload(
  config: ResolvedDocgenConfig,
  collections?: DocCollection[],
  options?: { editEnabled?: boolean },
): Promise<DocgenRuntimePayload> {
  const resolvedCollections = collections ?? collectAllCollections(config);
  const compiledCollections = await Promise.all(
    resolvedCollections.map((collection) =>
      enrichCollectionCompiledHtml(collection, config.markdownPlugins),
    ),
  );
  const manifests = compiledCollections.map((collection) => buildManifestFromCollection(collection));
  const searchIndexes = await Promise.all(
    compiledCollections.map((collection) => buildSearchIndexPayload([collection])),
  );
  const demoRegistry = collectDemoRegistry(compiledCollections);
  return {
    collections: compiledCollections,
    manifests,
    markdownPlugins: config.markdownPlugins,
    searchIndexes,
    demoRegistry,
    editEnabled: options?.editEnabled ?? false,
  };
}

/** 写入 doc-manifest.json 与 search-index.json */
export async function writeBuildArtifacts(
  config: ResolvedDocgenConfig,
  outDir: string,
  collections?: DocCollection[],
): Promise<{ manifestPath: string; searchIndexPath: string }> {
  const resolvedCollections = collections ?? collectAllCollections(config);
  const payload = await buildRuntimePayload(config, resolvedCollections);
  const searchPayload = await buildSearchIndexPayload(resolvedCollections);

  fs.mkdirSync(outDir, { recursive: true });
  const assetsDir = path.join(outDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  const manifestPath = path.join(outDir, 'doc-manifest.json');
  const searchIndexPath = path.join(assetsDir, 'search-index.json');

  fs.writeFileSync(manifestPath, `${JSON.stringify(payload.manifests, null, 2)}\n`, 'utf8');
  fs.writeFileSync(searchIndexPath, `${JSON.stringify(searchPayload, null, 2)}\n`, 'utf8');

  return { manifestPath, searchIndexPath };
}
