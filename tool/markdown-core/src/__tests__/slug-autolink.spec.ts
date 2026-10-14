import { describe, expect, it } from 'vitest';
import { compile } from '../compile.js';

describe('slug autolink 契约', () => {
  it('标题采用 append：文本在 a 外，右侧 # 锚点', async () => {
    const result = await compile('# 状态系统\n', { plugins: ['gfm', 'slug'] });
    expect(result.html).toMatch(
      /<h1[^>]*>状态系统<a[^>]*class="[^"]*doc-heading-anchor[^"]*"[^>]*>#<\/a><\/h1>/,
    );
    // 禁止 wrap：整段标题不得包进锚点
    expect(result.html).not.toMatch(/<h1[^>]*><a[^>]*>状态系统<\/a>/);
  });
});
