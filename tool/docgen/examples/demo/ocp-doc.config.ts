import { defineDocgenConfig } from '@ocpui/docgen';

export default defineDocgenConfig({
  collections: [{ id: 'default', src: './docs', base: '/', title: 'OCP Docgen Demo' }],
  markdown: { plugins: ['gfm', 'slug', 'admonition', 'shiki', 'code-meta'] },
  theme: '@ocpui/docgen/theme-default',
  search: { provider: 'minisearch' },
  outDir: 'dist',
});
