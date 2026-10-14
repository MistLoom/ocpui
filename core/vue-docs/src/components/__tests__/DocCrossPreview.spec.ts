import { describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import DocCrossPreview from '../DocCrossPreview.vue';

vi.mock('@ocpui/vue/feedback', () => ({
  Loading: defineComponent({ name: 'Loading', template: '<div class="loading-stub" />' }),
  Spin: defineComponent({ name: 'Spin', template: '<div class="spin-stub" />' }),
  ErrorStateBlock: defineComponent({ name: 'ErrorStateBlock', template: '<div class="error-stub" />' }),
}));

describe('DocCrossPreview', () => {
  it('ready 状态展示摘要', () => {
    const wrapper = mount(DocCrossPreview, {
      props: {
        state: 'ready',
        title: '安装',
        excerpt: '安装步骤说明',
        path: 'guide/install.md',
      },
    });
    expect(wrapper.text()).toContain('安装');
    expect(wrapper.text()).toContain('安装步骤说明');
  });

  it('loading 状态', () => {
    const wrapper = mount(DocCrossPreview, {
      props: { state: 'loading' },
    });
    expect(wrapper.find('.spin-stub').exists()).toBe(true);
  });
});
