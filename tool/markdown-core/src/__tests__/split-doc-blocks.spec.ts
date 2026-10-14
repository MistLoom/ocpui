import { describe, expect, it } from 'vitest';
import { serializeDocBlocks, splitDocBlocks } from '../blocks/split-doc-blocks.js';

describe('splitDocBlocks', () => {
  it('切分 prose / admonition / demo', () => {
    const body = `# 标题

段落一。

::: tip 提示标题
内容 **粗体**
:::

中间段落。

::: demo 按钮
\`\`\`vue
<template><button>Hi</button></template>
\`\`\`
:::

结尾。
`;

    const blocks = splitDocBlocks(body);
    expect(blocks.map((item) => item.kind)).toEqual([
      'prose',
      'admonition',
      'prose',
      'demo',
      'prose',
    ]);

    const admonition = blocks[1];
    expect(admonition?.kind).toBe('admonition');
    if (admonition?.kind === 'admonition') {
      expect(admonition.type).toBe('tip');
      expect(admonition.title).toBe('提示标题');
      expect(admonition.body).toContain('粗体');
    }

    const demo = blocks[3];
    expect(demo?.kind).toBe('demo');
    if (demo?.kind === 'demo') {
      expect(demo.title).toBe('按钮');
      expect(demo.code).toContain('<button>Hi</button>');
    }
  });

  it('往返序列化保持容器结构', () => {
    const body = `前言

::: warning
注意事项
:::

::: demo
\`\`\`vue
<template><div>A</div></template>
\`\`\`
:::
`;
    const roundtrip = serializeDocBlocks(splitDocBlocks(body));
    expect(roundtrip).toContain('::: warning');
    expect(roundtrip).toContain('::: demo');
    expect(roundtrip).toContain('<div>A</div>');
    expect(splitDocBlocks(roundtrip).map((item) => item.kind)).toEqual([
      'prose',
      'admonition',
      'demo',
    ]);
  });
});
