import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createDialogChannel,
  dialogQueue,
  removeDialogItem,
} from '../channels/dialog-channel';

describe('dialog-channel', () => {
  beforeEach(() => {
    dialogQueue.value = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('confirm 入队并 resolve 结果', async () => {
    const channel = createDialogChannel();
    const promise = channel.confirm({ title: '删除', content: '确定删除？' });

    expect(dialogQueue.value).toHaveLength(1);
    expect(dialogQueue.value[0].title).toBe('删除');
    expect(dialogQueue.value[0].content).toBe('确定删除？');
    expect(dialogQueue.value[0].maskClosable).toBe(false);

    const id = dialogQueue.value[0].id;
    removeDialogItem(id, true);
    vi.runAllTimers();
    await expect(promise).resolves.toBe(true);
  });

  it('confirm 使用默认文案', () => {
    const channel = createDialogChannel();
    channel.confirm({});

    expect(dialogQueue.value[0].title).toBe('确认');
    expect(dialogQueue.value[0].content).toBe('确定要执行此操作吗？');
    expect(dialogQueue.value[0].confirmText).toBe('确定');
    expect(dialogQueue.value[0].cancelText).toBe('取消');
  });

  it('show 返回 close 句柄', () => {
    const channel = createDialogChannel();
    const { close } = channel.show({ title: '提示', content: '内容', size: 'lg' });

    expect(dialogQueue.value).toHaveLength(1);
    expect(dialogQueue.value[0].size).toBe('lg');
    expect(dialogQueue.value[0].maskClosable).toBe(true);

    close();
    expect(dialogQueue.value[0].visible).toBe(false);
  });

  it('removeDialogItem 超时后移出队列', () => {
    const channel = createDialogChannel();
    channel.show({ title: 'x', content: 'y' });
    const id = dialogQueue.value[0].id;

    removeDialogItem(id, false);
    expect(dialogQueue.value).toHaveLength(1);

    vi.advanceTimersByTime(280);
    expect(dialogQueue.value).toHaveLength(0);
  });
});
