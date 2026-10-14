import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectCollectionSources, listMarkdownFiles, sourceIdFromPath } from '../core/collect-collection.js';
import { buildRuntimePayload, buildSearchIndexPayload, writeBuildArtifacts } from '../core/build-artifacts.js';
import { formatLinkcheckReport, runLinkcheck } from '../core/linkcheck.js';
import { resolveMarkdownHref } from '@ocpui/markdown-core';
import { normalizeDocgenConfig } from '../config.js';

const FIXTURE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/demo');
const THEME_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../theme-default');

describe('collect-collection', () => {
  it('扫描 Markdown 文件', () => {
    const docsDir = path.join(FIXTURE_ROOT, 'docs');
    const files = listMarkdownFiles(docsDir);
    expect(files).toEqual(['api/compile.md', 'guide/intro.md', 'index.md']);
  });

  it('sourceIdFromPath', () => {
    expect(sourceIdFromPath('guide/intro.md')).toBe('guide-intro');
  });

  it('collectCollectionSources', () => {
    const collection = collectCollectionSources(FIXTURE_ROOT, {
      id: 'default',
      src: './docs',
      base: '/',
      title: 'Fixture',
    });
    expect(collection.sources).toHaveLength(3);
    expect(collection.sources[0]?.frontmatter.title).toBeTruthy();
  });
});

describe('build-artifacts', () => {
  it('buildRuntimePayload 含 manifest', async () => {
    const config = normalizeDocgenConfig(FIXTURE_ROOT, {
      collections: [{ id: 'default', src: './docs', base: '/' }],
    }, THEME_DIR);
    const payload = await buildRuntimePayload(config);
    expect(payload.manifests[0]?.routes.length).toBe(3);
    expect(payload.markdownPlugins).toContain('gfm');
    expect(payload.searchIndexes[0]?.index).toBeTruthy();
    const firstSource = payload.collections[0]?.sources[0];
    expect(firstSource?.compiledHtml).toBeTruthy();
  }, 60_000);

  it('writeBuildArtifacts 写入 JSON', async () => {
    const config = normalizeDocgenConfig(
      FIXTURE_ROOT,
      { collections: [{ id: 'default', src: './docs', base: '/' }], outDir: '.docgen-test-out' },
      THEME_DIR,
    );
    const outDir = path.join(FIXTURE_ROOT, '.docgen-test-out');
    const result = await writeBuildArtifacts(config, outDir);
    expect(result.manifestPath.endsWith('doc-manifest.json')).toBe(true);
    expect(result.searchIndexPath.endsWith('search-index.json')).toBe(true);
  });
});

describe('linkcheck', () => {
  it('resolveMarkdownHref', () => {
    expect(resolveMarkdownHref('guide/intro.md', '../index.md')).toBe('index.md');
  });

  it('runLinkcheck 通过 fixture', async () => {
    const config = normalizeDocgenConfig(FIXTURE_ROOT, {
      collections: [{ id: 'default', src: './docs', base: '/' }],
    }, THEME_DIR);
    const { collectAllCollections } = await import('../core/collect-collection.js');
    const collections = collectAllCollections(config);
    const report = await runLinkcheck(collections);
    expect(formatLinkcheckReport(report)).toContain('通过');
  });
});

describe('buildSearchIndexPayload', () => {
  it('生成 minisearch payload', async () => {
    const config = normalizeDocgenConfig(FIXTURE_ROOT, {
      collections: [{ id: 'default', src: './docs', base: '/' }],
    }, THEME_DIR);
    const { collectAllCollections } = await import('../core/collect-collection.js');
    const payload = await buildSearchIndexPayload(collectAllCollections(config));
    expect(payload.version).toBeTruthy();
    expect(payload.index).toBeTruthy();
  });
});
