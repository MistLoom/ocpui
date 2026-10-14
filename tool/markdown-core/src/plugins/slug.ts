import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { OcpMarkdownPlugin } from '../types.js';

export interface SlugPluginOptions {
  autolinkHeadings?: boolean;
}

/** 标题 slug + 可选 autolink 锚点（主流 append：标题右侧 #） */
export function createSlugPlugin(options: SlugPluginOptions = {}): OcpMarkdownPlugin {
  const { autolinkHeadings = true } = options;
  const rehypePlugins: OcpMarkdownPlugin['rehypePlugins'] = [rehypeSlug];

  if (autolinkHeadings) {
    rehypePlugins.push([
      rehypeAutolinkHeadings,
      {
        behavior: 'append',
        content: {
          type: 'text',
          value: '#',
        },
        properties: {
          className: ['doc-heading-anchor'],
          ariaHidden: 'true',
          tabIndex: -1,
        },
      },
    ]);
  }

  return {
    id: 'slug',
    rehypePlugins,
  };
}

/** 默认 slug 插件（含 autolink） */
export const slugPlugin = createSlugPlugin();
