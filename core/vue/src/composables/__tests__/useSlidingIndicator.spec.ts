import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineComponent, ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useSlidingIndicator } from '../useSlidingIndicator';

describe('useSlidingIndicator', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('无激活项时透明', async () => {
    const Comp = defineComponent({
      setup() {
        const track = ref<HTMLElement | null>(document.createElement('div'));
        const active = ref<HTMLElement | null>(null);
        const { indicatorStyle } = useSlidingIndicator(track, active);
        return { indicatorStyle };
      },
      template: '<div />',
    });
    const wrapper = mount(Comp);
    await nextTick();
    expect(wrapper.vm.indicatorStyle.opacity).toBe(0);
    wrapper.unmount();
  });
});
