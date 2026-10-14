<template>
  <div :class="listClass">
    <template v-for="(item, index) in modelValue" :key="getItemKey(item, index)">
      <div
        v-if="dragOverIndex === index && draggingIndex !== null && draggingIndex !== index"
        class="drag-sort-placeholder"
      ></div>
      <div
        :class="['drag-sort-item', { 'drag-sort-item--dragging': draggingIndex === index }]"
        :draggable="!disabled"
        @dragstart="handleDragStart($event, index)"
        @dragend="handleDragEnd"
        @dragover.prevent="handleDragOver($event, index)"
        @drop="handleDrop($event, index)"
      >
        <div class="drag-sort-handle" @mousedown="handleMouseDown(index)">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="2"/>
            <circle cx="9" cy="12" r="2"/>
            <circle cx="9" cy="18" r="2"/>
            <circle cx="15" cy="6" r="2"/>
            <circle cx="15" cy="12" r="2"/>
            <circle cx="15" cy="18" r="2"/>
          </svg>
        </div>
        <div class="drag-sort-content">
          <slot :item="item" :index="index">
            {{ getItemLabel(item) }}
          </slot>
        </div>
        <div v-if="showIndex" class="drag-sort-index">{{ index + 1 }}</div>
      </div>
    </template>
    <div v-if="modelValue.length === 0" class="drag-sort-empty">
      <slot name="empty">
        列表为空，拖拽项目到此处
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 可拖拽排序列表组件
 * @description 支持通过拖拽方式重新排序列表项
 * 
 * @props {
 *   modelValue: any[]; // 绑定值，列表数据
 *   labelKey?: string; // 用于显示的属性键名
 *   itemKey?: string; // 用于生成唯一 key 的属性键名
 *   disabled?: boolean; // 是否禁用
 *   showIndex?: boolean; // 是否显示索引
 *   customClass?: string; // 自定义类名
 * }
 * 
 * @emits {
 *   'update:modelValue': [any[]]; // 值更新事件
 *   'change': [any[]]; // 排序变化事件
 *   'drag-start': [index: number]; // 拖拽开始事件
 *   'drag-end': [index: number]; // 拖拽结束事件
 * }
 * 
 * @example
 * // 基本使用
 * <DragSortList v-model="list" />
 * 
 * // 自定义显示内容
 * <DragSortList v-model="list">
 *   <template #default="{ item, index }">
 *     <div>{{ index + 1 }}. {{ item.name }}</div>
 *   </template>
 * </DragSortList>
 */
import { computed, ref } from 'vue';

interface Props {
  modelValue: any[];
  labelKey?: string;
  itemKey?: string;
  disabled?: boolean;
  showIndex?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  labelKey: 'label',
  itemKey: undefined,
  disabled: false,
  showIndex: true,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [any[]];
  'change': [any[]];
  'drag-start': [index: number];
  'drag-end': [index: number];
}>();

const draggingIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

const listClass = computed(() => {
  const classes = ['drag-sort-list'];
  if (props.disabled) {
    classes.push('drag-sort-list--disabled');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const getItemKey = (item: any, index: number): string => {
  if (props.itemKey && item[props.itemKey] !== undefined) {
    return String(item[props.itemKey]);
  }
  return `item-${index}`;
};

const getItemLabel = (item: any): string => {
  if (typeof item === 'string') return item;
  return item[props.labelKey] || '';
};

const handleDragStart = (e: DragEvent, index: number) => {
  if (props.disabled) return;
  draggingIndex.value = index;
  emit('drag-start', index);
  
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }
};

const handleDragEnd = () => {
  const index = draggingIndex.value;
  draggingIndex.value = null;
  dragOverIndex.value = null;
  emit('drag-end', index || -1);
};

const handleDragOver = (e: DragEvent, index: number) => {
  if (props.disabled || draggingIndex.value === null) return;
  dragOverIndex.value = index;
  
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
};

const handleDrop = (e: DragEvent, dropIndex: number) => {
  e.preventDefault();
  if (props.disabled || draggingIndex.value === null) return;
  
  const fromIndex = draggingIndex.value;
  if (fromIndex === dropIndex) return;
  
  const newList = [...props.modelValue];
  const [movedItem] = newList.splice(fromIndex, 1);
  newList.splice(dropIndex, 0, movedItem);
  
  emit('update:modelValue', newList);
  emit('change', newList);
  
  draggingIndex.value = null;
  dragOverIndex.value = null;
};

const handleMouseDown = (_index: number) => {
  if (props.disabled) return;
  // 阻止默认行为，避免拖拽时选中文本
};
</script>

<style scoped>
.drag-sort-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.drag-sort-list--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.drag-sort-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  transition: background-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
  cursor: grab;
}

.drag-sort-item:hover {
  border-color: hsl(var(--border-hover));
  box-shadow: var(--shadow-sm);
}

.drag-sort-item--dragging {
  opacity: 0.5;
  cursor: grabbing;
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}

.drag-sort-list--disabled .drag-sort-item {
  cursor: not-allowed;
}

.drag-sort-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--text-muted));
  cursor: grab;
  transition: color 0.2s;
}

.drag-sort-handle:hover {
  color: hsl(var(--text));
}

.drag-sort-handle svg {
  width: 16px;
  height: 16px;
}

.drag-sort-content {
  flex: 1;
  min-width: 0;
}

.drag-sort-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: hsl(var(--surface-container-high));
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--text-secondary));
}

.drag-sort-placeholder {
  height: 48px;
  margin: 8px 0;
  border: 2px dashed hsl(var(--primary));
  border-radius: 10px;
  background: hsl(var(--primary) / 0.05);
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.drag-sort-empty {
  padding: 48px 24px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 14px;
  background: hsl(var(--surface-container-high));
  border: 2px dashed hsl(var(--border));
  border-radius: 10px;
}

/* 响应式 */
@media (max-width: 575.98px) {
  .drag-sort-item {
    padding: 14px 16px;
  }

  .drag-sort-handle svg {
    width: 20px;
    height: 20px;
  }

  .drag-sort-index {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }

  .drag-sort-placeholder {
    height: 56px;
  }

  .drag-sort-empty {
    padding: 64px 24px;
    font-size: 16px;
  }
}
</style>
