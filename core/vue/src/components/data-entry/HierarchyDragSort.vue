<template>
  <div
    ref="rootRef"
    class="hds"
    :class="{ 'hds--disabled': disabled, 'hds--dragging': draggingIndex !== null }"
  >
    <div
      v-for="(item, index) in model"
      :key="String((item as Record<string, unknown>)[itemKey] ?? index)"
      class="hds-block"
    >
      <div
        class="hds-row-wrap"
        :class="{
          'hds-row-wrap--dragging': draggingIndex === index,
          'hds-row-wrap--drop-before': dropIndex === index && !isNoopDrop,
          'hds-row-wrap--drop-after': dropIndex === model.length && index === model.length - 1 && !isNoopDrop,
        }"
      >
        <div
          class="hds-handle"
          aria-hidden="true"
          @pointerdown="onHandlePointerDown($event, index)"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <circle cx="9" cy="6" r="2" />
            <circle cx="9" cy="12" r="2" />
            <circle cx="9" cy="18" r="2" />
            <circle cx="15" cy="6" r="2" />
            <circle cx="15" cy="12" r="2" />
            <circle cx="15" cy="18" r="2" />
          </svg>
        </div>
        <div class="hds-row">
          <slot name="row" :item="item" :index="index" />
        </div>
      </div>
      <div v-if="hasChildren(item)" class="hds-children">
        <HierarchyDragSort
          :model-value="item.children ?? []"
          :item-key="itemKey"
          :disabled="disabled"
          @update:model-value="(v: T[]) => (item.children = v)"
          @change="emitChange"
        >
          <template #row="scope">
            <slot name="row" :item="scope.item" :index="scope.index" />
          </template>
        </HierarchyDragSort>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends { children?: T[] }">
/**
 * 层级同级拖拽：仅手柄可拖，指针捕获排序，子树与行内容分离。
 */
import { computed, onUnmounted, ref } from 'vue';

defineOptions({ name: 'HierarchyDragSort' });

const model = defineModel<T[]>({ required: true });

defineSlots<{
  row(props: { item: T; index: number }): unknown;
}>();

withDefaults(
  defineProps<{
    itemKey?: string;
    disabled?: boolean;
  }>(),
  {
    itemKey: 'id',
    disabled: false,
  },
);

const emit = defineEmits<{
  change: [];
}>();

const rootRef = ref<HTMLElement | null>(null);
const draggingIndex = ref<number | null>(null);
const dropIndex = ref<number | null>(null);
const activePointerId = ref<number | null>(null);

const isNoopDrop = computed(() => {
  const from = draggingIndex.value;
  const to = dropIndex.value;
  if (from === null || to === null) return true;
  return to === from || to === from + 1;
});

function hasChildren(item: T): boolean {
  return Array.isArray(item.children) && item.children.length > 0;
}

function emitChange() {
  emit('change');
}

function topBlocks(): HTMLElement[] {
  const root = rootRef.value;
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(':scope > .hds-block'));
}

function hitInsertIndex(clientY: number, from: number): number {
  const blocks = topBlocks();
  let hovered = blocks.length;
  for (let i = 0; i < blocks.length; i += 1) {
    const rect = blocks[i].getBoundingClientRect();
    if (clientY < rect.bottom) {
      hovered = i;
      break;
    }
  }
  if (hovered === from) return from;
  if (from < hovered) return hovered + 1;
  return hovered;
}

function resetDrag() {
  draggingIndex.value = null;
  dropIndex.value = null;
  activePointerId.value = null;
}

function commitDrop() {
  const from = draggingIndex.value;
  const insertAt = dropIndex.value;
  if (from === null || insertAt === null || insertAt === from || insertAt === from + 1) {
    resetDrag();
    return;
  }
  const next = [...model.value];
  const [moved] = next.splice(from, 1);
  const to = insertAt > from ? insertAt - 1 : insertAt;
  next.splice(to, 0, moved);
  model.value = next;
  resetDrag();
  emitChange();
}

function onHandlePointerDown(e: PointerEvent, index: number) {
  if (e.button !== 0) return;
  const handle = e.currentTarget;
  if (!(handle instanceof HTMLElement)) return;
  e.preventDefault();
  e.stopPropagation();
  draggingIndex.value = index;
  dropIndex.value = index;
  activePointerId.value = e.pointerId;
  handle.setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  const from = draggingIndex.value;
  if (from === null) return;
  dropIndex.value = hitInsertIndex(e.clientY, from);
}

function onPointerUp(e: PointerEvent) {
  const handle = e.currentTarget;
  if (handle instanceof HTMLElement && activePointerId.value !== null && handle.hasPointerCapture(activePointerId.value)) {
    handle.releasePointerCapture(activePointerId.value);
  }
  commitDrop();
}

onUnmounted(() => {
  resetDrag();
});
</script>

<style scoped>
.hds {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hds--disabled {
  opacity: 0.65;
  pointer-events: none;
}
.hds--dragging {
  user-select: none;
}
.hds-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hds-row-wrap {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 8px 10px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    opacity 0.15s;
}
.hds-row-wrap:hover {
  border-color: hsl(var(--border-hover, var(--border)));
}
.hds-row-wrap--dragging {
  opacity: 0.4;
  box-shadow: var(--shadow-md);
}
.hds-row-wrap--drop-before {
  box-shadow: 0 -2px 0 0 hsl(var(--primary));
}
.hds-row-wrap--drop-after {
  box-shadow: 0 2px 0 0 hsl(var(--primary));
}
.hds-handle {
  display: flex;
  align-items: center;
  color: hsl(var(--muted-foreground));
  flex-shrink: 0;
  cursor: grab;
  padding: 4px 2px;
  border-radius: 4px;
  touch-action: none;
}
.hds-handle:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 0.5);
}
.hds--dragging .hds-handle {
  cursor: grabbing;
}
.hds-row {
  flex: 1;
  min-width: 0;
}
.hds-children {
  margin-left: 10px;
  padding-left: 12px;
  border-left: 2px solid hsl(var(--primary) / 0.35);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
