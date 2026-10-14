<script lang="ts">
/**
 * PopupPanel 弹出面板组件
 *
 * 锚定定位统一走 @floating-ui/dom（autoUpdate），避免首开假尺寸与滚动错位。
 */
export default {
  name: 'PopupPanel',
};
</script>
<template>
  <div
    ref="triggerRef"
    class="popup-panel-trigger"
    @click="handleTriggerClick"
    @mouseenter="handleTriggerMouseEnter"
    @mouseleave="handleTriggerMouseLeave"
  >
    <slot name="trigger" />
  </div>
  <Teleport to="body">
    <Transition name="popup-panel">
      <div
        v-if="visible"
        ref="panelRef"
        :id="panelId"
        :class="panelClass"
        :style="panelStyle"
        @click="handlePanelClick"
        @mouseenter="handlePanelMouseEnter"
        @mouseleave="handlePanelMouseLeave"
      >
        <div v-if="loading" class="popup-panel-loading">
          <slot name="loading">
            <span class="popup-panel-spinner" />
            <span>{{ t('components.feedback.popupPanel.loading') }}</span>
          </slot>
        </div>

        <div v-else-if="!$slots.default && ($slots.empty || emptyText)" class="popup-panel-empty">
          <slot name="empty">
            {{ emptyText || t('components.feedback.popupPanel.defaultEmptyText') }}
          </slot>
        </div>

        <div v-else class="popup-panel-content">
          <slot :close="hide" :visible="visible" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch, provide, readonly, toRef } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { POPUP_PANEL_CLOSE_KEY, POPUP_PANEL_VISIBLE_KEY } from '../types/popupPanel';
import { useFloatingPosition, type FloatingPlacement } from '../composables/useFloatingPosition';
import { useFloatingLayer } from '../composables/useFloatingLayer';

export type PopupPanelPlacement = FloatingPlacement;

interface Props {
  modelValue?: boolean;
  trigger?: 'click' | 'hover';
  placement?: PopupPanelPlacement;
  disabled?: boolean;
  loading?: boolean;
  emptyText?: string;
  customClass?: string;
  width?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number;
  offset?: number;
  closeOnClickOutside?: boolean;
  /** 面板宽度对齐触发器（Select 默认应对齐） */
  matchWidth?: boolean;
  /** 紧凑内容区（下拉菜单等），减小内边距并取消默认最小高度 */
  contentCompact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  trigger: 'click',
  placement: 'bottom-start',
  disabled: false,
  loading: false,
  emptyText: '',
  customClass: '',
  maxHeight: 256,
  offset: 4,
  closeOnClickOutside: true,
  minWidth: 120,
  minHeight: 60,
  matchWidth: false,
  contentCompact: false,
});

const emit = defineEmits<{
  'update:modelValue': [boolean];
  open: [];
  close: [];
}>();

const { uiT: t } = useUiT();

const triggerRef = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();
const panelId = useComponentId('popup-panel');
const internalVisible = ref(false);
const positioned = ref(false);

const panelStyle = computed(() => {
  const resolvedMinHeight = props.contentCompact
    ? 0
    : typeof props.minHeight === 'number'
      ? props.minHeight
      : props.minHeight ?? 60;

  const style: Record<string, string> = {
    position: 'fixed',
    maxHeight: `${props.maxHeight}px`,
    minWidth:
      typeof props.minWidth === 'number' ? `${props.minWidth}px` : String(props.minWidth ?? '120px'),
    minHeight:
      typeof resolvedMinHeight === 'number'
        ? `${resolvedMinHeight}px`
        : String(resolvedMinHeight),
    // 未定位完成前隐藏，避免首帧错位闪动
    visibility: positioned.value ? 'visible' : 'hidden',
  };
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  return style;
});

const visible = computed(() => {
  if (props.modelValue !== undefined) {
    return props.modelValue;
  }
  return internalVisible.value;
});

const panelClass = computed(() => {
  const classes = ['popup-panel', `popup-panel--${props.placement}`];
  if (props.contentCompact) {
    classes.push('popup-panel--compact');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const floating = useFloatingPosition({
  reference: triggerRef,
  floating: panelRef,
  placement: toRef(props, 'placement'),
  offsetPx: toRef(props, 'offset'),
  matchWidth: toRef(props, 'matchWidth'),
  maxHeight: toRef(props, 'maxHeight'),
  onUpdate: () => {
    positioned.value = true;
  },
});

const show = () => {
  if (props.disabled) return;
  if (props.modelValue !== undefined) {
    emit('update:modelValue', true);
  } else {
    internalVisible.value = true;
  }
  emit('open');
};

const hide = () => {
  if (props.modelValue !== undefined) {
    emit('update:modelValue', false);
  } else {
    internalVisible.value = false;
  }
  emit('close');
};

provide(POPUP_PANEL_CLOSE_KEY, hide);
provide(POPUP_PANEL_VISIBLE_KEY, readonly(visible));

// 非模态浮层交互统一收口（hover 延时 / click-outside / Esc / 竞态安全）
const {
  onTriggerClick: handleTriggerClick,
  onTriggerEnter: handleTriggerMouseEnter,
  onTriggerLeave: handleTriggerMouseLeave,
  onPanelEnter: handlePanelMouseEnter,
  onPanelLeave: handlePanelMouseLeave,
  onPanelClick: handlePanelClick,
  cancelHover,
} = useFloatingLayer({
  visible,
  panelRef,
  triggerRef,
  trigger: toRef(props, 'trigger'),
  closeOnClickOutside: toRef(props, 'closeOnClickOutside'),
  onOpen: show,
  onClose: hide,
});

const toggle = () => {
  if (visible.value) hide();
  else show();
};

const updatePosition = () => {
  void floating.update();
};

watch(visible, (val) => {
  if (val) {
    positioned.value = false;
    nextTick(() => {
      floating.start();
    });
  } else {
    floating.stop();
    positioned.value = false;
  }
}, { immediate: true });

onUnmounted(() => {
  floating.stop();
  cancelHover();
});

defineExpose({
  show,
  hide,
  toggle,
  updatePosition,
  visible,
  triggerRef,
  panelRef,
  panelId,
});
</script>

<style scoped>
.popup-panel-trigger {
  display: block;
  width: 100%;
  min-width: 0;
}

.popup-panel {
  z-index: var(--z-dropdown);
  overflow-y: auto;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 8px 24px hsl(var(--text) / 0.12);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.popup-panel-loading,
.popup-panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 14px;
}

.popup-panel-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: popup-panel-spin 0.8s linear infinite;
}

@keyframes popup-panel-spin {
  to {
    transform: rotate(360deg);
  }
}

.popup-panel-content {
  padding: 12px;
  pointer-events: auto;
}

.popup-panel--compact .popup-panel-content {
  padding: 4px;
}

.popup-panel-enter-active,
.popup-panel-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.popup-panel-enter-from,
.popup-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 575.98px) {
  .popup-panel {
    max-width: calc(100vw - 32px);
  }
}
</style>
