&lt;!--
Popconfirm 气泡确认组件

属性：
- title: 标题，默认值：'确定执行此操作吗？'
- description: 描述，默认值：''
- confirmText: 确认按钮文本，默认值：'确定'
- cancelText: 取消按钮文本，默认值：'取消'
- type: 类型，可选值：default, warning, error，默认值：default
- placement: 位置，可选值：top, bottom, left, right，默认值：bottom
- disabled: 是否禁用，默认值：false
- offset: 偏移量，默认值：8
- customClass: 自定义类名，默认值：''
- visible: 是否可见，默认值：false
- confirmLoading: 确认按钮加载状态，默认值：false
- cancelDisabled: 取消按钮禁用状态，默认值：false
- confirmDisabled: 确认按钮禁用状态，默认值：false

事件：
- confirm: 确认时触发
- cancel: 取消时触发
- update:visible: 更新可见状态时触发

使用方式：
&lt;Popconfirm
  title="确定删除吗？"
  description="此操作不可恢复"
  type="error"
  @confirm="handleConfirm"
  @cancel="handleCancel"
&gt;
  &lt;template #trigger&gt;
    &lt;Button variant="danger"&gt;删除&lt;/Button&gt;
  &lt;/template&gt;
&lt;/Popconfirm&gt;
--&gt;
<template>
  <Popover
    v-model="visible"
    :placement="placement"
    :disabled="disabled"
    :offset="offset"
    :customClass="customClass"
  >
    <template #trigger>
      <slot name="trigger" />
    </template>
    <div class="popconfirm-content">
      <div class="popconfirm-icon" :class="`popconfirm-icon-${type}`">
        <svg v-if="type === 'warning'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
        </svg>
        <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z"/>
        </svg>
      </div>
      <div class="popconfirm-body">
        <div class="popconfirm-title">{{ title }}</div>
        <div v-if="description" class="popconfirm-description">{{ description }}</div>
      </div>
    </div>
    <div class="popconfirm-actions">
      <button
        type="button"
        class="popconfirm-btn popconfirm-btn-cancel"
        @click="handleCancel"
        :disabled="cancelDisabled"
      >
        {{ cancelText }}
      </button>
      <button
        type="button"
        class="popconfirm-btn popconfirm-btn-confirm"
        :class="`popconfirm-btn-${type}`"
        @click="handleConfirm"
        :disabled="confirmDisabled || confirmLoading"
        :aria-busy="confirmLoading"
      >
        {{ confirmText }}
      </button>
    </div>
  </Popover>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Popover from './Popover.vue';

interface Props {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'warning' | 'error';
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
  offset?: number;
  customClass?: string;
  visible?: boolean;
  confirmLoading?: boolean;
  cancelDisabled?: boolean;
  confirmDisabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '确定执行此操作吗？',
  description: '',
  confirmText: '确定',
  cancelText: '取消',
  type: 'default',
  placement: 'bottom',
  disabled: false,
  offset: 8,
  customClass: '',
  visible: false,
  confirmLoading: false,
  cancelDisabled: false,
  confirmDisabled: false,
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  'update:visible': [value: boolean];
}>();

const visible = ref(props.visible);

watch(
  () => props.visible,
  (v) => {
    visible.value = v;
  }
);

watch(visible, (v) => {
  emit('update:visible', v);
});

const handleConfirm = () => {
  visible.value = false;
  emit('update:visible', false);
  emit('confirm');
};

const handleCancel = () => {
  visible.value = false;
  emit('update:visible', false);
  emit('cancel');
};
</script>

<style scoped>
.popconfirm-content {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.popconfirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.popconfirm-icon svg {
  width: 20px;
  height: 20px;
}

.popconfirm-icon-default {
  color: hsl(var(--primary));
}

.popconfirm-icon-warning {
  color: hsl(var(--warning));
}

.popconfirm-icon-error {
  color: hsl(var(--error));
}

.popconfirm-body {
  flex: 1;
}

.popconfirm-title {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  line-height: 1.4;
}

.popconfirm-description {
  font-size: 13px;
  color: hsl(var(--text-secondary));
  margin-top: 4px;
}

.popconfirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.popconfirm-btn {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  border: none;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.popconfirm-btn-cancel {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text-secondary));
  border: 1px solid hsl(var(--border));
}

.popconfirm-btn-cancel:hover {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
}

.popconfirm-btn-confirm {
  background: hsl(var(--primary));
  color: white;
}

.popconfirm-btn-confirm:hover {
  background: hsl(var(--primary-dark));
}

.popconfirm-btn-warning {
  background: hsl(var(--warning));
}

.popconfirm-btn-warning:hover {
  background: hsl(var(--warning) / 0.9);
}

.popconfirm-btn-error {
  background: hsl(var(--error));
}

.popconfirm-btn-error:hover {
  background: hsl(var(--error) / 0.9);
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .popconfirm-content {
    gap: 10px;
    padding: 6px 0;
  }
  
  .popconfirm-icon {
    width: 18px;
    height: 18px;
  }
  
  .popconfirm-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .popconfirm-title {
    font-size: 13px;
  }
  
  .popconfirm-description {
    font-size: 12px;
  }
  
  .popconfirm-actions {
    gap: 6px;
    margin-top: 10px;
  }
  
  .popconfirm-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
