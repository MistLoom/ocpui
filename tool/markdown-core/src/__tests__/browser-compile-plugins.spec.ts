import { describe, expect, it } from 'vitest';
import { resolveBrowserCompilePluginList } from '../plugins/precompile-plugins.js';

describe('resolveBrowserCompilePluginList', () => {
  it('剔除 shiki 插件 id', () => {
    expect(
      resolveBrowserCompilePluginList(['gfm', 'shiki', 'slug']),
    ).toEqual(['gfm', 'slug']);
  });

  it('剔除 shiki 插件对象', () => {
    expect(
      resolveBrowserCompilePluginList([
        'gfm',
        { id: 'shiki', remarkPlugins: [], rehypePlugins: [] },
      ]),
    ).toEqual(['gfm']);
  });
});
