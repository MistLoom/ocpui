import { describe, it, expect } from 'vitest';
import {
  resolveResponsiveValue,
  isResponsiveValue,
  type ResponsiveValue,
} from '../resolveResponsiveValue';

describe('isResponsiveValue', () => {
  it('原始值返回 false', () => {
    expect(isResponsiveValue(4)).toBe(false);
    expect(isResponsiveValue('md')).toBe(false);
  });

  it('断点对象返回 true', () => {
    expect(isResponsiveValue({ xs: 1, md: 4 })).toBe(true);
  });

  it('含非断点键的对象返回 false', () => {
    expect(isResponsiveValue({ xs: 1, foo: 2 })).toBe(false);
  });
});

describe('resolveResponsiveValue', () => {
  it('原始值直接返回', () => {
    expect(resolveResponsiveValue(4, 'md')).toBe(4);
    expect(resolveResponsiveValue('md', 'lg')).toBe('md');
  });

  it('当前断点命中时返回对应值', () => {
    const value: ResponsiveValue<number> = { xs: 1, sm: 2, md: 4 };
    expect(resolveResponsiveValue(value, 'md')).toBe(4);
    expect(resolveResponsiveValue(value, 'sm')).toBe(2);
    expect(resolveResponsiveValue(value, 'xs')).toBe(1);
  });

  it('当前断点未定义时向下级联', () => {
    const value: ResponsiveValue<number> = { xs: 1, md: 4 };
    expect(resolveResponsiveValue(value, 'sm')).toBe(1);
    expect(resolveResponsiveValue(value, 'lg')).toBe(4);
    expect(resolveResponsiveValue(value, 'xl')).toBe(4);
  });

  it('仅大断点有值时向上回退', () => {
    const value: ResponsiveValue<number> = { lg: 12 };
    expect(resolveResponsiveValue(value, 'xs')).toBe(12);
    expect(resolveResponsiveValue(value, 'md')).toBe(12);
  });

  it('完整级联 xs → sm → md → lg → xl → xxl', () => {
    const value: ResponsiveValue<string> = {
      xs: 'xs-val',
      sm: 'sm-val',
      md: 'md-val',
      lg: 'lg-val',
      xl: 'xl-val',
      xxl: 'xxl-val',
    };
    expect(resolveResponsiveValue(value, 'xxl')).toBe('xxl-val');
    expect(resolveResponsiveValue(value, 'xl')).toBe('xl-val');
    expect(resolveResponsiveValue(value, 'lg')).toBe('lg-val');
    expect(resolveResponsiveValue(value, 'md')).toBe('md-val');
    expect(resolveResponsiveValue(value, 'sm')).toBe('sm-val');
    expect(resolveResponsiveValue(value, 'xs')).toBe('xs-val');
  });

  it('部分级联：缺失中间断点时使用更小断点', () => {
    const value: ResponsiveValue<number> = { xs: 1, lg: 4 };
    expect(resolveResponsiveValue(value, 'md')).toBe(1);
    expect(resolveResponsiveValue(value, 'sm')).toBe(1);
  });

  it('未知断点名按 xs 处理', () => {
    const value: ResponsiveValue<number> = { xs: 1, md: 4 };
    expect(resolveResponsiveValue(value, 'unknown')).toBe(1);
  });

  it('空对象返回 undefined', () => {
    expect(resolveResponsiveValue({}, 'md')).toBeUndefined();
  });
});
