import { describe, expect, it } from 'vitest';
import { useDocEditor, DocEditorConflictError } from '../useDocEditor.js';

describe('useDocEditor', () => {
  it('dirty 随编辑变化', async () => {
    const editor = useDocEditor({ initialSource: '# A' });
    expect(editor.dirty.value).toBe(false);
    editor.markdown.value = '# B';
    expect(editor.dirty.value).toBe(true);
  });

  it('冲突错误打开对话框状态', async () => {
    const editor = useDocEditor({
      initialSource: '# Local',
      onSave: async () => {
        throw new DocEditorConflictError('conflict', '# Remote', 'rev-2');
      },
    });

    editor.markdown.value = '# Local edit';
    await editor.save();
    expect(editor.conflictOpen.value).toBe(true);
    expect(editor.remoteMarkdown.value).toBe('# Remote');
  });
});
