import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import DocMarkdownEditor from '../DocMarkdownEditor.vue';

describe('DocMarkdownEditor', () => {
  it('textarea 始终展示初始正文', async () => {
    const wrapper = mount(DocMarkdownEditor, {
      props: {
        modelValue: '# Hello\n\nvisible body',
      },
      attachTo: document.body,
    });
    await flushPromises();
    await nextTick();
    await nextTick();

    const area = wrapper.find('textarea.doc-markdown-editor__fallback');
    expect(area.exists()).toBe(true);
    expect((area.element as HTMLTextAreaElement).value).toContain('# Hello');
    expect((area.element as HTMLTextAreaElement).value).toContain('visible body');

    wrapper.unmount();
  });

  it('props 更新时同步到 textarea（未挂上 CM 时）', async () => {
    const wrapper = mount(DocMarkdownEditor, {
      props: { modelValue: 'old' },
      attachTo: document.body,
    });
    await flushPromises();
    await nextTick();

    await wrapper.setProps({ modelValue: '# Late\n\narrived' });
    await flushPromises();
    await nextTick();

    const area = wrapper.find('textarea.doc-markdown-editor__fallback');
    expect((area.element as HTMLTextAreaElement).value).toContain('# Late');
    expect((area.element as HTMLTextAreaElement).value).toContain('arrived');

    wrapper.unmount();
  });
});
