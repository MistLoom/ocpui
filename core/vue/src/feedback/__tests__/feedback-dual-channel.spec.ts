import { describe, it, expect } from 'vitest';
import { createUiFeedbackBridge } from '../feedback-bridge';

describe('useUiFeedback 双通道', () => {
  it('action 与 system 分责且扁平 API 保留', () => {
    const ctx = createUiFeedbackBridge();
    expect(ctx.action.dialog).toBe(ctx.dialog);
    expect(ctx.action.message).toBe(ctx.message);
    expect(ctx.system.notify).toBe(ctx.notify);
    expect(ctx.system.loading).toBe(ctx.loading);
    expect(ctx.message).toBeDefined();
    expect(ctx.notify).toBeDefined();
  });

  it('场景：用户确认走 action，系统推送走 system', () => {
    const ctx = createUiFeedbackBridge();
    expect(typeof ctx.action.dialog.confirm).toBe('function');
    expect(typeof ctx.system.notify.show).toBe('function');
  });
});
