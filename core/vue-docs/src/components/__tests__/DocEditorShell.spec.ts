import { describe, expect, it, vi, beforeEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { toast } from '@ocpui/vue';
import { DocEditorConflictError } from '../../composables/useDocEditor.js';
import DocEditorShell, { type DocEditorMode } from '../DocEditorShell.vue';

vi.mock('@ocpui/vue/feedback', () => ({
  Modal: defineComponent({
    name: 'Modal',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div v-if="modelValue" class="modal-stub"><slot /><slot name="footer" /></div>',
  }),
  Drawer: defineComponent({
    name: 'Drawer',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div v-if="modelValue" class="drawer-stub"><slot /></div>',
  }),
}));

vi.mock('@ocpui/vue', () => ({
  UiScenarioScope: defineComponent({
    name: 'UiScenarioScope',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  }),
  Button: defineComponent({
    name: 'Button',
    props: { loading: Boolean, disabled: Boolean },
    emits: ['click'],
    template: '<button class="btn-stub" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  }),
  SegmentedControl: defineComponent({
    name: 'SegmentedControl',
    props: ['modelValue', 'options'],
    emits: ['update:modelValue'],
    template:
      '<div class="mode-stub"><button v-for="o in options" :key="o.value" class="mode-opt" @click="$emit(\'update:modelValue\', o.value)">{{ o.label }}</button></div>',
  }),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../DocEditToolbar.vue', () => ({
  default: defineComponent({
    name: 'DocEditToolbar',
    props: ['mode', 'dirty', 'saving'],
    emits: ['save', 'update:mode', 'open-meta'],
    template:
      '<div class="toolbar-stub"><button class="tb-save" @click="$emit(\'save\')" />' +
      '<button class="tb-source" @click="$emit(\'update:mode\', \'source\')" />' +
      '<button class="tb-split" @click="$emit(\'update:mode\', \'split\')" />' +
      '<button class="tb-wysiwyg" @click="$emit(\'update:mode\', \'wysiwyg\')" />' +
      '<button class="tb-meta" @click="$emit(\'open-meta\')" /></div>',
  }),
}));

vi.mock('../DocMarkdownEditor.vue', () => ({
  default: defineComponent({
    name: 'DocMarkdownEditor',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<textarea class="editor-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  }),
}));

vi.mock('../DocVisualEditor.vue', () => ({
  default: defineComponent({
    name: 'DocVisualEditor',
    props: ['modelValue'],
    emits: ['update:modelValue', 'error', 'ready'],
    template:
      '<textarea class="visual-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  }),
}));

vi.mock('../DocFrontmatterPanel.vue', () => ({
  default: defineComponent({
    name: 'DocFrontmatterPanel',
    props: ['frontmatter'],
    emits: ['update:frontmatter'],
    template: '<div class="frontmatter-stub" />',
  }),
}));

vi.mock('../MarkdownBody.vue', () => ({
  default: defineComponent({
    name: 'MarkdownBody',
    props: ['source'],
    template: '<div class="markdown-body-stub">{{ source }}</div>',
  }),
}));

describe('DocEditorShell', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it('默认所见即所得模式：正文编辑器不含 frontmatter', async () => {
    const wrapper = mount(DocEditorShell, {
      props: { initialSource: '---\ntitle: T\n---\n\n# 正文\n' },
    });
    await flushPromises();

    expect(wrapper.find('.doc-editor-shell').exists()).toBe(true);
    expect(wrapper.find('.visual-stub').exists()).toBe(true);
    // 编辑器拿到的是剥离 frontmatter 的正文
    expect((wrapper.find('.visual-stub').element as HTMLTextAreaElement).value).toContain('# 正文');
    expect((wrapper.find('.visual-stub').element as HTMLTextAreaElement).value).not.toContain('title: T');
  });

  it('元数据默认隐藏，经工具栏入口在 Drawer 中展开', async () => {
    const wrapper = mount(DocEditorShell, {
      props: { initialSource: '# A' },
    });
    await flushPromises();

    expect(wrapper.find('.frontmatter-stub').exists()).toBe(false);
    await wrapper.find('.tb-meta').trigger('click');
    await flushPromises();
    expect(wrapper.find('.drawer-stub .frontmatter-stub').exists()).toBe(true);
  });

  it('三模式切换：wysiwyg / source / split', async () => {
    const wrapper = mount(DocEditorShell, {
      props: { initialSource: '# A' },
    });
    await flushPromises();
    expect(wrapper.find('.visual-stub').exists()).toBe(true);

    await wrapper.find('.tb-source').trigger('click');
    await flushPromises();
    expect(wrapper.find('.editor-stub').exists()).toBe(true);
    expect(wrapper.find('.markdown-body-stub').exists()).toBe(false);

    await wrapper.find('.tb-split').trigger('click');
    await flushPromises();
    expect(wrapper.find('.editor-stub').exists()).toBe(true);
    expect(wrapper.find('.markdown-body-stub').exists()).toBe(true);

    await wrapper.find('.tb-wysiwyg').trigger('click');
    await flushPromises();
    expect(wrapper.find('.visual-stub').exists()).toBe(true);
    expect(wrapper.find('.markdown-body-stub').exists()).toBe(false);
  });

  it('正文编辑同步到 markdown（frontmatter 保留）', async () => {
    const wrapper = mount(DocEditorShell, {
      props: { initialSource: '---\ntitle: T\n---\n\n# A' },
    });
    await flushPromises();

    await wrapper.find('.tb-source').trigger('click');
    await flushPromises();
    const editor = wrapper.find('.editor-stub');
    await editor.setValue('# A 改动');
    await flushPromises();

    const emitted = wrapper.emitted('update:markdown')?.at(-1)?.[0] as string;
    expect(emitted).toContain('title: T');
    expect(emitted).toContain('# A 改动');
  });

  it('可视化解析失败回退源码模式', async () => {
    const wrapper = mount(DocEditorShell, {
      props: { initialSource: '# A' },
    });
    await flushPromises();

    const visual = wrapper.findComponent({ name: 'DocVisualEditor' });
    visual.vm.$emit('error', '解析失败');
    await flushPromises();

    expect((wrapper.vm as unknown as { mode: DocEditorMode }).mode).toBe('source');
    expect(wrapper.find('.editor-stub').exists()).toBe(true);
  });

  it('保存调用 saveRequest 并回传结果', async () => {
    const saveRequest = vi.fn(async () => ({ revision: 'rev-2' }));
    const wrapper = mount(DocEditorShell, {
      props: { initialSource: '# A', defaultMode: 'source', saveRequest },
    });
    await flushPromises();

    await wrapper.find('.editor-stub').setValue('# A 改动');
    await wrapper.find('.tb-save').trigger('click');
    await flushPromises();

    expect(saveRequest).toHaveBeenCalled();
    expect(wrapper.emitted('save')?.[0]?.[0]).toEqual(
      expect.objectContaining({ revision: 'rev-2', markdown: expect.stringContaining('# A 改动') }),
    );
    expect(toast.success).toHaveBeenCalledWith('已保存');
  });

  it('保存失败时提示错误', async () => {
    const saveRequest = vi.fn(async () => {
      throw new Error('磁盘写入失败');
    });
    const wrapper = mount(DocEditorShell, {
      props: { initialSource: '# A', defaultMode: 'source', saveRequest },
    });
    await flushPromises();

    await wrapper.find('.editor-stub').setValue('# A 改动');
    await wrapper.find('.tb-save').trigger('click');
    await flushPromises();

    expect(toast.error).toHaveBeenCalledWith('磁盘写入失败');
    expect(wrapper.emitted('save')).toBeUndefined();
  });

  it('冲突时打开对话框', async () => {
    const saveRequest = vi.fn(async () => {
      throw new DocEditorConflictError('conflict', '# Remote', 'rev-remote');
    });
    const wrapper = mount(DocEditorShell, {
      props: { initialSource: '# Local', defaultMode: 'source', saveRequest },
    });
    await flushPromises();

    await wrapper.find('.editor-stub').setValue('# Local edit');
    await wrapper.find('.tb-save').trigger('click');
    await flushPromises();

    expect(wrapper.find('.modal-stub').exists()).toBe(true);
  });
});
