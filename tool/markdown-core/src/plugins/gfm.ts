import remarkGfm from 'remark-gfm';
import type { OcpMarkdownPlugin } from '../types.js';

/** GFM：表格、任务列表、删除线等 */
export const gfmPlugin: OcpMarkdownPlugin = {
  id: 'gfm',
  remarkPlugins: [remarkGfm],
};
