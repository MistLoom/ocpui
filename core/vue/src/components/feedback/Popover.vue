&lt;!--
Popover 气泡组件

属性：
- modelValue: 是否显示，默认值：undefined
- title: 标题，默认值：''
- placement: 位置，可选值：top, top-left, top-right, bottom, bottom-left, bottom-right, left, left-top, left-bottom, right, right-top, right-bottom，默认值：bottom
- trigger: 触发方式，可选值：click, hover，默认值：click
- disabled: 是否禁用，默认值：false
- offset: 偏移量，默认值：8
- customClass: 自定义类名，默认值：''
- width: 宽度，默认值：undefined

事件：
- update:modelValue: 更新可见状态时触发
- open: 打开时触发
- close: 关闭时触发

使用方式：
&lt;Popover
  v-model="showPopover"
  title="气泡标题"
  placement="bottom-right"
  trigger="click"
&gt;
  &lt;template #trigger&gt;
    &lt;Button&gt;点击触发&lt;/Button&gt;
  &lt;/template&gt;
  气泡内容
&lt;/Popover&gt;
--&gt;
<template>
  <div
    ref="triggerRef"
    class="popover-trigger"
    role="button"
    tabindex="0"
    :aria-expanded="visible"
    aria-haspopup="dialog"
    :aria-controls="visible ? popoverId : undefined"
    @click="onTriggerClick"
    @keydown="handleTriggerKeydown"
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
  >
    <slot name="trigger" />
  </div>
  <Teleport to="body">
    <Transition name="popover">
      <div
        v-if="visible"
        :id="popoverId"
        ref="popoverRef"
        class="popover-container"
        :class="popoverClass"
        :style="popoverStyle"
        role="dialog"
        aria-modal="false"
        tabindex="-1"
        @click="onPanelClick"
        @mouseenter="onPanelEnter"
        @mouseleave="onPanelLeave"
      >
        <div class="popover-arrow" :style="arrowStyle" />
        <div v-if="title" class="popover-title">{{ title }}</div>
        <div class="popover-content">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import { useFloatingPosition, type FloatingPlacement } from '../composables/useFloatingPosition';
import { useFloatingLayer } from '../composables/useFloatingLayer';

interface Props {
  modelValue?: boolean;
  title?: string;
  placement?: FloatingPlacement | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom';
  trigger?: 'click' | 'hover';
  disabled?: boolean;
  offset?: number;
  customClass?: string;
  width?: number | string;
  /** glass：管理台毛玻璃浮层 */
  surface?: 'default' | 'glass';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  title: '',
  placement: 'bottom',
  trigger: 'click',
  disabled: false,
  offset: 8,
  customClass: '',
  width: undefined,
  surface: 'default',
});

const emit = defineEmits<{
  'update:modelValue': [boolean];
  'open': [];
  'close': [];
}>();

const triggerRef = ref<HTMLElement>();
const popoverRef = ref<HTMLElement>();
const internalVisible = ref(false);
const popoverId = useComponentId('popover');
// 定位完成前隐藏面板，避免首帧无坐标闪动
const positioned = ref(false);
// 实际渲染方向（可能因 flip 中间件而与请求方向不同），用于箭头边框样式
const resolvedSide = ref<'top' | 'bottom' | 'left' | 'right'>('bottom');

const visible = computed(() => {
  if (props.modelValue !== undefined) {
    return props.modelValue;
  }
  return internalVisible.value;
});

const popoverClass = computed(() => {
  const classes = ['popover', `popover-${resolvedSide.value}`];
  if (props.surface === 'glass') {
    classes.push('ocp-admin-popover-glass');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

// left-top/left-bottom/right-top/right-bottom 是本组件私有别名，映射为 FloatingPlacement 支持的 -start/-end
const PLACEMENT_ALIAS: Partial<Record<string, FloatingPlacement>> = {
  'left-top': 'left-start',
  'left-bottom': 'left-end',
  'right-top': 'right-start',
  'right-bottom': 'right-end',
};

const floatingPlacement = computed<FloatingPlacement>(
  () => PLACEMENT_ALIAS[props.placement] ?? (props.placement as FloatingPlacement),
);

const popoverStyle = computed(() => {
  const style: Record<string, string> = {
    position: 'fixed',
    visibility: positioned.value ? 'visible' : 'hidden',
  };
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  return style;
});

const arrowStyle = ref<Record<string, string>>({});

// 依据触发器与气泡的实际相对位置计算箭头偏移，随 flip/shift 结果动态跟随
const updateArrow = (side: 'top' | 'bottom' | 'left' | 'right') => {
  if (!triggerRef.value || !popoverRef.value) return;
  const triggerRect = triggerRef.value.getBoundingClientRect();
  const popoverRect = popoverRef.value.getBoundingClientRect();

  if (side === 'top' || side === 'bottom') {
    const center = triggerRect.left + triggerRect.width / 2 - popoverRect.left;
    const left = Math.max(12, Math.min(center, popoverRect.width - 12));
    arrowStyle.value = side === 'top'
      ? { bottom: '-6px', left: `${left}px`, transform: 'translateX(-50%) rotate(45deg)' }
      : { top: '-6px', left: `${left}px`, transform: 'translateX(-50%) rotate(45deg)' };
  } else {
    const center = triggerRect.top + triggerRect.height / 2 - popoverRect.top;
    const top = Math.max(12, Math.min(center, popoverRect.height - 12));
    arrowStyle.value = side === 'left'
      ? { right: '-6px', top: `${top}px`, transform: 'translateY(-50%) rotate(45deg)' }
      : { left: '-6px', top: `${top}px`, transform: 'translateY(-50%) rotate(45deg)' };
  }
};

const floating = useFloatingPosition({
  reference: triggerRef,
  floating: popoverRef,
  placement: floatingPlacement,
  offsetPx: toRef(props, 'offset'),
  matchWidth: false,
  onUpdate: ({ placement: resolved }) => {
    positioned.value = true;
    const side = resolved.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';
    resolvedSide.value = side;
    updateArrow(side);
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

// 非模态浮层交互统一收口：hover 延时 / click-outside / Esc（栈派发）/ 焦点恢复
const {
  onTriggerClick,
  onTriggerEnter,
  onTriggerLeave,
  onPanelEnter,
  onPanelLeave,
  onPanelClick,
} = useFloatingLayer({
  visible,
  panelRef: popoverRef,
  triggerRef,
  trigger: toRef(props, 'trigger'),
  onOpen: show,
  onClose: hide,
});

// 触发器键盘：Enter/Space 打开（Esc 由 non-modal 栈按栈顶派发，无需本地处理）
const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  if (props.trigger === 'click' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    onTriggerClick();
  }
};

watch(visible, (val) => {
  if (val) {
    positioned.value = false;
    nextTick(() => {
      floating.start();
      popoverRef.value?.focus();
    });
  } else {
    floating.stop();
    positioned.value = false;
  }
}, { immediate: true });
</script>

<style scoped>
.popover-trigger {
  display: inline-block;
}

.popover-container {
  position: fixed;
  z-index: var(--z-popover);
  min-width: 180px;
  max-width: 320px;
  background: var(--glass-fill-strong);
  border: 1px solid color-mix(in srgb, hsl(var(--border)) 72%, transparent);
  border-radius: 16px;
  box-shadow: var(--shadow-elevated-soft);
  backdrop-filter: blur(20px) saturate(1.15);
  -webkit-backdrop-filter: blur(20px) saturate(1.15);
  font-family: var(--font-sans);
  overflow: hidden;
}

.popover-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  transform: rotate(45deg);
  transition: transform var(--duration-fast) var(--ease-standard);
}

.popover-top .popover-arrow {
  border-top: none;
  border-left: none;
}

.popover-bottom .popover-arrow {
  border-bottom: none;
  border-right: none;
}

.popover-left .popover-arrow {
  border-bottom: none;
  border-left: none;
}

.popover-right .popover-arrow {
  border-top: none;
  border-right: none;
}

.popover-title {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text));
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--surface-container-high));
}

.popover-content {
  padding: 12px 16px;
  font-size: 14px;
  color: hsl(var(--text-secondary));
  animation: contentFadeIn var(--duration-normal) var(--ease-out-soft, var(--ease-standard));
}

.popselect-popover .popover-content {
  padding: 0;
  margin: 0;
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popover-enter-active {
  animation: ocp-popover-in 0.18s var(--ease-emphasized) both;
}

.popover-leave-active {
  transition: opacity 0.14s var(--ease-emphasized), transform 0.14s var(--ease-emphasized);
}

.popover-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

@keyframes ocp-popover-in {
  from {
    opacity: 0;
    transform: translateY(-5px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.popover-top,
.popover-top-left,
.popover-top-right {
  transform-origin: bottom center;
}

.popover-bottom,
.popover-bottom-left,
.popover-bottom-right {
  transform-origin: top center;
}

.popover-left,
.popover-left-top,
.popover-left-bottom {
  transform-origin: right center;
}

.popover-right,
.popover-right-top,
.popover-right-bottom {
  transform-origin: left center;
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .popover-container {
    min-width: 200px;
    max-width: 80vw;
    border-radius: 8px;
  }
  
  .popover-title {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .popover-content {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .popover-arrow {
    width: 10px;
    height: 10px;
  }
  
  .popover-top .popover-arrow {
    bottom: -5px;
  }
  
  .popover-bottom .popover-arrow {
    top: -5px;
  }
  
  .popover-left .popover-arrow {
    right: -5px;
  }
  
  .popover-right .popover-arrow {
    left: -5px;
  }
}
</style>
