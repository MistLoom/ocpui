import { ref, shallowRef, watch, type Ref } from 'vue';
import { compile, type CompileOptions, type CompileResult } from '@ocpui/markdown-core';

export interface UseMarkdownCompileOptions extends CompileOptions {
  /** 为 false 时不自动编译 */
  immediate?: boolean;
}

export function useMarkdownCompile(
  source: Ref<string | undefined> | string,
  options: UseMarkdownCompileOptions = {},
) {
  const { immediate = true, ...compileOptions } = options;
  const html = shallowRef('');
  const result = shallowRef<CompileResult | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function run(input?: string) {
    const text = input ?? (typeof source === 'string' ? source : source.value) ?? '';
    if (!text.trim()) {
      html.value = '';
      result.value = null;
      error.value = null;
      loading.value = false;
      return null;
    }

    loading.value = true;
    error.value = null;
    try {
      const compiled = await compile(text, compileOptions);
      html.value = compiled.html;
      result.value = compiled;
      return compiled;
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error(String(cause));
      html.value = '';
      result.value = null;
      return null;
    } finally {
      loading.value = false;
    }
  }

  if (typeof source !== 'string' && immediate) {
    watch(source, (value) => {
      void run(value);
    }, { immediate: true });
  } else if (immediate && typeof source === 'string') {
    void run(source);
  }

  return {
    html,
    result,
    loading,
    error,
    compile: run,
  };
}
