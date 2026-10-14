<!--
Modal 模态框（唯一模态基座）

职责：模态层的壳与系统协同——Teleport、overlay 栈（滚动锁 + W4 降焦 + 背景 inert + 焦点 trap/恢复）、
遮罩点击、Esc（按栈派发）、尺寸、响应式（移动端底部全宽）、头部/内容/底部结构。
ConfirmDialog 等确认类弹窗是本组件的内容预设，不再另起模态壳。

属性：
- modelValue: 是否显示（v-model），默认值：false
- title: 标题，默认值：''
- width: 显式宽度（number→px / string），提供时覆盖 size 推导出的宽度
- size: 尺寸，可选值：sm, md, lg, xl, full，默认值：md
- mask: 是否显示遮罩，默认值：true
- maskClosable: 点击遮罩是否可关闭，默认值：true
- closable: 是否显示关闭按钮，默认值：true
- closeOnEscape: 是否响应 Escape 关闭（经 overlay 栈按栈顶派发），默认值：true
- showHeader: 是否显示头部，默认值：true
- showFooter: 是否显示底部，默认值：true
- flush: 去除 body 内边距并启用 flex 纵向布局（全出血内容），默认值：false
- confirmText: 确认按钮文本，默认取 i18n
- cancelText: 取消按钮文本，默认取 i18n
- loading: 确认按钮 loading / 取消按钮禁用，默认值：false
- centered: 是否垂直居中，默认值：true
- blur: 是否对背景施加深降焦 blur，默认值：false
- role: 无障碍角色，'dialog' | 'alertdialog'，默认值：'dialog'
- customClass: 自定义类名，默认值：''

事件：
- update:modelValue: 更新可见状态
- confirm: 点击默认确认按钮（不自动关闭，由调用方按结果控制）
- cancel: 点击默认取消按钮（同时关闭）
- close: 请求关闭（遮罩 / 关闭按钮 / Esc / 取消）
- opened: 打开动画完成
- closed: 关闭动画完成

插槽：default（内容）、header（覆盖标题区）、footer（覆盖默认按钮）
-->
<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @after-enter="emit('opened')"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="modelValue"
        ref="modalRootRef"
        v-bind="overlayDispatch"
        class="modal-root"
        :class="[
          `modal--${size}`,
          { 'modal--centered': centered, 'modal--blur': blur },
          customClass,
        ]"
        :role="role"
        aria-modal="true"
        :aria-label="!showHeader && title ? title : undefined"
        :aria-labelledby="showHeader ? titleId : undefined"
        @click="handleRootClick"
      >
        <div
          v-if="mask"
          class="modal-mask"
          :class="{ 'modal-mask--clickable': maskClosable }"
        />

        <div
          ref="modalRef"
          class="modal-wrapper"
          :class="{ 'modal-wrapper--centered': centered }"
        >
          <div class="modal-content" :style="contentStyle" @click.stop>
            <div v-if="showHeader" class="modal-header">
              <slot name="header">
                <h3 :id="titleId" class="modal-title">{{ title }}</h3>
              </slot>
              <button
                v-if="closable"
                type="button"
                class="modal-close"
                :aria-label="t('components.feedback.modal.close')"
                @click="handleClose"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <div class="modal-body" :class="{ 'modal-body--no-header': !showHeader, 'modal-body--no-footer': !showFooter, 'modal-body--flush': flush }">
              <slot />
            </div>

            <div v-if="showFooter" class="modal-footer">
              <slot name="footer">
                <div class="modal-footer-actions">
                  <Button
                    variant="secondary"
                    :disabled="loading"
                    @click="handleCancel"
                  >
                    {{ cancelText || t('components.feedback.modal.defaultCancelText') }}
                  </Button>
                  <Button
                    variant="primary"
                    :loading="loading"
                    @click="handleConfirm"
                  >
                    {{ confirmText || t('components.feedback.modal.defaultOkText') }}
                  </Button>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '../utility/Button.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useComponentId } from '../../composables/useComponentId';
import { shellDispatchAttrs, useOverlayLayer } from '@ocpui/vue/system';

const { uiT: t } = useUiT();

const overlayDispatch = shellDispatchAttrs('overlay-host', 'restore-trigger');

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface Props {
  modelValue?: boolean;
  title?: string;
  width?: string | number;
  size?: ModalSize;
  mask?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  closeOnEscape?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  flush?: boolean;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  centered?: boolean;
  blur?: boolean;
  role?: 'dialog' | 'alertdialog';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  width: undefined,
  size: 'md',
  mask: true,
  maskClosable: true,
  closable: true,
  closeOnEscape: true,
  showHeader: true,
  showFooter: true,
  flush: false,
  confirmText: '',
  cancelText: '',
  loading: false,
  centered: true,
  blur: false,
  role: 'dialog',
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [visible: boolean];
  confirm: [];
  cancel: [];
  close: [];
  opened: [];
  closed: [];
}>();

const componentId = useComponentId('modal');
const titleId = `${componentId}-title`;

const modalRootRef = ref<HTMLElement>();
const modalRef = ref<HTMLElement>();

const sizeWidthMap: Record<ModalSize, string> = {
  sm: '400px',
  md: '520px',
  lg: '640px',
  xl: '800px',
  full: '100vw',
};

const contentStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  } else {
    style.width = sizeWidthMap[props.size];
  }

  if (props.size === 'full') {
    style.height = '100vh';
    style.maxHeight = '100vh';
    style.borderRadius = '0';
  }

  return style;
});

// 确认仅上抛事件，是否关闭由调用方按结果控制（与提交按钮 loading 语义一致）
const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
  handleClose();
};

const handleClose = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleRootClick = () => {
  if (props.maskClosable) {
    handleClose();
  }
};

/* overlay 统一收口：滚动锁 + W4 降焦 + 背景 inert + 焦点 trap/恢复；Esc 经栈按栈顶派发 */
const { afterLeave } = useOverlayLayer(computed(() => props.modelValue), {
  blur: computed(() => props.blur),
  container: modalRootRef,
  closeOnEscape: computed(() => props.closeOnEscape && props.closable),
  onRequestClose: handleClose,
});

const handleAfterLeave = () => {
  afterLeave();
  emit('closed');
};
</script>

<style scoped>
.modal-root {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-root:not(.modal--centered) {
  align-items: flex-start;
}

.modal-mask {
  position: absolute;
  inset: 0;
  background: hsl(var(--overlay) / 0.6);
}

.modal-mask--clickable {
  cursor: pointer;
}

.modal--blur .modal-mask {
  backdrop-filter: blur(4px);
}

.modal-wrapper {
  position: relative;
  width: 100%;
  max-height: calc(100vh - var(--space-8));
}

.modal-wrapper--centered {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: hsl(var(--surface));
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid hsl(var(--border));
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - var(--space-8));
  animation: modal-enter var(--duration-normal) var(--ease-out, var(--ease-standard));
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid hsl(var(--border) / 0.5);
  flex-shrink: 0;
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: hsl(var(--text));
  margin: 0;
  line-height: 1.4;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md-sm);
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.modal-close:hover {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
  transform: rotate(90deg);
}

.modal-close:active {
  transform: rotate(90deg) scale(0.96);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 0 var(--space-6);
  overflow-y: auto;
  flex: 1;
  color: hsl(var(--text-secondary));
}

.modal-body--no-header {
  padding-top: var(--space-6);
}

.modal-body--no-footer {
  padding-bottom: var(--space-6);
}

.modal-body--flush {
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid hsl(var(--border) / 0.5);
  flex-shrink: 0;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out, var(--ease-standard));
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: var(--transition-modal);
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* 响应式 */
@media (max-width: 639.98px) {
  .modal-root {
    padding: 0;
    align-items: flex-end;
  }

  .modal-wrapper {
    max-height: 100vh;
    width: 100%;
  }

  .modal-wrapper--centered {
    align-items: flex-end;
  }

  .modal-content {
    max-height: 90vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    animation: modal-enter-mobile var(--duration-normal) var(--ease-out, var(--ease-standard));
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .modal-body--flush {
    padding: 0;
  }

  .modal-footer-actions {
    flex-direction: column-reverse;
    gap: var(--space-2);
  }

  .modal-footer-actions :deep(.btn) {
    width: 100%;
  }
}

@keyframes modal-enter-mobile {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 平板适配 */
@media (min-width: 640px) and (max-width: 1023.98px) {
  .modal-content {
    max-width: 90vw;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .modal-content,
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-content,
  .modal-leave-active .modal-content {
    animation: none;
    transition: opacity var(--duration-fast);
  }
}
</style>
