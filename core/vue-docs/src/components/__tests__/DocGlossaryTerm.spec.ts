import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import DocGlossaryTerm from '../DocGlossaryTerm.vue';

vi.mock('@ocpui/vue/feedback', () => ({
  Popover: defineComponent({
    name: 'Popover',
    props: ['modelValue'],
    template: '<div class="popover-stub"><slot name="trigger" /><div class="popover-content"><slot /></div></div>',
  }),
}));

describe('DocGlossaryTerm', () => {
  it('渲染术语', () => {
    const wrapper = mount(DocGlossaryTerm, {
      props: {
        term: 'OCP',
        definition: '开放组件平台',
      },
    });
    expect(wrapper.text()).toContain('OCP');
    expect(wrapper.text()).toContain('开放组件平台');
  });
});
