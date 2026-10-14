import { describe, expect, it } from 'vitest';
import { compile } from '../compile.js';

describe('doc-code-block plugin', () => {
  it('围栏代码块输出 pre > code 结构', async () => {
    const result = await compile('```ts\nconst x = 1\n```', {
      plugins: ['gfm', 'slug', 'code-meta', 'doc-code-block'],
    });
    expect(result.html).toMatch(/^<pre[^>]*class="[^"]*doc-code-block/);
    expect(result.html).toContain('<code');
    expect(result.html).not.toMatch(/^<code/);
  });

  it('块级 code 缺 pre 时自动补 wrapper', async () => {
    const result = await compile('```js\nline1\nline2\n```', {
      plugins: ['gfm', 'code-meta', 'doc-code-block'],
    });
    expect(result.html).toContain('doc-code-block');
    expect(result.html).toContain('data-language="js"');
  });
});
