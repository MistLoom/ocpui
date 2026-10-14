<!--
ConfirmDialog 确认对话框（Modal 的内容预设）

职责：在唯一模态基座 Modal 上预置「类型图标 + 标题 + 说明 + 取消/确认」结构，
不另起模态壳（Teleport / overlay 栈 / 焦点 trap / 遮罩 / Esc 全部复用 Modal）。
命令式 dialog.confirm() 经 OverlayHost 渲染本组件。

属性：
- modelValue: 是否显示（v-model），默认值：false
- type: 类型，可选值：default, info, warning, danger，默认值：default
- title: 标题，默认值：''
- content: 说明文本，默认值：''
- size: 尺寸，可选值：sm, md, lg，默认值：sm
- confirmText: 确认按钮文本，默认取 i18n
- cancelText: 取消按钮文本，默认取 i18n
- loading: 确认按钮 loading / 取消按钮禁用，默认值：false
- closable: 是否显示关闭按钮，默认值：true
- maskClosable: 点击遮罩是否可关闭，默认值：false（破坏性确认默认防误触）
- closeOnEscape: 是否响应 Escape 关闭，默认值：true

事件：
- update:modelValue: 更新可见状态
- confirm: 点击确认（不自动关闭，由调用方按结果控制）
- cancel: 点击取消 / 关闭按钮 / 遮罩 / Esc（同时关闭）
-->
<template>
  <Modal
    :model-value="modelValue"
    :size="size"
    :show-header="false"
    :closable="closable"
    :mask-closable="maskClosable"
    :close-on-escape="closeOnEscape"
    role="alertdialog"
    custom-class="confirm-dialog"
    :class="`confirm-dialog--${type}`"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
    @close="handleCancel"
  >
    <div class="confirm-dialog-icon" :class="`confirm-dialog-icon--${type}`" aria-hidden="true">
      <svg v-if="type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 9v4M12 17h.01" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else-if="type === 'danger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M15 9l-6 6M9 9l6 6" stroke-linecap="round"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <h3 class="confirm-dialog-title">{{ title }}</h3>
    <p class="confirm-dialog-description">{{ content }}</p>

    <template #footer>
      <div class="confirm-dialog-footer">
        <Button
          variant="secondary"
          :size="buttonSize"
          :disabled="loading"
          @click="handleCancel"
        >
          {{ cancelText || t('components.feedback.modal.defaultCancelText') }}
        </Button>
        <Button
          :variant="type === 'danger' ? 'danger' : 'primary'"
          :size="buttonSize"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText || t('components.feedback.modal.defaultOkText') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from '../utility/Button.vue';
import Modal from './Modal.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import type { ConfirmType } from './confirm-dialog.types';

const { uiT: t } = useUiT();

type ConfirmSize = 'sm' | 'md' | 'lg';

interface Props {
  modelValue?: boolean;
  type?: ConfirmType;
  title?: string;
  content?: string;
  size?: ConfirmSize;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  closeOnEscape?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  type: 'default',
  title: '',
  content: '',
  size: 'sm',
  confirmText: '',
  cancelText: '',
  loading: false,
  closable: true,
  maskClosable: false,
  closeOnEscape: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const buttonSize = computed(() => (props.size === 'lg' ? 'lg' : 'md'));

// 确认仅上抛；是否关闭由调用方按提交结果控制（配合 loading）
const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('update:modelValue', false);
  emit('cancel');
};
</script>

<style scoped>
.confirm-dialog :deep(.modal-body) {
  padding-top: var(--space-8);
  text-align: center;
}

.confirm-dialog-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--space-4);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog-icon svg {
  width: 28px;
  height: 28px;
}

.confirm-dialog-icon--default {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.confirm-dialog-icon--info {
  background: hsl(var(--info) / 0.1);
  color: hsl(var(--info));
}

.confirm-dialog-icon--warning {
  background: hsl(var(--warning) / 0.15);
  color: hsl(var(--warning));
}

.confirm-dialog-icon--danger {
  background: hsl(var(--error) / 0.1);
  color: hsl(var(--error));
}

.confirm-dialog-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: hsl(var(--text));
  margin: 0 0 var(--space-3);
  line-height: 1.4;
}

.confirm-dialog-description {
  font-size: var(--font-size-md);
  color: hsl(var(--text-secondary));
  margin: 0;
  line-height: 1.6;
}

.confirm-dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

@media (max-width: 639.98px) {
  .confirm-dialog-footer {
    flex-direction: column-reverse;
    gap: var(--space-2);
  }

  .confirm-dialog-footer :deep(.btn) {
    width: 100%;
  }
}
</style>
