import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DocToc from '../DocToc.vue';
import DocAdmonition from '../DocAdmonition.vue';

describe('DocToc', () => {
  it('渲染目录项', () => {
    const wrapper = mount(DocToc, {
      props: {
        headings: [
          { id: 'intro', text: '介绍', depth: 2 },
          { id: 'setup', text: '安装', depth: 2 },
        ],
      },
    });

    expect(wrapper.findAll('.doc-toc__link')).toHaveLength(2);
    expect(wrapper.text()).toContain('介绍');
  });
});

describe('DocAdmonition', () => {
  it('渲染提示块类型与标题', () => {
    const wrapper = mount(DocAdmonition, {
      props: { type: 'tip', title: '提示' },
    });

    expect(wrapper.classes()).toContain('doc-admonition--tip');
    expect(wrapper.text()).toContain('提示');
  });
});
