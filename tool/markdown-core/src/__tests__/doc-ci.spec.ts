import { describe, expect, it } from 'vitest';
import { compile } from '../compile.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

function readFixture(name: string): string {
  return readFileSync(path.join(FIXTURE_DIR, name), 'utf8');
}

/** CI：fixture MD 可编译 */
describe('check-doc-compile', () => {
  it('compile-fixtures/*.md 均可编译', async () => {
    const files = ['basic.md', 'admonition.md', 'glossary.md', 'table.md'];
    for (const file of files) {
      const source = readFixture(file);
      const result = await compile(source, {
        plugins: ['gfm', 'slug', 'admonition', 'code-meta', 'glossary', 'cross-doc'],
      });
      expect(result.html.length, file).toBeGreaterThan(0);
      if (file !== 'table.md') {
        expect(result.headings.length, file).toBeGreaterThan(0);
      }
    }
  });

  it('TOC 结构 snapshot', async () => {
    const result = await compile(readFixture('headings.md'), { plugins: ['gfm', 'slug'] });
    expect(result.headings).toMatchSnapshot();
  });

  it('admonition 结构 snapshot', async () => {
    const result = await compile(readFixture('admonition.md'), { plugins: ['gfm', 'slug', 'admonition'] });
    expect(result.html).toMatchSnapshot();
  });
});

/** CI：XSS fixture 经 sanitize 后不执行脚本 */
describe('check-doc-sanitize', () => {
  it('恶意 script 被剥离', async () => {
    const result = await compile(readFixture('xss.md'), {
      plugins: ['gfm', 'slug'],
      sanitize: true,
    });
    expect(result.html.toLowerCase()).not.toContain('<script');
    expect(result.html).not.toMatch(/onerror\s=/i);
  });

  it('javascript: 协议链接被 neutralize', async () => {
    const result = await compile(readFixture('xss.md'), {
      plugins: ['gfm', 'slug'],
      sanitize: true,
    });
    expect(result.html).not.toContain('javascript:');
  });
});
