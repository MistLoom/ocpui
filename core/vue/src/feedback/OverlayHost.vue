<template>
  <ConfirmDialog
    v-for="item in dialogQueue"
    :key="item.id"
    v-model="item.visible"
    :title="item.title"
    :content="item.content"
    :type="item.type"
    :size="item.size"
    :confirm-text="item.confirmText"
    :cancel-text="item.cancelText"
    :mask-closable="item.maskClosable"
    @confirm="onConfirm(item)"
    @cancel="onDismiss(item, false)"
  />
</template>

<script setup lang="ts">
import ConfirmDialog from '../components/feedback/ConfirmDialog.vue';
import {
  dialogQueue,
  removeDialogItem,
  type DialogQueueItem,
} from './channels/dialog-channel';

async function onConfirm(item: DialogQueueItem): Promise<void> {
  try {
    await item.onConfirm?.();
    onDismiss(item, true);
  } catch {
    /* 调用方自行处理错误；确认弹窗保持打开 */
  }
}

function onDismiss(item: DialogQueueItem, result: boolean): void {
  if (!result) item.onCancel?.();
  removeDialogItem(item.id, result);
}
</script>
