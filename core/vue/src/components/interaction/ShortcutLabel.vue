&lt;!--
ShortcutLabel 快捷键标签组件

## 组件说明
用于显示键盘快捷键的标签组件，支持不同尺寸和可点击状态。

## 公开属性
- shortcut: string - 快捷键组合字符串，如 "Ctrl+C"
- size: ShortcutSize - 标签尺寸，可选值：'sm', 'md', 'lg'，默认为 'md'
- clickable: boolean - 是否可点击，默认为 false
- customClass: string - 自定义类名

## 事件
- click: 点击时触发，参数为 MouseEvent

## 使用方式
```vue
&lt;ShortcutLabel shortcut="Ctrl+K" /&gt;
&lt;ShortcutLabel shortcut="Cmd+S" size="sm" /&gt;
&lt;ShortcutLabel shortcut="Alt+Delete" clickable @click="handleClick" /&gt;
```
--&gt;

<template>
  <kbd :class="shortcutClass" @click="handleClick">
    <template v-for="(key, index) in keys" :key="index">
      <span class="shortcut-key">{{ key }}</span>
      <span v-if="index < keys.length - 1" class="shortcut-separator">+</span>
    </template>
  </kbd>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';

export type ShortcutSize = ComponentSize;

export interface ShortcutLabelProps {
  shortcut?: string;
  size?: ShortcutSize;
  clickable?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<ShortcutLabelProps>(), {
  shortcut: '',
  size: 'md',
  clickable: false,
  customClass: '',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const shortcutClass = computed(() => {
  const classes = ['shortcut-label', `shortcut-label--${props.size}`];
  if (props.clickable) {
    classes.push('shortcut-label--clickable');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const keys = computed(() => {
  return props.shortcut ? props.shortcut.split('+').map(k => k.trim()) : [];
});

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event);
  }
};
</script>

<style scoped>
.shortcut-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'SF Mono', 'Monaco', 'JetBrains Mono', monospace;
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  box-shadow: 0 2px 0 hsl(var(--border));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.shortcut-label--sm {
  padding: 2px 6px;
  font-size: 11px;
}

.shortcut-label--md {
  padding: 4px 8px;
  font-size: 12px;
}

.shortcut-label--lg {
  padding: 6px 10px;
  font-size: 13px;
}

.shortcut-label--clickable {
  cursor: pointer;
}

.shortcut-label--clickable:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  transform: translateY(-1px);
  box-shadow: 0 3px 0 hsl(var(--border));
}

.shortcut-label--clickable:active {
  transform: translateY(1px);
  box-shadow: 0 1px 0 hsl(var(--border));
}

.shortcut-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  color: hsl(var(--text-secondary));
  font-weight: 500;
}

.shortcut-separator {
  color: hsl(var(--text-muted));
  margin: 0 2px;
}
</style>
