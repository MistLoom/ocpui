import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeDocgenConfig } from '../src/config.ts';
import { buildRuntimePayload } from '../src/core/build-artifacts.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../casus/docs');
const theme = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme-default');

const cfg = normalizeDocgenConfig(
  root,
  {
    collections: [{ id: 'ocpui', src: '.', base: '/', title: 'OCP' }],
    markdown: {
      plugins: ['gfm', 'slug', 'admonition', 'code-meta', 'shiki', 'doc-code-block', 'glossary', 'cross-doc'],
    },
  },
  theme,
);

const payload = await buildRuntimePayload(cfg);
const source = payload.collections[0]?.sources.find((item) => item.path.includes('admin-app-shell'));

console.log('source:', source?.path);
console.log('compiledHtml length:', source?.compiledHtml?.length ?? 0);
console.log('has highlight:', source?.compiledHtml?.includes('style=') ?? false);
console.log('snippet:', source?.compiledHtml?.match(/<pre[\s\S]{0,500}/)?.[0]);
