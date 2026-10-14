import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import type { DocCollection } from '@ocpui/markdown-core';

vi.mock('@ocpui/vue/feedback', () => ({
  Loading: defineComponent({ template: '<div />' }),
  Spin: defineComponent({ name: 'Spin', template: '<div class="spin-stub" />' }),
  ErrorStateBlock: defineComponent({ template: '<div />' }),
  Popover: defineComponent({
    setup(_, { slots }) {
      return () => h('div', { class: 'popover-stub' }, [slots.trigger?.(), slots.default?.()]);
    },
  }),
}));

vi.mock('@ocpui/vue', () => ({
  UiScenarioScope: defineComponent({
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  }),
  Breadcrumb: defineComponent({ props: ['items'], template: '<nav class="breadcrumb-stub" />' }),
  Empty: defineComponent({ template: '<div class="empty-stub" />' }),
  Tree: defineComponent({
    props: ['data'],
    emits: ['select'],
    template: '<div class="tree-stub" @click="$emit(\'select\', { sourceId: \'b\' }, true)" />',
  }),
  SegmentedControl: defineComponent({ template: '<div />' }),
  Slider: defineComponent({ template: '<div />' }),
  Button: defineComponent({ template: '<button type="button"><slot /></button>' }),
  GlobalSearch: defineComponent({ template: '<div class="global-search-stub" />' }),
}));

import DocWikiShell from '../DocWikiShell.vue';

const COLLECTION: DocCollection = {
  id: 'demo',
  title: 'Demo Wiki',
  basePath: '/',
  defaultLocale: 'zh',
  sources: [
    { id: 'a', path: 'a.md', frontmatter: { title: 'A' }, body: '# A' },
    { id: 'b', path: 'b.md', frontmatter: { title: 'B' }, body: '# B' },
  ],
};

describe('DocWikiShell', () => {
  it('渲染 nav 与正文', async () => {
    const wrapper = mount(DocWikiShell, {
      props: {
        collection: COLLECTION,
        initialSourceId: 'a',
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

    expect(wrapper.find('.doc-wiki-shell').exists()).toBe(true);
    expect(wrapper.find('.doc-nav-tree').exists()).toBe(true);
    expect(wrapper.text()).toContain('A');
  });
});
