import { describe, expect, it } from 'vitest';
import { compile } from '../compile.js';

describe('glossary plugin', () => {
  it('[[term]] 编译为 data-doc-glossary-term', async () => {
    const result = await compile('Hello [[OCP]] world', {
      plugins: ['gfm', 'slug', 'glossary'],
    });
    expect(result.html).toContain('data-doc-glossary-term="OCP"');
    expect(result.html).toContain('doc-glossary-term');
  });
});

describe('cross-doc plugin', () => {
  it('collection:path 链接附加 data-doc-cross-href', async () => {
    const result = await compile('[安装](manual:guide/install.md)', {
      plugins: ['gfm', 'slug', 'cross-doc'],
    });
    expect(result.html).toContain('data-doc-cross-href="manual:guide/install.md"');
    expect(result.html).toContain('data-doc-cross-link');
  });
});
