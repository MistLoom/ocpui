import { describe, expect, it } from 'vitest';
import { inferFenceLanguage } from '../shiki/infer-fence-lang.js';

describe('inferFenceLanguage', () => {
  it('识别容器链树形结构', () => {
    const source = `UiRoot                         # 全局
 └─ UiScenarioScope            # 可选
     └─ AppShell`;
    expect(inferFenceLanguage(source)).toBe('tree');
  });

  it('识别目录路径列表', () => {
    expect(inferFenceLanguage('apps/admin/src/ui-business/\napps/admin/src/pages/')).toBe('tree');
  });

  it('识别优先级链', () => {
    expect(inferFenceLanguage('焦点 > 呈现模式 > 元素 > 样式')).toBe('tree');
  });

  it('普通文本返回 null', () => {
    expect(inferFenceLanguage('plain text')).toBeNull();
  });
});
