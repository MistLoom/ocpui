import { describe, expect, it } from 'vitest';
import { compile, splitFrontmatter } from '../compile.js';

describe('compile', () => {
  it('解析 frontmatter 与正文', async () => {
    const source = `---
title: 安装指南
tags:
  - setup
---

# 安装

执行 \`pnpm install\`。
`;

    const result = await compile(source);
    expect(result.frontmatter.title).toBe('安装指南');
    expect(result.frontmatter.tags).toEqual(['setup']);
    expect(result.body).toContain('# 安装');
    expect(result.html).toContain('<h1');
    expect(result.html).toContain('安装');
    expect(result.headings).toEqual([
      expect.objectContaining({ depth: 1, text: '安装' }),
    ]);
    expect(result.headings[0]?.id).toBeTruthy();
  });

  it('渲染 GFM 表格', async () => {
    const source = `| A | B |
| --- | --- |
| 1 | 2 |`;

    const result = await compile(source);
    expect(result.html).toContain('<table>');
    expect(result.html).toContain('<td>1</td>');
  });

  it('渲染 admonition 容器', async () => {
    const source = `::: tip 提示标题
这是一条提示。
:::`;

    const result = await compile(source);
    expect(result.html).toContain('<aside');
    expect(result.html).toContain('doc-admonition--tip');
    expect(result.html).toContain('提示标题');
    expect(result.html).toContain('这是一条提示');
  });

  it('拒绝 XSS payload', async () => {
    const source = `<script>alert(1)</script>

[click](javascript:alert(1))`;

    const result = await compile(source);
    expect(result.html).not.toContain('<script');
    expect(result.html).not.toContain('javascript:');
  });

  it('splitFrontmatter 可单独使用', () => {
    const { frontmatter, body } = splitFrontmatter('---\ntitle: x\n---\n\nbody');
    expect(frontmatter.title).toBe('x');
    expect(body.trim()).toBe('body');
  });
});

describe('plugins', () => {
  it('code-meta 插件附加语言属性', async () => {
    const source = '```ts\nconst x = 1\n```';
    const result = await compile(source, { plugins: ['gfm', 'slug', 'admonition', 'code-meta'] });
    expect(result.html).toContain('language-ts');
    expect(result.html).toMatch(/data-language="ts"|dataLanguage="ts"/);
  });

  it('shiki 插件高亮代码块', async () => {
    const source = '```ts\nconst answer = 42\n```';
    const result = await compile(source, {
      plugins: ['gfm', 'slug', 'shiki', 'code-meta'],
    });
    expect(result.html).toContain('shiki');
    expect(result.html).toContain('answer');
  }, 30_000);
});
