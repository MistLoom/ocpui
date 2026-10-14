&lt;!--
DropZone 拖放区域组件

## 组件说明
用于创建拖放区域，支持不同类型的拖放指示器和状态管理。

## 公开属性
- type: DropZoneType - 拖放区域类型，可选值：'default', 'line', 'placeholder'，默认为 'default'
- accept: string[] - 接受的文件类型数组，默认为空数组
- disabled: boolean - 是否禁用，默认为 false
- indicatorIcon: string - 拖放指示器图标，默认为 'arrow-down-circle'
- indicatorText: string - 拖放指示器文本，默认为 '释放以放置'
- customClass: string - 自定义类名

## 事件
- drag-over: 拖拽经过时触发，参数为 event
- drag-leave: 拖拽离开时触发，参数为 event
- drop: 放置时触发，参数为 (data, event)

## 暴露方法
- setDragging: 设置拖拽状态，参数为 boolean
- isDragging: 拖拽状态
- isOver: 鼠标悬停状态

## 使用方式
```vue
&lt;DropZone
  @drop="handleDrop"
  @drag-over="handleDragOver"
&gt;
  &lt;div class="drop-content"&gt;
    拖拽内容到这里
  &lt;/div&gt;
&lt;/DropZone&gt;
```
--&gt;

<template>
  <div
    :class="dropZoneClass"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @dragenter="handleDragEnter"
  >
    <div v-if="isDragging && !disabled" class="drop-zone-overlay">
      <div class="drop-zone-indicator">
        <Icon :name="indicatorIcon" :size="32" />
        <span class="drop-zone-text">{{ indicatorText }}</span>
      </div>
    </div>
    <slot :is-dragging="isDragging" :is-over="isOver" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '../utility';

export type DropZoneType = 'default' | 'line' | 'placeholder';

export interface DropZoneProps {
  type?: DropZoneType;
  accept?: string[];
  disabled?: boolean;
  indicatorIcon?: string;
  indicatorText?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<DropZoneProps>(), {
  type: 'default',
  accept: () => [],
  disabled: false,
  indicatorIcon: 'arrow-down-circle',
  indicatorText: '释放以放置',
  customClass: '',
});

const emit = defineEmits<{
  'drag-over': [event: DragEvent];
  'drag-leave': [event: DragEvent];
  drop: [data: any, event: DragEvent];
}>();

const isDragging = ref(false);
const isOver = ref(false);
const dragCounter = ref(0);

const dropZoneClass = computed(() => {
  const classes = ['drop-zone', `drop-zone--${props.type}`];
  if (isDragging.value && !props.disabled) {
    classes.push('drop-zone--active');
  }
  if (isOver.value && !props.disabled) {
    classes.push('drop-zone--over');
  }
  if (props.disabled) {
    classes.push('drop-zone--disabled');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const handleDragEnter = (event: DragEvent) => {
  if (props.disabled) return;
  
  event.preventDefault();
  dragCounter.value++;
  if (dragCounter.value === 1) {
    isDragging.value = true;
  }
};

const handleDragOver = (event: DragEvent) => {
  if (props.disabled) return;

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  isOver.value = true;
  emit('drag-over', event);
};

const handleDragLeave = (event: DragEvent) => {
  if (props.disabled) return;
  
  dragCounter.value--;
  if (dragCounter.value === 0) {
    isDragging.value = false;
    isOver.value = false;
  }
  emit('drag-leave', event);
};

const handleDrop = (event: DragEvent) => {
  if (props.disabled) return;

  event.preventDefault();
  isDragging.value = false;
  isOver.value = false;
  dragCounter.value = 0;

  const data = event.dataTransfer?.getData('application/json');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      emit('drop', parsed, event);
    } catch (error) {
      emit('drop', data, event);
    }
  } else {
    emit('drop', null, event);
  }
};

// 外部调用方法来设置拖拽状态
const setDragging = (dragging: boolean) => {
  isDragging.value = dragging;
  if (dragging) {
    dragCounter.value++;
  } else {
    dragCounter.value = 0;
    isOver.value = false;
  }
};

defineExpose({
  setDragging,
  isDragging,
  isOver,
});
</script>

<style scoped>
.drop-zone {
  position: relative;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.drop-zone--active {
  background: hsl(var(--primary) / 0.05);
}

.drop-zone--over {
  background: hsl(var(--primary) / 0.1);
}

.drop-zone--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.drop-zone-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--primary) / 0.08);
  border: 2px dashed hsl(var(--primary) / 0.4);
  border-radius: inherit;
  z-index: 10;
  pointer-events: none;
}

.drop-zone-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: hsl(var(--primary));
}

.drop-zone-text {
  font-size: 14px;
  font-weight: 500;
}

/* 线条指示器样式 */
.drop-zone--line.drop-zone--over::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: hsl(var(--primary));
  animation: drop-line-pulse 1s ease-in-out infinite;
}

.drop-zone--line.drop-zone--over::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: hsl(var(--primary));
  box-shadow: 0 0 8px hsl(var(--primary) / 0.5);
}

@keyframes drop-line-pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* 占位符样式 */
.drop-zone--placeholder.drop-zone--over {
  background: hsl(var(--primary) / 0.05);
  border: 2px dashed hsl(var(--primary) / 0.3);
  border-radius: 8px;
}
</style>
