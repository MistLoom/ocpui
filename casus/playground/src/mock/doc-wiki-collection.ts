import type { DocCollection } from '@ocpui/markdown-core';
import { DOC_API_SAMPLE } from './doc-api-sample';
import { DOC_READER_SAMPLE } from './doc-reader-sample';

/** Playground Wiki 文档集 */
export const PLAYGROUND_DOC_COLLECTION: DocCollection = {
  id: 'playground-wiki',
  title: 'Playground 文档',
  basePath: '/wiki',
  defaultLocale: 'zh',
  sources: [
    {
      id: 'manual',
      path: 'manual/index.md',
      content: DOC_READER_SAMPLE,
      frontmatter: { title: '平台操作手册', order: 1 },
      body: '',
    },
    {
      id: 'api',
      path: 'api/compile.md',
      content: DOC_API_SAMPLE,
      frontmatter: { title: '编译 API', order: 2 },
      body: '',
    },
  ],
};
