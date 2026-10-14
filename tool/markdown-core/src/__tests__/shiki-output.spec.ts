import { describe, expect, it } from 'vitest';
import { compile } from '../compile.js';

describe('shiki output', () => {
  it('sanitize 后保留高亮 span style', async () => {
    const source = '```typescript\nconst answer = 42\n```';
    const result = await compile(source, {
      plugins: ['gfm', 'slug', 'shiki', 'code-meta', 'doc-code-block'],
      sanitize: true,
    });

    expect(result.html).toContain('shiki');
    expect(result.html).toMatch(/style="/);
    expect(result.html).toContain('answer');
    // 调试：确认 dual-theme 输出结构
    expect(result.html).toMatch(/color:|--shiki/);
  }, 30_000);
});
