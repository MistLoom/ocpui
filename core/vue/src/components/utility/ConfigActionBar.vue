<!--
ConfigActionBar 组件

公开属性：
- enabled: boolean - 是否启用
- loading: boolean - 是否加载状态
- showEnableSwitch: boolean - 是否显示启用开关
- enabledText: string - 启用状态文本
- disabledText: string - 禁用状态文本
- saveText: string - 保存按钮文本
- resetText: string - 重置按钮文本
- customClass: string - 自定义类名
- showDivider: boolean - 是否显示分隔线
- buttonOrder: 'reset-save' | 'save-reset' - 按钮顺序

事件处理器：
- update:enabled: (value: boolean) - 启用状态改变时触发
- save: () - 保存按钮点击时触发
- reset: () - 重置按钮点击时触发
-->
<template>
  <div :class="actionBarClass">
    <div class="action-bar-left">
      <slot name="left">
        <Switch
          v-if="showEnableSwitch"
          :model-value="enabled"
          @update:model-value="handleEnabledChange"
        />
        <span v-if="showEnableSwitch" class="enable-text">
          {{ enabled ? enabledText : disabledText }}
        </span>
        <slot name="left-extra" />
      </slot>
    </div>

    <div v-if="showDivider" class="action-bar-divider" />

    <div class="action-bar-right">
      <slot name="right">
        <Button
          v-if="buttonOrder === 'reset-save'"
          variant="secondary"
          :disabled="loading"
          @click="handleReset"
        >
          {{ resetText }}
        </Button>
        <Button
          variant="primary"
          :loading="loading"
          @click="handleSave"
        >
          {{ saveText }}
        </Button>
        <Button
          v-if="buttonOrder === 'save-reset'"
          variant="secondary"
          :disabled="loading"
          @click="handleReset"
        >
          {{ resetText }}
        </Button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from './Button.vue';
import Switch from '../data-entry/Switch.vue';

interface Props {
  enabled?: boolean;
  loading?: boolean;
  showEnableSwitch?: boolean;
  enabledText?: string;
  disabledText?: string;
  saveText?: string;
  resetText?: string;
  customClass?: string;
  showDivider?: boolean;
  buttonOrder?: 'reset-save' | 'save-reset';
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  loading: false,
  showEnableSwitch: true,
  enabledText: '',
  disabledText: '',
  saveText: '',
  resetText: '',
  customClass: '',
  showDivider: false,
  buttonOrder: 'reset-save',
});

const emit = defineEmits<{
  'update:enabled': [value: boolean];
  'save': [];
  'reset': [];
}>();

const actionBarClass = computed(() => {
  const classes = ['config-action-bar', 'ocp-form-action-bar'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  if (props.showDivider) {
    classes.push('config-action-bar--with-divider');
  }
  return classes.join(' ');
});

const handleEnabledChange = (value: boolean) => {
  emit('update:enabled', value);
};

const handleSave = () => {
  emit('save');
};

const handleReset = () => {
  emit('reset');
};
</script>

<style scoped>
.config-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-sans);
  gap: var(--space-5);
}

.action-bar-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  justify-content: flex-start;
}

.enable-text {
  font-size: var(--font-size-sm);
  color: hsl(var(--text-secondary));
}

.action-bar-divider {
  width: 1px;
  height: 32px;
  background: hsl(var(--border));
  margin: 0 var(--space-2);
}

.config-action-bar--with-divider {
  gap: 0;
}

.action-bar-right {
  display: flex;
  gap: var(--space-3);
  flex: 1;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .config-action-bar {
    flex-direction: column;
    gap: var(--space-4);
  }

  .action-bar-divider {
    width: 100%;
    height: 1px;
    margin: 0;
  }

  .action-bar-left,
  .action-bar-right {
    width: 100%;
    justify-content: center;
  }

  .action-bar-right :deep(.btn) {
    flex: 1;
  }
}
</style>
