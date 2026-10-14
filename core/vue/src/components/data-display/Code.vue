&lt;!--
代码展示组件

Props:
- language?: string - 代码语言，默认值：'text'
- copyable?: boolean - 是否可复制，默认值：false
- showHeader?: boolean - 是否显示头部，默认值：false
- customClass?: string - 自定义类名

Usage:
&lt;Code language="javascript" :copyable="true" :showHeader="true"&gt;
  function hello() {
    console.log('Hello world!');
  }
&lt;/Code&gt;
--&gt;
<template>
  <div :class="codeClass">
    <div v-if="showHeader" class="code-header">
      <span class="code-language">{{ language }}</span>
      <button
        v-if="copyable"
        type="button"
        class="code-copy-btn"
        @click="handleCopy"
        :aria-label="copied ? t('components.dataDisplay.code.copied') : t('components.dataDisplay.code.copyCode')"
      >
        <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>{{ copied ? t('components.dataDisplay.code.copied') : t('components.dataDisplay.code.copy') }}</span>
      </button>
    </div>
    <div class="code-content">
      <pre class="code-pre"><code ref="codeRef" :class="`language-${language}`"><slot /></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface Props {
  language?: string;
  copyable?: boolean;
  showHeader?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  language: 'text',
  copyable: false,
  showHeader: false,
  customClass: '',
});

const copied = ref(false);
const codeRef = ref<HTMLElement | null>(null);

const codeClass = computed(() => {
  const classes = ['code'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const handleCopy = async () => {
  const code = codeRef.value?.textContent || '';
  try {
    await navigator.clipboard.writeText(code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
  }
};
</script>

<style scoped>
.code {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  overflow: hidden;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: hsl(var(--surface));
  border-bottom: 1px solid hsl(var(--border));
}

.code-language {
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--text-muted));
  text-transform: uppercase;
}

.code-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  font-size: 12px;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.code-copy-btn:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.code-copy-btn svg {
  width: 14px;
  height: 14px;
}

.code-content {
  padding: 16px;
  overflow-x: auto;
}

.code-pre {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: hsl(var(--text));
}

.code-pre code {
  font-family: inherit;
}
</style>
