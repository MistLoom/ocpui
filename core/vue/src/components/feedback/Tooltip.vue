<template>
  <div
    ref="triggerRef"
    class="tooltip-trigger"
    :aria-describedby="visible ? tooltipId : undefined"
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
    @click="trigger === 'click' && onTriggerClick()"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <slot name="trigger">
      <slot />
    </slot>
  </div>
  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="visible && (content || $slots.default)"
        :id="tooltipId"
        ref="tooltipRef"
        class="tooltip-container"
        :class="tooltipClass"
        :style="tooltipStyle"
        role="tooltip"
        @mouseenter="onPanelEnter"
        @mouseleave="onPanelLeave"
      >
        <div class="tooltip-arrow" />
        <div class="tooltip-content">
          <template v-if="content">{{ content }}</template>
          <slot v-else />
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

/**
 * Tooltip 工具提示组件
 *
 * @props content - 提示内容
 * @props placement - 位置，可选值：'top' | 'bottom' | 'left' | 'right'，默认为 'top'
 * @props trigger - 触发方式，可选值：'hover' | 'click' | 'focus'，默认为 'hover'
 * @props disabled - 是否禁用，默认为 false
 * @props offset - 偏移量，默认为 8
 * @props delay - 延迟显示时间（毫秒），默认为 0
 * @props customClass - 自定义类名
 *
 * @slots trigger - 触发元素
 * @slots default - 自定义内容
 *
 * @usage
 * <template>
 *   <Tooltip content="这是一个提示">
 *     <button>悬停查看提示</button>
 *   </Tooltip>
 * </template>
 */

interface Props {
  content?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  disabled?: boolean;
  offset?: number;
  delay?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  placement: 'top',
  trigger: 'hover',
  disabled: false,
  offset: 8,
  delay: 0,
  customClass: '',
});

const triggerRef = ref<HTMLElement>();
const tooltipRef = ref<HTMLElement>();
const visible = ref(false);
const tooltipId = useComponentId('tooltip');
// 定位完成前隐藏面板，避免首帧无坐标闪动
const positioned = ref(false);
// 实际渲染方向（可能因 flip 中间件而与请求方向不同），用于箭头边框颜色
const resolvedSide = ref<'top' | 'bottom' | 'left' | 'right'>(props.placement);

const tooltipClass = computed(() => {
  const classes = ['tooltip', `tooltip-${resolvedSide.value}`];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const tooltipStyle = computed<Record<string, string>>(() => ({
  position: 'fixed',
  visibility: positioned.value ? 'visible' : 'hidden',
}));

const floatingPlacement = computed<FloatingPlacement>(() => props.placement);

const floating = useFloatingPosition({
  reference: triggerRef,
  floating: tooltipRef,
  placement: floatingPlacement,
  offsetPx: toRef(props, 'offset'),
  matchWidth: false,
  onUpdate: ({ placement: resolved }) => {
    positioned.value = true;
    resolvedSide.value = resolved.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';
  },
});

const show = () => {
  if (props.disabled) return;
  visible.value = true;
};

const hide = () => {
  visible.value = false;
};

// 非模态浮层交互收口：click 模式登记 non-modal 栈（Esc 按栈派发）；
// hover/focus 为高频瞬现提示，不登记栈、不 click-outside。
const {
  onTriggerClick,
  onTriggerEnter,
  onTriggerLeave,
  onPanelEnter,
  onPanelLeave,
} = useFloatingLayer({
  visible,
  panelRef: tooltipRef,
  triggerRef,
  trigger: toRef(() =>
    props.trigger === 'click' ? 'click' : props.trigger === 'hover' ? 'hover' : 'manual',
  ),
  showDelay: toRef(() => props.delay),
  hideDelay: 100,
  closeOnClickOutside: toRef(() => props.trigger === 'click'),
  registerStack: toRef(() => props.trigger === 'click'),
  onOpen: show,
  onClose: hide,
});

// focus 模式：焦点进入显示、离开关闭
const onFocusIn = () => {
  if (props.trigger === 'focus') show();
};
const onFocusOut = () => {
  if (props.trigger === 'focus') hide();
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
</script>

<style scoped>
.tooltip-trigger {
  display: block;
}

.tooltip-container {
  position: fixed;
  z-index: var(--z-tooltip);
  max-width: 280px;
  background: hsl(var(--text));
  border-radius: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  box-shadow: 0 4px 12px hsl(var(--shadow));
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  transition: transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  z-index: -1;
}

.tooltip-top .tooltip-arrow {
  border-top-color: hsl(var(--text));
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-bottom .tooltip-arrow {
  border-bottom-color: hsl(var(--text));
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-left .tooltip-arrow {
  border-left-color: hsl(var(--text));
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
}

.tooltip-right .tooltip-arrow {
  border-right-color: hsl(var(--text));
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
}

.tooltip-content {
  padding: 6px 10px;
  font-size: 12px;
  color: white;
  line-height: 1.4;
}

.tooltip-enter-active {
  animation: tooltipIn 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.tooltip-leave-active {
  animation: tooltipIn 0.2s cubic-bezier(0.22, 0.61, 0.36, 1) reverse;
}

@keyframes tooltipIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tooltip-top {
  transform-origin: bottom center;
}

.tooltip-bottom {
  transform-origin: top center;
}

.tooltip-left {
  transform-origin: right center;
}

.tooltip-right {
  transform-origin: left center;
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .tooltip-container {
    max-width: 200px;
    border-radius: 6px;
  }
  
  .tooltip-content {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .tooltip-arrow {
    border-width: 5px;
  }
  
  .tooltip-top .tooltip-arrow {
    bottom: -10px;
  }
  
  .tooltip-bottom .tooltip-arrow {
    top: -10px;
  }
  
  .tooltip-left .tooltip-arrow {
    right: -10px;
  }
  
  .tooltip-right .tooltip-arrow {
    left: -10px;
  }
}
</style>
