&lt;!--
Chip 组件

公开属性：
- label: string - 芯片标签文本
- variant: string - 芯片样式变体 ('default' | 'primary' | 'success' | 'warning' | 'error' | 'info')
- size: string - 芯片尺寸 ('sm' | 'md' | 'lg')
- icon: string | Component - 芯片图标
- closable: boolean - 是否可关闭
- disabled: boolean - 是否禁用状态
- customClass: string - 自定义类名
- bgColor: string - 自定义背景色
- textColor: string - 自定义文本颜色
- clickable: boolean - 是否可点击
- rounded: boolean - 是否为圆形芯片

事件处理器：
- close: () - 关闭芯片时触发
- click: () - 点击芯片时触发

使用方式：
&lt;template&gt;
  &lt;!-- 基本用法 --&gt;
  &lt;Chip label="Default" /&gt;
  
  &lt;!-- 不同变体 --&gt;
  &lt;Chip label="Primary" variant="primary" /&gt;
  &lt;Chip label="Success" variant="success" /&gt;
  &lt;Chip label="Warning" variant="warning" /&gt;
  &lt;Chip label="Error" variant="error" /&gt;
  
  &lt;!-- 带图标 --&gt;
  &lt;Chip label="With Icon" icon="search" /&gt;
  
  &lt;!-- 可关闭 --&gt;
  &lt;Chip label="Closable" closable @close="handleClose" /&gt;
  
  &lt;!-- 可点击 --&gt;
  &lt;Chip label="Clickable" clickable @click="handleClick" /&gt;
  
  &lt;!-- 不同尺寸 --&gt;
  &lt;Chip label="Small" size="sm" /&gt;
  &lt;Chip label="Large" size="lg" /&gt;
  
  &lt;!-- 自定义颜色 --&gt;
  &lt;Chip label="Custom" bgColor="#ff6b6b" textColor="white" /&gt;
&lt;/template&gt;
--&gt;

<template>
  <div
    class="chip"
    :class="[
      `chip-${variant}`,
      `chip-${size}`,
      { 'chip-disabled': disabled },
      { 'chip-closable': closable },
      { 'chip-clickable': clickable },
      { 'chip-rounded': rounded },
      customClass
    ]"
    :style="chipStyle"
    @click="handleClick"
  >
    <span v-if="icon || $slots.icon" class="chip-icon">
      <slot name="icon">
        <Icon v-if="typeof icon === 'string'" :name="icon" />
        <component v-else :is="icon" />
      </slot>
    </span>
    <span v-if="hasLabel" class="chip-label">
      <slot>{{ label }}</slot>
    </span>
    <button
      v-if="closable && !disabled"
      class="chip-close"
      @click.stop="handleClose"
      :aria-label="`Remove ${label}`"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4L4 12M4 4l8 8"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { Component } from 'vue';
import Icon from './Icon.vue';

interface Props {
  label?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: string | Component;
  closable?: boolean;
  disabled?: boolean;
  customClass?: string;
  bgColor?: string;
  textColor?: string;
  clickable?: boolean;
  rounded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  variant: 'default',
  size: 'md',
  icon: undefined,
  closable: false,
  disabled: false,
  customClass: '',
  clickable: false,
  rounded: false,
});

const emit = defineEmits<{
  close: [];
  click: [];
}>();

const slots = useSlots();

const hasLabel = computed(() => Boolean(props.label) || Boolean(slots.default));

const chipStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.bgColor) {
    style.backgroundColor = props.bgColor;
  }
  
  if (props.textColor) {
    style.color = props.textColor;
  }
  
  return style;
});

const handleClose = () => {
  if (!props.disabled) {
    emit('close');
  }
};

const handleClick = () => {
  if (!props.disabled && props.clickable) {
    emit('click');
  }
};
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--pill-gap);
  min-height: var(--pill-height-md);
  padding: 0 var(--pill-pad-x-md);
  font-size: var(--pill-font-md);
  font-weight: 500;
  line-height: 1.4;
  border-radius: var(--pill-radius);
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text-secondary));
  border: 1px solid hsl(var(--border));
  transition:
    background-color var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out),
    color var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
  cursor: default;
  white-space: nowrap;
}

.chip:hover:not(.chip-disabled) {
  border-color: hsl(var(--border-hover));
  background: hsl(var(--surface-hover));
}

.chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: inherit;
}

.chip-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: inherit;
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.chip-close:hover {
  background: hsl(var(--border));
  color: hsl(var(--text));
}

/* 变体样式 */
.chip-primary {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  border-color: hsl(var(--primary) / 0.2);
}

.chip-success {
  background: hsl(var(--success) / 0.1);
  color: hsl(var(--success));
  border-color: hsl(var(--success) / 0.2);
}

.chip-warning {
  background: hsl(var(--warning) / 0.1);
  color: hsl(var(--warning));
  border-color: hsl(var(--warning) / 0.2);
}

.chip-error {
  background: hsl(var(--error) / 0.1);
  color: hsl(var(--error));
  border-color: hsl(var(--error) / 0.2);
}

.chip-info {
  background: hsl(var(--info) / 0.1);
  color: hsl(var(--info));
  border-color: hsl(var(--info) / 0.2);
}

/* 尺寸样式 */
.chip-sm {
  min-height: var(--pill-height-sm);
  padding: 0 var(--pill-pad-x-sm);
  font-size: var(--pill-font-sm);
  gap: var(--pill-gap);
}

.chip-sm .chip-icon {
  font-size: 12px;
}

.chip-sm .chip-close {
  width: 14px;
  height: 14px;
}

.chip-md {
  min-height: var(--pill-height-md);
  padding: 0 var(--pill-pad-x-md);
  font-size: var(--pill-font-md);
  gap: var(--pill-gap);
}

.chip-lg {
  min-height: var(--pill-height-lg);
  padding: 0 var(--pill-pad-x-lg);
  font-size: var(--pill-font-lg);
  gap: calc(var(--pill-gap) + 2px);
}

.chip-lg .chip-icon {
  font-size: 16px;
}

.chip-lg .chip-close {
  width: 18px;
  height: 18px;
}

/* 禁用状态 */
.chip-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chip-disabled:hover {
  transform: none;
  box-shadow: none;
  border-color: hsl(var(--border));
  background: hsl(var(--surface-container-high));
}

.chip-disabled .chip-close {
  cursor: not-allowed;
  opacity: 0.5;
}

.chip-disabled .chip-close:hover {
  background: transparent;
  transform: none;
}

/* 可点击状态 */
.chip-clickable {
  cursor: pointer;
}

.chip-clickable:hover:not(.chip-disabled) {
  border-color: hsl(var(--border-hover));
  background: hsl(var(--surface-hover));
}

/* 圆形芯片 */
.chip-rounded {
  border-radius: 9999px;
  padding-left: 16px;
  padding-right: 16px;
}

.chip-rounded.chip-sm {
  padding-left: 12px;
  padding-right: 12px;
}

.chip-rounded.chip-lg {
  padding-left: 20px;
  padding-right: 20px;
}

/* 响应式：仅微调字号，尺寸令牌保持不变 */
@media (max-width: 639.98px) {
  .chip-md {
    font-size: var(--pill-font-sm);
  }
}
</style>