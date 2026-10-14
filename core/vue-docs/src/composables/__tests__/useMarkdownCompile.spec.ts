import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { useMarkdownCompile } from '../../composables/useMarkdownCompile.js';

describe('useMarkdownCompile', () => {
  it('编译 markdown 并产出 headings', async () => {
    const source = ref('# Title\n\nparagraph');
    const { html, result, loading, error, compile } = useMarkdownCompile(source);

    expect(loading.value).toBe(true);
    await flushPromises();
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(html.value).toContain('Title');
    expect(result.value?.headings[0]?.text).toBe('Title');

    await compile('# Updated');
    expect(result.value?.headings[0]?.text).toBe('Updated');
  });
});

describe('DocToc', () => {
  it('占位：组件测试见 doc-components.spec.ts', () => {
    expect(true).toBe(true);
  });
});
