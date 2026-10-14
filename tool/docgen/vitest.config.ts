import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markdownCoreRoot = path.resolve(__dirname, '../markdown-core/src/index.ts');

export default defineConfig({
  resolve: {
    alias: {
      '@ocpui/markdown-core': markdownCoreRoot,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
