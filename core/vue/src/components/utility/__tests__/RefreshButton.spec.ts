import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';

// Mock i18n：RefreshButton 内部 useUiT → t('common.refresh') 返回固定文案
const mockT = vi.hoisted(() => vi.fn((key: string) => {
  if (key === 'common.refresh') return '刷新';
  return key;
}));

vi.mock('@ocpui/vue/composables/useUiT', () => ({
  useUiT: () => ({ t: mockT }),
}));

import RefreshButton from '../RefreshButton.vue';

describe('RefreshButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof RefreshButton>>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  describe('基础渲染', () => {
    it('默认渲染：图标 + i18n 文案', () => {
      wrapper = mount(RefreshButton);
      expect(wrapper.find('button').exists()).toBe(true);
      expect(mockT).toHaveBeenCalledWith('common.refresh');
      expect(wrapper.text()).toContain('刷新');
    });

    it('label prop 覆盖 i18n 文案', () => {
      wrapper = mount(RefreshButton, { props: { label: '自定义刷新' } });
      expect(wrapper.text()).toContain('自定义刷新');
      // label 显式传值时不调用 t('common.refresh')
      expect(mockT).not.toHaveBeenCalledWith('common.refresh');
    });

    it('label="" 时仅显示图标（纯图标模式）', () => {
      wrapper = mount(RefreshButton, { props: { label: '' } });
      expect(wrapper.text()).not.toContain('刷新');
    });
  });

  describe('loading 状态', () => {
    it('loading=true 时按钮禁用 + aria-busy=true', () => {
      wrapper = mount(RefreshButton, { props: { loading: true } });
      const btn = wrapper.find('button');
      expect(btn.attributes('disabled')).toBeDefined();
      expect(btn.attributes('aria-busy')).toBe('true');
    });

    it('loading=false 时 aria-busy=false', () => {
      wrapper = mount(RefreshButton, { props: { loading: false } });
      expect(wrapper.find('button').attributes('aria-busy')).toBe('false');
    });
  });

  describe('disabled 状态', () => {
    it('disabled=true 时按钮禁用', () => {
      wrapper = mount(RefreshButton, { props: { disabled: true } });
      expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    });

    it('disabled + loading 同时为 true 时按钮禁用', () => {
      wrapper = mount(RefreshButton, { props: { disabled: true, loading: true } });
      expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    });
  });

  describe('click / emit', () => {
    it('点击正常状态按钮时 emit refresh', async () => {
      wrapper = mount(RefreshButton);
      await wrapper.find('button').trigger('click');
      expect(wrapper.emitted('refresh')).toHaveLength(1);
    });

    it('loading 时点击不 emit refresh', async () => {
      wrapper = mount(RefreshButton, { props: { loading: true } });
      await wrapper.find('button').trigger('click');
      expect(wrapper.emitted('refresh')).toBeUndefined();
    });

    it('disabled 时点击不 emit refresh', async () => {
      wrapper = mount(RefreshButton, { props: { disabled: true } });
      await wrapper.find('button').trigger('click');
      expect(wrapper.emitted('refresh')).toBeUndefined();
    });
  });

  describe('无障碍', () => {
    it('aria-label 始终有值（默认 i18n）', () => {
      wrapper = mount(RefreshButton);
      expect(wrapper.find('button').attributes('aria-label')).toBe('刷新');
    });

    it('aria-label 使用 label prop 值', () => {
      wrapper = mount(RefreshButton, { props: { label: '重新加载' } });
      expect(wrapper.find('button').attributes('aria-label')).toBe('重新加载');
    });

    it('纯图标模式下 aria-label 回退到 i18n', () => {
      wrapper = mount(RefreshButton, { props: { label: '' } });
      expect(wrapper.find('button').attributes('aria-label')).toBe('刷新');
    });
  });

  describe('size 透传', () => {
    it('size=sm 时应用 btn-sm class', () => {
      wrapper = mount(RefreshButton, { props: { size: 'sm' } });
      expect(wrapper.find('.btn-sm').exists()).toBe(true);
    });

    it('size=lg 时应用 btn-lg class', () => {
      wrapper = mount(RefreshButton, { props: { size: 'lg' } });
      expect(wrapper.find('.btn-lg').exists()).toBe(true);
    });
  });
});
