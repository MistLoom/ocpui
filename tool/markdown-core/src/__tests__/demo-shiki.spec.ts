import { describe, expect, it } from 'vitest';
import { compile, isSyntaxHighlightedHtml } from '../index.js';

describe('demo + shiki', () => {
  it('普通代码块仍高亮', async () => {
    const source = `# Test

\`\`\`bash
pnpm install
\`\`\`

::: demo
\`\`\`vue
<template><button>ok</button></template>
\`\`\`
:::
`;
    const result = await compile(source, {
      plugins: ['gfm', 'slug', 'admonition', 'demo', 'infer-fence-lang', 'shiki', 'code-meta', 'doc-code-block'],
    });
    expect(result.html).toContain('doc-demo');
    expect(isSyntaxHighlightedHtml(result.html)).toBe(true);
    expect(result.html).toContain('shiki');
    expect(result.html).toMatch(/pnpm|install/);
  }, 30_000);
});
