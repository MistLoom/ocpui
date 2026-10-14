import { describe, expect, it } from 'vitest';
import { compile } from '../compile.js';

describe('demo plugin', () => {
  it('编译 ::: demo 为可挂载占位', async () => {
    const source = `# Demo

::: demo
\`\`\`vue
<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>
<template>
  <button @click="count++">{{ count }}</button>
</template>
\`\`\`
:::
`;
    const result = await compile(source, {
      plugins: ['gfm', 'slug', 'admonition', 'demo'],
    });
    expect(result.html).toContain('doc-demo');
    expect(result.html).toContain('data-doc-demo-id');
    expect(result.html).toContain('doc-demo__preview');
    expect(result.html).toContain('language-vue');
  });
});
