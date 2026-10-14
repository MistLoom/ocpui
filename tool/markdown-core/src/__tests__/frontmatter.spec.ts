import { describe, expect, it } from 'vitest';
import { formatFrontmatterYaml, splitFrontmatter, stringifyFrontmatter } from '../frontmatter.js';

describe('frontmatter', () => {
  it('splitFrontmatter 解析 title 与正文', () => {
    const { frontmatter, body } = splitFrontmatter('---\ntitle: x\n---\n\nbody');
    expect(frontmatter.title).toBe('x');
    expect(body.trim()).toBe('body');
  });

  it('splitFrontmatter 解析 tags 数组', () => {
    const { frontmatter } = splitFrontmatter(`---
title: 安装指南
tags:
  - setup
---

# 安装
`);
    expect(frontmatter.title).toBe('安装指南');
    expect(frontmatter.tags).toEqual(['setup']);
  });

  it('无 frontmatter 时返回全文为 body', () => {
    const { frontmatter, body } = splitFrontmatter('# Hello');
    expect(frontmatter).toEqual({});
    expect(body).toBe('# Hello');
  });

  it('stringifyFrontmatter 与 splitFrontmatter 可往返', () => {
    const source = `---
title: Demo
draft: true
---

正文内容`;
    const parsed = splitFrontmatter(source);
    const rebuilt = stringifyFrontmatter(parsed.body, parsed.frontmatter);
    const roundTrip = splitFrontmatter(rebuilt);
    expect(roundTrip.frontmatter.title).toBe('Demo');
    expect(roundTrip.frontmatter.draft).toBe(true);
    expect(roundTrip.body.trim()).toBe('正文内容');
  });

  it('formatFrontmatterYaml 不含分隔符', () => {
    const yaml = formatFrontmatterYaml({ title: 'x', tags: ['a'] });
    expect(yaml).toContain('title: x');
    expect(yaml).not.toContain('---');
  });
});
