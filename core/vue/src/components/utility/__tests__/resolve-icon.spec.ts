import { describe, expect, it } from 'vitest';
import {
  resolveLucideIcon,
  toKebabIconName,
  toPascalIconName,
} from '../resolve-icon';

describe('toKebabIconName', () => {
  it('PascalCase 转 kebab-case', () => {
    expect(toKebabIconName('LayoutDashboard')).toBe('layout-dashboard');
    expect(toKebabIconName('FileText')).toBe('file-text');
    expect(toKebabIconName('Building2')).toBe('building-2');
  });

  it('去掉 Lucide / Icon 前后缀', () => {
    expect(toKebabIconName('LayoutDashboardIcon')).toBe('layout-dashboard');
    expect(toKebabIconName('LucideSettings')).toBe('settings');
  });

  it('已是 kebab-case 时保持不变', () => {
    expect(toKebabIconName('file-text')).toBe('file-text');
  });
});

describe('toPascalIconName', () => {
  it('kebab-case 转 PascalCase', () => {
    expect(toPascalIconName('layout-dashboard')).toBe('LayoutDashboard');
    expect(toPascalIconName('file-text')).toBe('FileText');
    expect(toPascalIconName('building-2')).toBe('Building2');
  });

  it('已是 PascalCase 时保持不变', () => {
    expect(toPascalIconName('LayoutDashboard')).toBe('LayoutDashboard');
    expect(toPascalIconName('Building2')).toBe('Building2');
  });
});

describe('resolveLucideIcon', () => {
  it('解析菜单种子使用的 PascalCase 名', () => {
    expect(resolveLucideIcon('LayoutDashboard')).toBeTruthy();
    expect(resolveLucideIcon('Building2')).toBeTruthy();
    expect(resolveLucideIcon('FileEdit')).toBeTruthy();
    expect(resolveLucideIcon('FormInput')).toBeTruthy();
    expect(resolveLucideIcon('ShieldCheck')).toBeTruthy();
  });

  it('解析 kebab-case 名', () => {
    expect(resolveLucideIcon('layout-dashboard')).toBeTruthy();
    expect(resolveLucideIcon('file-text')).toBeTruthy();
  });

  it('解析业务别名', () => {
    expect(resolveLucideIcon('delete')).toBeTruthy();
    expect(resolveLucideIcon('close')).toBeTruthy();
    expect(resolveLucideIcon('loading')).toBeTruthy();
    expect(resolveLucideIcon('dashboard')).toBeTruthy();
  });

  it('未知名称返回 null', () => {
    expect(resolveLucideIcon('not-a-real-icon-xyz')).toBeNull();
    expect(resolveLucideIcon('')).toBeNull();
  });
});
