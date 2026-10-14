<!--
Drawer 抽屉组件

设计理念：
- 简洁但功能健全：支持四个方向抽屉、自定义内容
- 无认知负担：直观的滑动关闭、直观的标题栏
- 响应式设计：移动端全宽、手势滑动关闭
- 完善的键盘支持：ESC 关闭、焦点管理

属性：
- modelValue (v-model): 是否显示，默认值：false
- title: 标题，默认值：''
- placement: 位置，可选值：left, right, top, bottom，默认值：right
- width: 宽度，默认值：400
- height: 高度，默认值：300
- size: 尺寸，可选值：sm, md, lg, xl，默认值：md（优先级高于 width/height）
- mask: 是否显示遮罩，默认值：true
- maskClosable: 点击遮罩是否可关闭，默认值：true
- closable: 是否显示关闭按钮，默认值：true
- closeOnEscape: 是否支持 ESC 关闭，默认值：true
- showHeader: 是否显示头部，默认值：true
- swipeToClose: 是否支持手势滑动关闭（移动端），默认值：true
- destroyOnClose: 关闭时是否销毁内容，默认值：false

事件：
- update:modelValue: 更新可见状态时触发
- open: 打开时触发
- close: 关闭时触发
- opened: 打开动画完成时触发
- closed: 关闭动画完成时触发

插槽：
- default: 内容区域
- title: 自定义标题
- footer: 底部区域

使用方式：
<Drawer
  v-model="showDrawer"
  title="抽屉标题"
  placement="right"
  size="lg"
  @close="handleClose"
>
  <div>抽屉内容</div>
  <template #footer>
    <Button variant="secondary" @click="handleCancel">{{ t('components.feedback.drawer.cancel') }}</Button>
    <Button variant="primary" @click="handleConfirm">{{ t('components.feedback.drawer.confirm') }}</Button>
  </template>
</Drawer>
-->
<template>
  <Teleport to="body">
    <Transition
      name="drawer"
      @enter="onEnter"
      @after-enter="emit('opened')"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="isDrawerOpen"
        ref="drawerRootRef"
        v-bind="overlayDispatch"
        class="drawer-root"
        :class="[`drawer--${placement}`, `drawer--${size}`]"
        role="dialog"
        aria-modal="true"
        :aria-label="title || t('components.feedback.drawer.defaultTitle')"
        @click="handleRootClick"
      >
        <div
          v-if="mask"
          class="drawer-mask"
          :class="{ 'drawer-mask--clickable': maskClosable }"
        />

        <div
          ref="drawerRef"
          class="drawer-panel"
          tabindex="-1"
          :class="{ 'drawer-panel--swiping': isSwiping }"
          :style="panelStyle"
          @click.stop
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div v-if="showHeader" class="drawer-header">
            <slot name="title">
              <h3 v-if="title" class="drawer-title">{{ title }}</h3>
            </slot>
            <button
              v-if="closable"
              type="button"
              class="drawer-close"
              :aria-label="t('components.feedback.drawer.close')"
              @click="handleClose"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div class="drawer-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="drawer-footer">
            <slot name="footer" />
          </div>

          <div
            v-if="swipeToClose && isMobile"
            class="drawer-swipe-indicator"
            :class="`drawer-swipe-indicator--${placement}`"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { shellDispatchAttrs, useOverlayLayer } from '@ocpui/vue/system';

const { uiT: t } = useUiT();

const overlayDispatch = shellDispatchAttrs('overlay-host', 'restore-trigger');

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  /** 是否显示（v-model） */
  modelValue?: boolean;
  title?: string;
  placement?: DrawerPlacement;
  width?: string | number;
  height?: string | number;
  size?: DrawerSize;
  mask?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  closeOnEscape?: boolean;
  showHeader?: boolean;
  swipeToClose?: boolean;
  destroyOnClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  placement: 'right',
  width: 400,
  height: 300,
  size: 'md',
  mask: true,
  maskClosable: true,
  closable: true,
  closeOnEscape: true,
  showHeader: true,
  swipeToClose: true,
  destroyOnClose: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  open: [];
  close: [];
  opened: [];
  closed: [];
}>();

const drawerRef = ref<HTMLElement>();

const isDrawerOpen = computed(() => props.modelValue ?? false);

const contentVisible = ref(props.destroyOnClose ? isDrawerOpen.value : true);
const isMobile = ref(false);
const isSwiping = ref(false);

let touchStartX = 0;
let touchStartY = 0;
let translateOffset = 0;

const sizeWidthMap: Record<DrawerSize, string> = {
  sm: '320px',
  md: '400px',
  lg: '560px',
  xl: '720px',
};

const sizeHeightMap: Record<DrawerSize, string> = {
  sm: '200px',
  md: '300px',
  lg: '400px',
  xl: '500px',
};

const panelStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.placement === 'left' || props.placement === 'right') {
    if (props.width) {
      style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    } else {
      style.width = sizeWidthMap[props.size];
    }
  } else {
    if (props.height) {
      style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    } else {
      style.height = sizeHeightMap[props.size];
    }
  }
  
  if (isSwiping.value) {
    const axis = props.placement === 'left' || props.placement === 'right' ? 'X' : 'Y';
    const transform = axis === 'X' 
      ? `translateX(${translateOffset}px)` 
      : `translateY(${translateOffset}px)`;
    style.transform = transform;
  }
  
  return style;
});

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const handleClose = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleRootClick = () => {
  if (props.maskClosable && props.closable) {
    handleClose();
  }
};

const drawerRootRef = ref<HTMLElement>();

/* overlay 统一收口：滚动锁 + W4 降焦 + 背景 inert + 焦点 trap/恢复（Esc 受 closeOnEscape/closable 控制） */
const { afterLeave } = useOverlayLayer(isDrawerOpen, {
  container: drawerRootRef,
  closeOnEscape: computed(() => props.closeOnEscape && props.closable),
  onRequestClose: handleClose,
});

const handleTouchStart = (e: TouchEvent) => {
  if (!props.swipeToClose || !isMobile.value) return;
  
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isSwiping.value = true;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value) return;
  
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const deltaX = currentX - touchStartX;
  const deltaY = currentY - touchStartY;
  
  if (props.placement === 'right') {
    translateOffset = Math.min(0, deltaX);
  } else if (props.placement === 'left') {
    translateOffset = Math.max(0, deltaX);
  } else if (props.placement === 'bottom') {
    translateOffset = Math.min(0, deltaY);
  } else if (props.placement === 'top') {
    translateOffset = Math.max(0, deltaY);
  }
};

const handleTouchEnd = () => {
  if (!isSwiping.value) return;
  
  const threshold = 100;
  
  if (Math.abs(translateOffset) > threshold) {
    handleClose();
  }
  
  isSwiping.value = false;
  translateOffset = 0;
};

const onEnter = () => {
  if (props.destroyOnClose) {
    contentVisible.value = true;
  }
  emit('open');

  nextTick(() => {
    drawerRef.value?.focus();
  });
};

const onAfterLeave = () => {
  if (props.destroyOnClose) {
    contentVisible.value = false;
  }
  // 统一收口：离场结束出栈，栈空解除 inert 并恢复焦点到触发源
  afterLeave();
  emit('closed');
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.drawer-root {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
}

.drawer-root.drawer--left,
.drawer-root.drawer--right {
  flex-direction: row;
}

.drawer-root.drawer--top,
.drawer-root.drawer--bottom {
  flex-direction: column;
}

.drawer-root.drawer--left {
  justify-content: flex-start;
}

.drawer-root.drawer--right {
  justify-content: flex-end;
}

.drawer-root.drawer--top {
  justify-content: flex-start;
}

.drawer-root.drawer--bottom {
  justify-content: flex-end;
}

.drawer-mask {
  position: absolute;
  inset: 0;
  background: hsl(var(--overlay) / 0.6);
  backdrop-filter: blur(4px);
}

.drawer-mask--clickable {
  cursor: pointer;
}

.drawer-panel {
  position: relative;
  background: hsl(var(--surface));
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
  transition: var(--transition-drawer);
}

.drawer-panel--swiping {
  transition: none;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid hsl(var(--border) / 0.5);
  flex-shrink: 0;
  min-height: 64px;
}

.drawer-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: hsl(var(--text));
  margin: 0;
  line-height: 1.4;
}

.drawer-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md-sm);
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  flex-shrink: 0;
}

.drawer-close:hover {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
  transform: rotate(90deg);
}

.drawer-close:active {
  transform: rotate(90deg) scale(0.95);
}

.drawer-close svg {
  width: 18px;
  height: 18px;
}

.drawer-body {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
  color: hsl(var(--text-secondary));
}

.drawer-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid hsl(var(--border) / 0.5);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  flex-shrink: 0;
}

.drawer-swipe-indicator {
  position: absolute;
  background: hsl(var(--text-muted) / 0.3);
  border-radius: 3px;
}

.drawer-swipe-indicator--right,
.drawer-swipe-indicator--left {
  width: 4px;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
}

.drawer-swipe-indicator--right {
  left: 4px;
}

.drawer-swipe-indicator--left {
  right: 4px;
}

.drawer-swipe-indicator--top,
.drawer-swipe-indicator--bottom {
  height: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
}

.drawer-swipe-indicator--top {
  bottom: 4px;
}

.drawer-swipe-indicator--bottom {
  top: 4px;
}

/* 过渡动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out, var(--ease-standard));
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .drawer-mask,
.drawer-leave-active .drawer-mask {
  transition: opacity var(--duration-normal) var(--ease-out, var(--ease-standard));
}

.drawer-enter-from .drawer-mask,
.drawer-leave-to .drawer-mask {
  opacity: 0;
}

.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: var(--transition-drawer);
}

.drawer-enter-from.drawer--right .drawer-panel,
.drawer-leave-to.drawer--right .drawer-panel {
  transform: translateX(100%);
}

.drawer-enter-from.drawer--left .drawer-panel,
.drawer-leave-to.drawer--left .drawer-panel {
  transform: translateX(-100%);
}

.drawer-enter-from.drawer--bottom .drawer-panel,
.drawer-leave-to.drawer--bottom .drawer-panel {
  transform: translateY(100%);
}

.drawer-enter-from.drawer--top .drawer-panel,
.drawer-leave-to.drawer--top .drawer-panel {
  transform: translateY(-100%);
}

/* 响应式 */
@media (max-width: 767.98px) {
  .drawer-panel {
    max-width: 100vw;
    max-height: 100vh;
  }

  .drawer--left,
  .drawer--right {
    justify-content: flex-end;
  }

  .drawer--top,
  .drawer--bottom {
    justify-content: flex-end;
  }

  .drawer-panel {
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }

  .drawer--left .drawer-panel,
  .drawer--right .drawer-panel {
    width: 100% !important;
    height: 85vh;
    max-height: 85vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }

  .drawer--top .drawer-panel,
  .drawer--bottom .drawer-panel {
    height: 85vh !important;
    max-height: 85vh;
    width: 100vw;
  }

  .drawer--top .drawer-panel {
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  }

  .drawer-header,
  .drawer-body,
  .drawer-footer {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .drawer-footer {
    flex-direction: column-reverse;
    gap: var(--space-2);
  }

  .drawer-footer > :deep(*) {
    width: 100%;
  }

  .drawer-swipe-indicator {
    display: block;
  }
}

/* 桌面端隐藏滑动指示器 */
@media (min-width: 768px) {
  .drawer-swipe-indicator {
    display: none;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .drawer-panel,
  .drawer-enter-active,
  .drawer-leave-active,
  .drawer-enter-active .drawer-panel,
  .drawer-leave-active .drawer-panel,
  .drawer-enter-active .drawer-mask,
  .drawer-leave-active .drawer-mask {
    animation: none;
    transition: opacity var(--duration-fast);
  }
}
</style>
