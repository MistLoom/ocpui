import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import Suggestion from '../Suggestion.vue';
// 定义SuggestionOption类型
interface SuggestionOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  description?: string;
  icon?: string;
}

describe('Suggestion Component', () => {
  let wrapper: VueWrapper<InstanceType<typeof Suggestion>>;

  const defaultOptions: SuggestionOption[] = [
    { label: 'Apple', value: 'apple', description: 'Fruit' },
    { label: 'Banana', value: 'banana', description: 'Fruit' },
    { label: 'Cherry', value: 'cherry', description: 'Fruit' },
    { label: 'Date', value: 'date', description: 'Fruit' },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // 基础渲染测试
  describe('Basic Rendering', () => {
    it('should render correctly with default props', () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      expect(wrapper.find('.suggestion').exists()).toBe(true);
      expect(wrapper.find('.suggestion-input').exists()).toBe(true);
      expect(wrapper.find('input').attributes('placeholder')).toBe('请输入');
    });

    it('should render with custom placeholder', () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          placeholder: 'Custom placeholder',
        },
      });

      expect(wrapper.find('input').attributes('placeholder')).toBe('Custom placeholder');
    });

    it('should render with initial value', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: 'Apple',
          options: defaultOptions,
        },
      });

      await nextTick();
      expect(wrapper.find('input').element.value).toBe('Apple');
    });
  });

  // 尺寸变体测试
  describe('Size Variants', () => {
    it('should apply sm size class', () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          size: 'sm',
        },
      });

      expect(wrapper.find('.suggestion--sm').exists()).toBe(true);
    });

    it('should apply md size class by default', () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      expect(wrapper.find('.suggestion--md').exists()).toBe(true);
    });

    it('should apply lg size class', () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          size: 'lg',
        },
      });

      expect(wrapper.find('.suggestion--lg').exists()).toBe(true);
    });
  });

  // 状态测试
  describe('States', () => {
    it('should apply disabled class when disabled', () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          disabled: true,
        },
      });

      expect(wrapper.find('.suggestion--disabled').exists()).toBe(true);
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('should apply loading class when loading', () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          loading: true,
        },
      });

      expect(wrapper.find('.suggestion--loading').exists()).toBe(true);
      expect(wrapper.find('.suggestion-spinner').exists()).toBe(true);
    });

    it('should show clear button when clearable and has value', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          clearable: true,
        },
      });

      // 初始状态没有清除按钮
      expect(wrapper.find('.suggestion-clear').exists()).toBe(false);

      // 输入值后显示清除按钮
      await wrapper.find('input').setValue('test');
      await nextTick();
      expect(wrapper.find('.suggestion-clear').exists()).toBe(true);
    });
  });

  // 输入和过滤测试
  describe('Input and Filtering', () => {
    it('should emit update:modelValue on input', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      const input = wrapper.find('input');
      await input.setValue('App');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['App']);
    });

    it('should emit search event with debounce', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          debounce: 300,
        },
      });

      const input = wrapper.find('input');
      await input.setValue('test');

      // 防抖前不应触发
      expect(wrapper.emitted('search')).toBeFalsy();

      // 等待防抖
      vi.advanceTimersByTime(300);

      expect(wrapper.emitted('search')).toBeTruthy();
      expect(wrapper.emitted('search')![0]).toEqual(['test']);
    });

    it('should filter options based on input', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          filterable: true,
        },
      });

      // 聚焦输入框显示建议
      await wrapper.find('input').trigger('focus');
      await nextTick();

      // 输入过滤
      const input = wrapper.find('input');
      await input.setValue('App');
      await nextTick();

      // 检查过滤结果
      const vm = wrapper.vm as any;
      expect(vm.filteredOptions.length).toBe(1);
      expect(vm.filteredOptions[0].label).toBe('Apple');
    });

    it('should use custom filter method', async () => {
      const customFilter = (input: string, option: SuggestionOption) => {
        return option.label.toLowerCase().startsWith(input.toLowerCase());
      };

      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          filterable: true,
          filterMethod: customFilter,
        },
      });

      const input = wrapper.find('input');
      await input.setValue('A');
      await nextTick();

      const vm = wrapper.vm as any;
      expect(vm.filteredOptions.length).toBe(1);
      expect(vm.filteredOptions[0].label).toBe('Apple');
    });
  });

  // 键盘导航测试
  describe('Keyboard Navigation', () => {
    it('should open dropdown on ArrowDown', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      const input = wrapper.find('input');
      await input.trigger('keydown', { key: 'ArrowDown' });

      const vm = wrapper.vm as any;
      expect(vm.visible).toBe(true);
    });

    it('should navigate options with arrow keys', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      const input = wrapper.find('input');

      // 打开下拉框
      await input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();

      const vm = wrapper.vm as any;
      expect(vm.selectedIndex).toBe(0);

      // 向下导航
      await input.trigger('keydown', { key: 'ArrowDown' });
      expect(vm.selectedIndex).toBe(1);

      // 向上导航
      await input.trigger('keydown', { key: 'ArrowUp' });
      expect(vm.selectedIndex).toBe(0);
    });

    it('should select option on Enter', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      const input = wrapper.find('input');

      // 打开下拉框并选择第一项
      await input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      await input.trigger('keydown', { key: 'Enter' });

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![wrapper.emitted('update:modelValue')!.length - 1]).toEqual(['Apple']);
    });

    it('should close dropdown on Escape', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      const input = wrapper.find('input');

      // 打开下拉框
      await input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();

      const vm = wrapper.vm as any;
      expect(vm.visible).toBe(true);

      // 关闭下拉框
      await input.trigger('keydown', { key: 'Escape' });
      expect(vm.visible).toBe(false);
    });

    it('should navigate to first option on Home', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      const input = wrapper.find('input');

      // 打开下拉框并向下导航
      await input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      await input.trigger('keydown', { key: 'ArrowDown' });
      await input.trigger('keydown', { key: 'ArrowDown' });

      const vm = wrapper.vm as any;
      expect(vm.selectedIndex).toBe(2);

      // 按 Home 键回到第一项
      await input.trigger('keydown', { key: 'Home' });
      expect(vm.selectedIndex).toBe(0);
    });

    it('should navigate to last option on End', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      const input = wrapper.find('input');

      // 打开下拉框
      await input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();

      const vm = wrapper.vm as any;

      // 按 End 键到最后一项
      await input.trigger('keydown', { key: 'End' });
      expect(vm.selectedIndex).toBe(3);
    });
  });

  // 事件测试
  describe('Events', () => {
    it('should emit focus event on focus', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      await wrapper.find('input').trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('should emit clear event on clear', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          clearable: true,
        },
      });

      // 先输入值
      await wrapper.find('input').setValue('test');
      await nextTick();

      // 点击清除按钮
      await wrapper.find('.suggestion-clear').trigger('click');

      expect(wrapper.emitted('clear')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![wrapper.emitted('update:modelValue')!.length - 1]).toEqual(['']);
    });

    it('should emit select event on option click', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      // 直接使用组件内部方法模拟选择
      const vm = wrapper.vm as any;
      const option = defaultOptions[0];
      vm.handleSelect(option);

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')![0]).toEqual([option]);
    });

    it('should emit visible-change event', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      // 打开
      await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.emitted('visible-change')).toBeTruthy();
      expect(wrapper.emitted('visible-change')![0]).toEqual([true]);
    });
  });

  // 方法测试
  describe('Methods', () => {
    it('should focus input when focus method is called', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      const input = wrapper.find('input');
      const focusSpy = vi.spyOn(input.element, 'focus');

      await wrapper.vm.focus();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should blur input when blur method is called', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      const input = wrapper.find('input');
      const blurSpy = vi.spyOn(input.element, 'blur');

      await wrapper.vm.blur();

      expect(blurSpy).toHaveBeenCalled();
    });

    it('should show dropdown when show method is called', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      await wrapper.vm.show();

      const vm = wrapper.vm as any;
      expect(vm.visible).toBe(true);
    });

    it('should hide dropdown when hide method is called', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
        },
      });

      // 先显示
      await wrapper.vm.show();
      // 再隐藏
      await wrapper.vm.hide();

      const vm = wrapper.vm as any;
      expect(vm.visible).toBe(false);
    });
  });

  // 最大数量限制测试
  describe('Max Count Limit', () => {
    it('should limit displayed options to maxCount', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          maxCount: 2,
        },
      });

      const vm = wrapper.vm as any;
      expect(vm.displayOptions.length).toBe(2);
    });
  });

  // 禁用选项测试
  describe('Disabled Options', () => {
    it('should not select disabled option', async () => {
      const optionsWithDisabled: SuggestionOption[] = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b', disabled: true },
        { label: 'Option C', value: 'c' },
      ];

      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: optionsWithDisabled,
        },
      });

      // 打开下拉框
      await wrapper.find('input').trigger('focus');
      await nextTick();

      // 尝试选择禁用的选项
      const vm = wrapper.vm as any;
      const disabledOption = optionsWithDisabled[1];

      // 禁用的选项应该不能被选中
      expect(vm.isSelected(disabledOption)).toBe(false);
    });

    it('should skip disabled options in keyboard navigation', async () => {
      const optionsWithDisabled: SuggestionOption[] = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b', disabled: true },
        { label: 'Option C', value: 'c' },
      ];

      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: optionsWithDisabled,
        },
      });

      const input = wrapper.find('input');

      // 打开下拉框
      await input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();

      const vm = wrapper.vm as any;
      expect(vm.selectedIndex).toBe(0); // Option A

      // 向下导航，应该跳过禁用的 Option B
      await input.trigger('keydown', { key: 'ArrowDown' });
      expect(vm.selectedIndex).toBe(2); // Option C
    });
  });

  // 触发方式测试
  describe('Trigger Modes', () => {
    it('should not open on input when trigger is manual', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          trigger: 'manual',
        },
      });

      const input = wrapper.find('input');
      await input.setValue('test');
      await nextTick();

      const vm = wrapper.vm as any;
      expect(vm.visible).toBe(false);
    });

    it('should open on focus when trigger is focus', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          trigger: 'focus',
        },
      });

      await wrapper.find('input').trigger('focus');
      await nextTick();

      const vm = wrapper.vm as any;
      expect(vm.visible).toBe(true);
    });
  });

  // 自定义类名测试
  describe('Custom Classes', () => {
    it('should apply custom class', () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: defaultOptions,
          customClass: 'my-custom-class',
        },
      });

      expect(wrapper.find('.my-custom-class').exists()).toBe(true);
    });
  });

  // 空状态测试
  describe('Empty State', () => {
    it('should show empty text when no options match', async () => {
      wrapper = mount(Suggestion, {
        props: {
          modelValue: '',
          options: [],
          emptyText: 'No suggestions',
        },
      });

      // 打开下拉框
      await wrapper.find('input').trigger('focus');
      await nextTick();

      // 检查空状态文本
      const vm = wrapper.vm as any;
      expect(vm.emptyText).toBe('No suggestions');
    });
  });
});
