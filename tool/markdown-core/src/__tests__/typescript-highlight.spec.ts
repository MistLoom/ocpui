import { describe, expect, it } from 'vitest';
import { compile } from '../compile.js';

const TYPESCRIPT_SAMPLE = `\`\`\`typescript
interface AppShellContext {
  responsibilityScope?: unknown
  entryReason?: string
}
\`\`\``;

describe('typescript fence highlight', () => {
  it('shiki + doc-code-block 产出彩色 span', async () => {
    const result = await compile(TYPESCRIPT_SAMPLE, {
      plugins: ['gfm', 'slug', 'code-meta', 'shiki', 'doc-code-block'],
    });
    expect(result.html).toContain('doc-code-block');
    // shiki 双主题以 CSS 变量（--shiki-light/--shiki-dark）输出着色，由 CSS 切换明暗
    expect(result.html).toMatch(/style="[^"]*--shiki-(light|dark):/);
    expect(result.html).toContain('interface');
    expect(result.html).not.toMatch(/<code class="language-typescript"[^>]*>interface/);
  }, 30_000);
});
