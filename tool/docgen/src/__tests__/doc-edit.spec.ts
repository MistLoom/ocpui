import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { collectCollectionSources } from '../core/collect-collection.js';
import { readDocSourceContent, saveDocSourceContent } from '../core/doc-edit-api.js';
import { revisionFromContent } from '../core/source-revision.js';
import { normalizeDocgenConfig } from '../config.js';

const THEME_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../theme-default');

describe('source-revision', () => {
  it('相同内容 revision 一致', () => {
    expect(revisionFromContent('# A')).toBe(revisionFromContent('# A'));
    expect(revisionFromContent('# A')).not.toBe(revisionFromContent('# B'));
  });
});

describe('doc-edit-api', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  function createFixture(content: string) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ocp-doc-edit-'));
    tempDirs.push(root);
    const docsDir = path.join(root, 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(path.join(docsDir, 'index.md'), content, 'utf8');
    const config = normalizeDocgenConfig(
      root,
      { collections: [{ id: 'default', src: './docs', base: '/' }] },
      THEME_DIR,
    );
    const collection = collectCollectionSources(root, config.collections[0]!);
    return { root, config, collection };
  }

  it('readDocSourceContent 返回 revision', () => {
    const { config, collection } = createFixture('---\ntitle: A\n---\n\n# Hello');
    const result = readDocSourceContent(config, collection, 'index');
    expect(result.markdown).toContain('# Hello');
    expect(result.revision).toBe(revisionFromContent(result.markdown));
  });

  it('saveDocSourceContent 写入并更新 revision', () => {
    const { config, collection } = createFixture('# Before');
    const source = readDocSourceContent(config, collection, 'index');
    const saved = saveDocSourceContent({
      config,
      collection,
      sourceId: 'index',
      markdown: '# After',
      revision: source.revision,
    });
    expect(saved).toEqual({ revision: revisionFromContent('# After') });
    const reread = readDocSourceContent(config, collection, 'index');
    expect(reread.markdown).toBe('# After');
  });

  it('saveDocSourceContent revision 冲突', () => {
    const { config, collection } = createFixture('# Before');
    const result = saveDocSourceContent({
      config,
      collection,
      sourceId: 'index',
      markdown: '# Local',
      revision: 'stale-revision',
    });
    expect(result).toMatchObject({ error: 'conflict', remoteMarkdown: '# Before' });
  });
});
