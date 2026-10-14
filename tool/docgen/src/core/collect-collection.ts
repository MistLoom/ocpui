import fs from 'node:fs';
import path from 'node:path';
import { splitFrontmatter, type DocCollection, DocSource } from '@ocpui/markdown-core';
import type { DocgenCollectionConfig, ResolvedDocgenConfig } from '../config.js';
import { revisionFromContent } from './source-revision.js';

/** 递归收集目录下 .md 相对路径 */
export function listMarkdownFiles(dir: string): string[] {
  const results: string[] = [];

  function walk(current: string) {
    if (!fs.existsSync(current)) {
      return;
    }
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        results.push(path.relative(dir, full).replace(/\\/g, '/'));
      }
    }
  }

  walk(dir);
  return results.sort((a, b) => a.localeCompare(b, 'zh'));
}

/** 由 path 生成 source id */
export function sourceIdFromPath(relativePath: string): string {
  return relativePath.replace(/\.md$/i, '').replace(/\//g, '-');
}

/** 扫描单个 collection 的 Markdown 源 */
export function collectCollectionSources(
  root: string,
  collectionConfig: DocgenCollectionConfig,
): DocCollection {
  const srcDir = path.resolve(root, collectionConfig.src);
  if (!fs.existsSync(srcDir)) {
    throw new Error(`[ocp-doc] 文档目录不存在: ${srcDir}`);
  }

  const files = listMarkdownFiles(srcDir);
  const sources: DocSource[] = files.map((relativePath) => {
    const absolutePath = path.join(srcDir, relativePath);
    const raw = fs.readFileSync(absolutePath, 'utf8');
    const parsed = splitFrontmatter(raw);
    return {
      id: sourceIdFromPath(relativePath),
      path: relativePath,
      locale: collectionConfig.defaultLocale,
      frontmatter: parsed.frontmatter ?? {},
      body: parsed.body,
      content: raw,
      revision: revisionFromContent(raw),
    };
  });

  return {
    id: collectionConfig.id,
    title: collectionConfig.title ?? collectionConfig.id,
    basePath: collectionConfig.base ?? '/',
    defaultLocale: collectionConfig.defaultLocale ?? 'zh',
    sources,
  };
}

/** 扫描全部 collection */
export function collectAllCollections(config: ResolvedDocgenConfig): DocCollection[] {
  return config.collections.map((item) => collectCollectionSources(config.root, item));
}
