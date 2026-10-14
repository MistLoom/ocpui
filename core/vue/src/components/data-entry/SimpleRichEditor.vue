&lt;!--
SimpleRichEditor 组件

功能：简单富文本编辑器，支持基本的文本格式化和链接插入

属性：
- modelValue: string - 编辑器内容
- placeholder: string - 占位文本
- disabled: boolean - 是否禁用
- showCount: boolean - 是否显示字数统计
- maxLength: number - 最大长度限制
- variableOptions: VariableOption[] - 变量选项
  - label: string - 变量标签
  - value: string - 变量值
- customClass: string - 自定义类名
- ariaLabel: string - 无障碍标签

事件：
- update:modelValue - 值变化时触发
- change - 值变化时触发

使用方式：
```vue
&lt;SimpleRichEditor
  v-model="content"
  placeholder="请输入内容..."
  :showCount="true"
  :maxLength="500"
  @change="handleChange"
/&gt;

&lt;!-- 带变量选项 --&gt;
&lt;SimpleRichEditor
  v-model="content"
  :variableOptions="[
    { label: '用户名', value: 'username' },
    { label: '日期', value: 'date' }
  ]"
/&gt;
```
--&gt;
<template>
  <div :class="editorClass" role="application" :aria-label="ariaLabel">
    <!-- 工具栏 -->
    <div class="editor-toolbar" role="toolbar" :aria-label="t('components.dataEntry.simpleRichEditor.toolbarAriaLabel')">
      <div class="editor-toolbar-group">
        <button
          v-for="tool in textTools"
          :key="tool.command"
          type="button"
          :class="['editor-toolbar-btn', { 'editor-toolbar-btn--active': tool.active }]"
          :title="tool.title"
          @click="execCommand(tool.command)"
          :aria-pressed="tool.active"
          :aria-label="tool.title"
        >
          <span v-html="tool.icon"></span>
        </button>
      </div>
      <div class="editor-toolbar-divider"></div>
      <div class="editor-toolbar-group">
        <button
          v-for="tool in alignTools"
          :key="tool.command"
          type="button"
          :class="['editor-toolbar-btn', { 'editor-toolbar-btn--active': tool.active }]"
          :title="tool.title"
          @click="execCommand(tool.command, tool.value)"
          :aria-pressed="tool.active"
          :aria-label="tool.title"
        >
          <span v-html="tool.icon"></span>
        </button>
      </div>
      <div class="editor-toolbar-divider"></div>
      <div class="editor-toolbar-group">
        <button
          type="button"
          class="editor-toolbar-btn"
          :title="t('components.dataEntry.simpleRichEditor.insertLink')"
          @click="showLinkDialog = true"
          :aria-label="t('components.dataEntry.simpleRichEditor.insertLink')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </button>
        <button
          type="button"
          class="editor-toolbar-btn"
          :title="t('components.dataEntry.simpleRichEditor.clearFormat')"
          @click="execCommand('removeFormat')"
          :aria-label="t('components.dataEntry.simpleRichEditor.clearFormat')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v4h4M21 17v-4h-4"/>
            <path d="M12 3v18"/>
          </svg>
        </button>
      </div>
      <div v-if="variableOptions.length > 0" class="editor-toolbar-divider"></div>
      <div v-if="variableOptions.length > 0" class="editor-toolbar-group">
        <Dropdown
          v-model="selectedVariable"
          :options="variableOptions"
          :placeholder="t('components.dataEntry.simpleRichEditor.insertVariable')"
          size="sm"
          @change="insertVariable"
          :aria-label="t('components.dataEntry.simpleRichEditor.insertVariable')"
        />
      </div>
    </div>

    <!-- 编辑区域 -->
    <div
      ref="editorRef"
      class="editor-content"
      :contenteditable="!disabled"
      :placeholder="placeholder"
      @input="handleInput"
      @keydown="handleKeydown"
      @mouseup="updateActiveStates"
      @keyup="updateActiveStates"
      role="textbox"
      :aria-label="ariaLabel"
      :aria-disabled="disabled"
      :aria-multiline="true"
      :aria-required="required"
      tabindex="0"
    ></div>

    <!-- 字数统计 -->
    <div v-if="showCount" class="editor-footer">
      <span class="editor-count" :aria-live="'polite'">
        {{ charCount }} {{ t('components.dataEntry.simpleRichEditor.charCountSuffix') }}
        <span v-if="maxLength" class="editor-count-limit"> / {{ maxLength }}</span>
      </span>
    </div>

    <!-- 链接对话框 -->
    <Modal
      v-model="showLinkDialog"
      :title="t('components.dataEntry.simpleRichEditor.insertLink')"
      :width="420"
      @confirm="insertLink"
    >
      <FormItem :label="t('components.dataEntry.simpleRichEditor.linkUrlLabel')">
        <Input v-model="linkUrl" placeholder="https://example.com" />
      </FormItem>
      <FormItem :label="t('components.dataEntry.simpleRichEditor.linkTextLabel')">
        <Input v-model="linkText" :placeholder="t('components.dataEntry.simpleRichEditor.linkTextPlaceholder')" />
      </FormItem>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { Dropdown } from '../navigation';
import Input from './Input.vue';
import FormItem from './FormItem.vue';
import { Modal } from '../feedback';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

export interface VariableOption {
  label: string;
  value: string;
}

interface Props {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  showCount?: boolean;
  maxLength?: number;
  variableOptions?: VariableOption[];
  customClass?: string;
  ariaLabel?: string;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  disabled: false,
  showCount: true,
  maxLength: undefined,
  variableOptions: () => [],
  customClass: '',
  ariaLabel: '富文本编辑器',
  required: false,
});

const emit = defineEmits<{
  'update:modelValue': [string];
  'change': [string];
  'error': [error: unknown];
}>();

const editorRef = ref<HTMLDivElement>();
const showLinkDialog = ref(false);
const linkUrl = ref('');
const linkText = ref('');
const selectedVariable = ref('');
const charCount = ref(0);
const lastValidContent = ref('');

const activeCommands = ref<Set<string>>(new Set());

const editorClass = computed(() => {
  const classes = ['simple-rich-editor'];
  if (props.disabled) {
    classes.push('simple-rich-editor--disabled');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const textTools = computed(() => [
  {
    command: 'bold',
    title: '粗体',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
    active: activeCommands.value.has('bold'),
  },
  {
    command: 'italic',
    title: '斜体',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
    active: activeCommands.value.has('italic'),
  },
  {
    command: 'underline',
    title: '下划线',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',
    active: activeCommands.value.has('underline'),
  },
  {
    command: 'strikeThrough',
    title: '删除线',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.3 19c.7-1.2 1-2.5 1-3.8 0-3.4-2.7-6.2-6-6.2H12"/><path d="M6.7 5C6 6.2 5.7 7.5 5.7 8.8c0 3.4 2.7 6.2 6 6.2H12"/><line x1="4" y1="12" x2="20" y2="12"/></svg>',
    active: activeCommands.value.has('strikeThrough'),
  },
]);

const alignTools = computed(() => [
  {
    command: 'justifyLeft',
    title: '左对齐',
    value: 'left',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>',
    active: activeCommands.value.has('justifyLeft'),
  },
  {
    command: 'justifyCenter',
    title: '居中对齐',
    value: 'center',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>',
    active: activeCommands.value.has('justifyCenter'),
  },
  {
    command: 'justifyRight',
    title: '右对齐',
    value: 'right',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>',
    active: activeCommands.value.has('justifyRight'),
  },
]);

const execCommand = (command: string, value?: string) => {
  if (props.disabled) return;
  try {
    document.execCommand(command, false, value);
    updateActiveStates();
    handleInput();
    editorRef.value?.focus();
  } catch (error) {
    emit('error', error);
    if (import.meta.env.DEV) console.warn('执行命令失败:', error);
  }
};

const insertLink = () => {
  if (linkUrl.value) {
    try {
      // 验证URL格式
      const url = new URL(linkUrl.value);
      const text = linkText.value || linkUrl.value;
      const html = `<a href="${url.href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      document.execCommand('insertHTML', false, html);
      handleInput();
    } catch (error) {
      emit('error', error);
      if (import.meta.env.DEV) console.warn('URL格式错误:', error);
    }
  }
  showLinkDialog.value = false;
  linkUrl.value = '';
  linkText.value = '';
};

const insertVariable = (value: string) => {
  if (value) {
    try {
      const variableHtml = `<span class="editor-variable" contenteditable="false">{{${value}}}</span>&nbsp;`;
      document.execCommand('insertHTML', false, variableHtml);
      handleInput();
      selectedVariable.value = '';
    } catch (error) {
      emit('error', error);
      if (import.meta.env.DEV) console.warn('插入变量失败:', error);
    }
  }
};

const handleInput = () => {
  if (!editorRef.value) return;
  
  const content = editorRef.value.innerHTML;
  const text = editorRef.value.innerText || '';

  if (props.maxLength && text.length > props.maxLength) {
    // 超出长度时回退到上一次有效内容，避免文本与 modelValue 不一致
    editorRef.value.innerHTML = lastValidContent.value;
    charCount.value = editorRef.value.innerText?.length || 0;
    return;
  }

  charCount.value = text.length;
  lastValidContent.value = content;

  emit('update:modelValue', content);
  emit('change', content);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) {
    e.preventDefault();
    return;
  }

  // 快捷键
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault();
        execCommand('bold');
        break;
      case 'i':
        e.preventDefault();
        execCommand('italic');
        break;
      case 'u':
        e.preventDefault();
        execCommand('underline');
        break;
      case 'k':
        e.preventDefault();
        showLinkDialog.value = true;
        break;
    }
  }
  
  // Tab键支持
  if (e.key === 'Tab') {
    e.preventDefault();
    document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    handleInput();
  }
};

const updateActiveStates = () => {
  if (props.disabled) return;
  
  try {
    const commands = ['bold', 'italic', 'underline', 'strikeThrough', 'justifyLeft', 'justifyCenter', 'justifyRight'];
    const active = new Set<string>();
    commands.forEach(cmd => {
      try {
        if (document.queryCommandState(cmd)) {
          active.add(cmd);
        }
      } catch (error) {
        // 忽略不支持的命令
      }
    });
    activeCommands.value = active;
  } catch (error) {
    emit('error', error);
    if (import.meta.env.DEV) console.warn('更新活动状态失败:', error);
  }
};

// 初始化内容
onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue;
    charCount.value = editorRef.value.innerText?.length || 0;
    lastValidContent.value = editorRef.value.innerHTML;
  }
});

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && newVal !== editorRef.value.innerHTML) {
    editorRef.value.innerHTML = newVal;
    charCount.value = editorRef.value.innerText?.length || 0;
    lastValidContent.value = editorRef.value.innerHTML;
  }
});

// 暴露方法
defineExpose({
  focus: () => editorRef.value?.focus(),
  blur: () => editorRef.value?.blur(),
  getContent: () => editorRef.value?.innerHTML || '',
  getText: () => editorRef.value?.innerText || '',
  clear: () => {
    if (editorRef.value) {
      editorRef.value.innerHTML = '';
      handleInput();
    }
  },
});
</script>

<style scoped>
.simple-rich-editor {
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  background: hsl(var(--surface));
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.simple-rich-editor:focus-within {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.simple-rich-editor--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.simple-rich-editor--disabled .editor-content {
  pointer-events: none;
}

/* 工具栏 */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--surface-container-high));
  flex-wrap: wrap;
}

.editor-toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.editor-toolbar-divider {
  width: 1px;
  height: 20px;
  background: hsl(var(--border));
}

.editor-toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  color: hsl(var(--text-secondary));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.editor-toolbar-btn:hover {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
}

.editor-toolbar-btn--active {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  border-color: hsl(var(--primary) / 0.3);
}

.editor-toolbar-btn svg {
  width: 16px;
  height: 16px;
}

/* 编辑区域 */
.editor-content {
  min-height: 200px;
  max-height: 400px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: hsl(var(--text));
  overflow-y: auto;
  outline: none;
}

.editor-content:empty::before {
  content: attr(placeholder);
  color: hsl(var(--text-muted));
  pointer-events: none;
}

.editor-content :deep(p) {
  margin: 0 0 12px;
}

.editor-content :deep(p:last-child) {
  margin-bottom: 0;
}

.editor-content :deep(a) {
  color: hsl(var(--primary));
  text-decoration: underline;
}

.editor-content :deep(.editor-variable) {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  user-select: none;
}

/* 底部 */
.editor-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--surface-container-high));
}

.editor-count {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

/* 响应式 */
@media (max-width: 575.98px) {
  .editor-toolbar {
    padding: 8px;
    gap: 4px;
  }

  .editor-toolbar-btn {
    width: 36px;
    height: 36px;
  }

  .editor-toolbar-btn svg {
    width: 18px;
    height: 18px;
  }

  .editor-content {
    min-height: 150px;
    padding: 12px;
    font-size: var(--font-size-sm);
  }
}
</style>
