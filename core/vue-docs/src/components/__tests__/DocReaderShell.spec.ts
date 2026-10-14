import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';

vi.mock('@ocpui/vue/feedback', () => ({
  Loading: defineComponent({ name: 'Loading', template: '<div />' }),
  Spin: defineComponent({ name: 'Spin', template: '<div class="spin-stub" />' }),
  ErrorStateBlock: defineComponent({ name: 'ErrorStateBlock', template: '<div />' }),
  Popover: defineComponent({
    name: 'Popover',
    setup(_, { slots }) {
      return () => h('div', { class: 'popover-stub' }, [slots.trigger?.(), slots.default?.()]);
    },
  }),
}));

vi.mock('@ocpui/vue', () => ({
  UiScenarioScope: defineComponent({
    name: 'UiScenarioScope',
    setup(_, { slots }) {
      return () => h('div', { class: 'ui-scenario-scope' }, slots.default?.());
    },
  }),
  SegmentedControl: defineComponent({
    name: 'SegmentedControl',
    props: ['modelValue', 'options'],
    emits: ['update:modelValue'],
    template: '<div class="segmented-stub" />',
  }),
  Slider: defineComponent({
    name: 'Slider',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div class="slider-stub" />',
  }),
  Button: defineComponent({
    name: 'Button',
    template: '<button type="button"><slot /></button>',
  }),
}));

import DocReaderShell from '../DocReaderShell.vue';

describe('DocReaderShell', () => {
  it('渲染 chrome 与正文', async () => {
    const wrapper = mount(DocReaderShell, {
      props: {
        source: '# Title\n\nBody',
        title: '手册',
        docId: 'test-doc',
        plugins: ['gfm', 'slug'],
      },
    });

    await flushPromises();
    await vi.waitFor(
      () => {
        expect(wrapper.find('.markdown-body__content').exists()).toBe(true);
      },
      { timeout: 8000 },
    );

    expect(wrapper.find('.doc-reader-shell').exists()).toBe(true);
    expect(wrapper.find('.doc-reader-shell__title').text()).toBe('手册');
    expect(wrapper.emitted('compiled')?.length).toBeGreaterThan(0);
  });

  it('含阅读偏好控件', () => {
    const wrapper = mount(DocReaderShell, {
      props: { source: '# A', showToc: false },
    });

    expect(wrapper.text()).toContain('阅读设置');
  });
});
