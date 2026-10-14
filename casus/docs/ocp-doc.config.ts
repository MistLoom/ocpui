import { defineDocgenConfig } from '@ocpui/docgen';

export default defineDocgenConfig({
  collections: [{ id: 'ocpui', src: '.', base: '/', title: 'OCP UI' }],
  markdown: { plugins: ['gfm', 'slug', 'admonition', 'demo', 'infer-fence-lang', 'shiki', 'code-meta', 'doc-code-block', 'glossary', 'cross-doc'] },
  theme: '@ocpui/docgen/theme-default',
  search: { provider: 'minisearch' },
  edit: { enabled: true },
  outDir: 'dist',
});
