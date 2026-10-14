import { describe, expect, it } from 'vitest';
import { compile, inferFenceLanguage, isSyntaxHighlightedHtml } from '../index.js';

const PLUGINS = ['gfm', 'slug', 'infer-fence-lang', 'shiki', 'code-meta', 'doc-code-block'] as const;

describe('language coverage', () => {
  it.each([
    ['typescript', 'interface X {}'],
    ['ts', 'const x: number = 1'],
    ['vue', '<template><div /></template>'],
    ['bash', 'pnpm install'],
    ['yaml', 'key: value'],
    ['yml', 'list:\n  - a'],
    ['json', '{"a": 1}'],
    ['markdown', '# Title'],
    ['md', '**bold**'],
    ['css', '.foo { color: red; }'],
    ['python', 'def foo(): pass'],
    ['rust', 'fn main() {}'],
    ['go', 'package main'],
    ['sql', 'SELECT * FROM users'],
    ['cj', 'func main(): Int64 {\n  let x = 1\n  return x\n}'],
    ['cangjie', 'package app\nfunc main() {}'],
    ['tree', 'UiRoot\n └─ AppShell\n     └─ Body'],
  ])('highlights %s fences', async (lang, code) => {
    const source = `\`\`\`${lang}\n${code}\n\`\`\``;
    const result = await compile(source, { plugins: [...PLUGINS] });
    expect(isSyntaxHighlightedHtml(result.html), result.html).toBe(true);
  }, 60_000);

  it('infers tree language for container-chain style blocks', async () => {
    const source = `\`\`\`
UiRoot                         # 全局
 └─ UiScenarioScope            # 可选
     └─ AppShell
\`\`\``;
    const result = await compile(source, { plugins: [...PLUGINS] });
    expect(isSyntaxHighlightedHtml(result.html)).toBe(true);
    expect(result.html).toContain('shiki');
  }, 30_000);

  it('infers tree for directory listing fences', async () => {
    const source = `\`\`\`
apps/admin/src/ui-business/
apps/admin/src/pages/
\`\`\``;
    expect(inferFenceLanguage('apps/admin/src/ui-business/\napps/admin/src/pages/')).toBe('tree');
    const result = await compile(source, { plugins: [...PLUGINS] });
    expect(isSyntaxHighlightedHtml(result.html)).toBe(true);
  }, 30_000);

  it('infers tree for priority chain', async () => {
    const source = '```\n焦点 > 呈现模式 > 元素 > 样式\n```';
    expect(inferFenceLanguage('焦点 > 呈现模式 > 元素 > 样式')).toBe('tree');
    const result = await compile(source, { plugins: [...PLUGINS] });
    expect(isSyntaxHighlightedHtml(result.html)).toBe(true);
  }, 30_000);

  it('does not highlight untagged plain fences without infer plugin', async () => {
    const source = '```\nplain text\n```';
    const result = await compile(source, { plugins: [...PLUGINS] });
    expect(isSyntaxHighlightedHtml(result.html)).toBe(false);
  }, 30_000);
});

describe('gfm syntax coverage', () => {
  it('task list', async () => {
    const result = await compile('- [x] done\n- [ ] todo', { plugins: ['gfm', 'slug'] });
    expect(result.html).toContain('type="checkbox"');
    expect(result.html).toContain('checked');
  });

  it('strikethrough', async () => {
    const result = await compile('~~deleted~~', { plugins: ['gfm', 'slug'] });
    expect(result.html).toContain('<del>');
  });

  it('autolink', async () => {
    const result = await compile('https://example.com', { plugins: ['gfm', 'slug'] });
    expect(result.html).toContain('href="https://example.com"');
  });

  it('footnote', async () => {
    const source = 'Text[^1]\n\n[^1]: footnote body';
    const result = await compile(source, { plugins: ['gfm', 'slug'] });
    expect(result.html).toMatch(/footnote|data-footnote-ref|fnref/i);
    expect(result.html).toContain('footnote body');
  });

  it('nested blockquote', async () => {
    const result = await compile('> outer\n> > inner', { plugins: ['gfm', 'slug'] });
    expect(result.html.match(/<blockquote/g)?.length).toBeGreaterThan(1);
  });

  it('table alignment', async () => {
    const source = '| L | C | R |\n| :- | :-: | -: |\n| a | b | c |';
    const result = await compile(source, { plugins: ['gfm', 'slug'] });
    expect(result.html).toContain('align="center"');
  });
});
