&lt;!--
DragHandle 拖拽手柄组件

## 组件说明
用于创建可拖拽元素的手柄，支持不同尺寸和禁用状态。

## 公开属性
- size: DragHandleSize - 手柄尺寸，可选值：'sm', 'md', 'lg'，默认为 'md'
- draggable: boolean - 是否可拖拽，默认为 true
- data: any - 拖拽时传递的数据
- disabled: boolean - 是否禁用，默认为 false
- customClass: string - 自定义类名

## 事件
- drag-start: 拖拽开始时触发，参数为 (data, event)
- drag-end: 拖拽结束时触发，参数为 event
- mouse-down: 鼠标按下时触发，参数为 event

## 使用方式
```vue
&lt;DragHandle
  :data="item"
  @drag-start="handleDragStart"
  @drag-end="handleDragEnd"
/&gt;
```
--&gt;

<template>
  <div
    :class="handleClass"
    :draggable="!disabled && draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @mousedown="handleMouseDown"
  >
    <svg viewBox="0 0 12 12" fill="currentColor" class="drag-handle-icon">
      <circle cx="3" cy="3" r="1.5" />
      <circle cx="9" cy="3" r="1.5" />
      <circle cx="3" cy="9" r="1.5" />
      <circle cx="9" cy="9" r="1.5" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentSize } from '@ocpui/vue/types';

export type DragHandleSize = ComponentSize;

export interface DragHandleProps {
  size?: DragHandleSize;
  draggable?: boolean;
  data?: any;
  disabled?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<DragHandleProps>(), {
  size: 'md',
  draggable: true,
  data: undefined,
  disabled: false,
  customClass: '',
});

const emit = defineEmits<{
  'drag-start': [data: any, event: DragEvent];
  'drag-end': [event: DragEvent];
  'mouse-down': [event: MouseEvent];
}>();

const handleClass = computed(() => {
  const classes = ['drag-handle', `drag-handle--${props.size}`];
  if (props.disabled) {
    classes.push('drag-handle--disabled');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const handleDragStart = (event: DragEvent) => {
  if (props.disabled) {
    event.preventDefault();
    return;
  }

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(props.data));
  }

  emit('drag-start', props.data, event);
};

const handleDragEnd = (event: DragEvent) => {
  emit('drag-end', event);
};

const handleMouseDown = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('mouse-down', event);
  }
};

defineExpose({
  disabled: props.disabled,
  draggable: computed(() => !props.disabled && props.draggable),
});
</script>

<style scoped>
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  border-radius: 4px;
}

.drag-handle:hover:not(.drag-handle--disabled) {
  color: hsl(var(--text));
  background: hsl(var(--surface-hover));
}

.drag-handle:active:not(.drag-handle--disabled) {
  cursor: grabbing;
}

.drag-handle--disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.drag-handle--sm {
  width: 20px;
  height: 20px;
}

.drag-handle--md {
  width: 24px;
  height: 24px;
}

.drag-handle--lg {
  width: 28px;
  height: 28px;
}

.drag-handle-icon {
  width: 12px;
  height: 12px;
}

.drag-handle--sm .drag-handle-icon {
  width: 10px;
  height: 10px;
}

.drag-handle--lg .drag-handle-icon {
  width: 14px;
  height: 14px;
}
</style>
