&lt;!--
LayoutSider 布局侧边栏组件

## 公开属性
- width: number - 侧边栏宽度，默认值为 240
- collapsedWidth: number - 折叠后的宽度，默认值为 64
- collapsed: boolean - 是否折叠，默认值为 false
- collapsible: boolean - 是否可折叠，默认值为 true
- showLogo: boolean - 是否显示 Logo，默认值为 true
- title: string - 侧边栏标题，默认值为 '管理平台'
- mobileVisible: boolean - 移动端抽屉是否可见，默认值为 false
- customClass: string - 自定义类名，默认值为 ''
- drawerZIndex: number - 抽屉 z-index，默认值为 1000

## 公开方法
- toggleCollapsed(): 切换折叠状态
- openMobileDrawer(): 打开移动端抽屉
- closeMobileDrawer(): 关闭移动端抽屉

## 事件
- update:collapsed: 折叠状态变化时触发
- update:mobileVisible: 移动端抽屉状态变化时触发
- collapse: 折叠状态变化时触发
- mobile-open: 移动端抽屉打开时触发
- mobile-close: 移动端抽屉关闭时触发

## 使用方式
```vue
&lt;Layout hasSider&gt;
  &lt;LayoutSider
    :width="240"
    :collapsed-width="64"
    v-model:collapsed="collapsed"
    v-model:mobile-visible="mobileVisible"
  &gt;
    &lt;template #logo&gt;
      &lt;div class="custom-logo"&gt;AIepoch&lt;/div&gt;
    &lt;/template&gt;
    &lt;Menu&gt;
      &lt;MenuItem key="1"&gt;首页&lt;/MenuItem&gt;
      &lt;MenuItem key="2"&gt;设置&lt;/MenuItem&gt;
    &lt;/Menu&gt;
    &lt;template #footer&gt;
      &lt;div class="user-info"&gt;用户信息&lt;/div&gt;
    &lt;/template&gt;
  &lt;/LayoutSider&gt;
  &lt;Layout&gt;
    &lt;LayoutHeader&gt;头部&lt;/LayoutHeader&gt;
    &lt;LayoutContent&gt;内容&lt;/LayoutContent&gt;
  &lt;/Layout&gt;
&lt;/Layout&gt;
```
--&gt;
<template>
  <aside :class="layoutSiderClass" :style="siderStyle">
    <!-- 桌面端侧边栏 -->
    <MediaQuery query=">=md">
      <div class="layout-sider-inner">
        <!-- Logo区域 -->
        <div v-if="showLogo" class="layout-sider-logo">
          <slot name="logo">
            <div class="default-logo">
              <Icon name="layout" :size="24" />
              <span v-if="!collapsed" class="logo-text">{{ title }}</span>
            </div>
          </slot>
        </div>

        <!-- 菜单区域 -->
        <div class="layout-sider-menu">
          <slot />
        </div>

        <!-- 底部区域 -->
        <div v-if="$slots.footer" class="layout-sider-footer">
          <slot name="footer" :collapsed="collapsed" />
        </div>

        <!-- 折叠按钮 -->
        <button
          v-if="collapsible"
          type="button"
          class="layout-sider-trigger"
          :aria-label="collapsed ? t('components.layout.layoutSider.expand') : t('components.layout.layoutSider.collapse')"
          :aria-expanded="!collapsed"
          @click="toggleCollapsed"
        >
          <slot name="trigger" :collapsed="collapsed">
            <div class="default-trigger">
              <Icon :name="collapsed ? 'chevron-right' : 'chevron-left'" :size="16" />
            </div>
          </slot>
        </button>
      </div>
    </MediaQuery>

    <!-- 移动端抽屉 -->
    <MediaQuery query="<=md">
      <!-- 遮罩层 -->
      <Transition name="drawer-mask">
        <div
          v-if="mobileVisible"
          class="layout-sider-mobile-mask"
          v-bind="overlayDispatch"
          @click="closeMobileDrawer"
        />
      </Transition>

      <!-- 抽屉内容 -->
      <Transition name="drawer" @after-leave="afterLeave">
        <div v-if="mobileVisible" ref="mobileDrawerRef" class="layout-sider-mobile-drawer" :style="drawerStyle">
          <div class="layout-sider-mobile-header">
            <slot name="mobile-header">
              <div class="default-mobile-header">
                <div v-if="showLogo" class="layout-sider-logo">
                  <slot name="logo">
                    <div class="default-logo">
                      <Icon name="layout" :size="24" />
                      <span class="logo-text">{{ title }}</span>
                    </div>
                  </slot>
                </div>
                <Button
                  variant="icon"
                  size="sm"
                  custom-class="mobile-close-btn"
                  @click="closeMobileDrawer"
                >
                  <Icon name="close" :size="20" />
                </Button>
              </div>
            </slot>
          </div>

          <div class="layout-sider-mobile-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="layout-sider-mobile-footer">
            <slot name="footer" :collapsed="false" />
          </div>
        </div>
      </Transition>
    </MediaQuery>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { MediaQuery, Icon, Button, useUiT } from '@ocpui/vue';
import { shellDispatchAttrs, useOverlayLayer } from '@ocpui/vue/system';

const { uiT: t } = useUiT();
const overlayDispatch = shellDispatchAttrs('overlay-host', 'restore-trigger');

interface Props {
  width?: number;
  collapsedWidth?: number;
  collapsed?: boolean;
  collapsible?: boolean;
  showLogo?: boolean;
  title?: string;
  mobileVisible?: boolean;
  customClass?: string;
  drawerZIndex?: number;
  /** classic：贴边侧栏；glass-dock：管理台玻璃浮岛（见 admin-chrome） */
  variant?: 'classic' | 'glass-dock';
}

const props = withDefaults(defineProps<Props>(), {
  width: 240,
  collapsedWidth: 64,
  collapsed: false,
  collapsible: true,
  showLogo: false,
  title: 'LOGO',
  mobileVisible: false,
  customClass: '',
  drawerZIndex: 1000,
  variant: 'classic',
});

const emit = defineEmits<{
  'update:collapsed': [value: boolean];
  'update:mobileVisible': [value: boolean];
  'collapse': [collapsed: boolean];
  'mobile-open': [];
  'mobile-close': [];
}>();

// 类名计算
const layoutSiderClass = computed(() => {
  const classes = ['layout-sider'];
  if (props.variant === 'glass-dock') {
    classes.push('layout-sider--glass-dock', 'ocp-admin-sider');
    if (props.mobileVisible) {
      classes.push('ocp-admin-sider--open');
    }
  }
  if (props.collapsed) {
    classes.push('layout-sider--collapsed');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

// 侧边栏样式
const siderStyle = computed(() => {
  const currentWidth = props.collapsed ? props.collapsedWidth : props.width;
  return {
    '--sider-width': `${props.width}px`,
    '--sider-collapsed-width': `${props.collapsedWidth}px`,
    'width': `${currentWidth}px`,
    'flexShrink': '0',
  };
});

// 抽屉样式
const drawerStyle = computed(() => {
  return {
    width: `${props.width}px`,
    zIndex: props.drawerZIndex,
  };
});

// 切换折叠状态
const toggleCollapsed = () => {
  const newValue = !props.collapsed;
  emit('update:collapsed', newValue);
  emit('collapse', newValue);
};

// 关闭移动端抽屉
const closeMobileDrawer = () => {
  emit('update:mobileVisible', false);
  emit('mobile-close');
};

// 打开移动端抽屉
const openMobileDrawer = () => {
  emit('update:mobileVisible', true);
  emit('mobile-open');
};

const mobileDrawerRef = ref<HTMLElement>();

/* 移动端抽屉作为 overlay 入栈：滚动锁 + W4 视觉降焦；
   就地（非 Teleport）浮层不做背景 inert，避免误隔离同树抽屉；Esc/Tab 收口 */
const { afterLeave } = useOverlayLayer(computed(() => props.mobileVisible), {
  container: mobileDrawerRef,
  isolate: false,
  onRequestClose: closeMobileDrawer,
});

// 暴露方法
defineExpose({
  toggleCollapsed,
  openMobileDrawer,
  closeMobileDrawer,
});
</script>

<style scoped>
.layout-sider {
  position: relative;
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: width 0.3s var(--ease-out);
}

.layout-sider--glass-dock {
  width: auto !important;
  height: auto;
  border: none;
  background: transparent;
}

.layout-sider--glass-dock .layout-sider-inner {
  display: none;
}

/* 桌面端样式 */
.layout-sider-inner {
  position: sticky;
  top: 0;
  height: 100vh;
  width: var(--sider-width);
  background: hsl(var(--surface));
  border-right: 1px solid hsl(var(--border));
  display: flex;
  flex-direction: column;
  transition: width 0.3s var(--ease-out);
  z-index: var(--z-sticky);
}

.layout-sider--collapsed .layout-sider-inner {
  width: var(--sider-collapsed-width);
}

/* Logo区域 */
.layout-sider-logo {
  flex-shrink: 0;
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid hsl(var(--border));
  overflow: hidden;
}

.default-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: hsl(var(--primary));
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: hsl(var(--text));
  white-space: nowrap;
  transition: opacity 0.3s var(--ease-out);
}

.layout-sider--collapsed .logo-text {
  opacity: 0;
  width: 0;
}

/* 菜单区域 */
.layout-sider-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条 */
.layout-sider-menu::-webkit-scrollbar {
  width: 4px;
}

.layout-sider-menu::-webkit-scrollbar-track {
  background: transparent;
}

.layout-sider-menu::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 2px;
}

.layout-sider-menu::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--text-muted));
}

/* 底部区域 */
.layout-sider-footer {
  flex-shrink: 0;
  padding: 12px;
  border-top: 1px solid hsl(var(--border));
}

/* 折叠按钮 */
.layout-sider-trigger {
  position: absolute;
  right: -12px;
  top: 72px;
  z-index: var(--z-fixed);
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
}

.default-trigger {
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--text-muted));
  transition: background-color 0.2s var(--ease-out), border-color 0.2s var(--ease-out), color 0.2s var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.layout-sider-trigger::before {
  content: '';
  position: absolute;
  inset: -8px;
}

.default-trigger:hover {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--surface));
}

/* 移动端样式 */
.layout-sider-mobile-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsl(var(--shadow) / 0.5);
  backdrop-filter: blur(4px);
  z-index: var(--z-overlay);
}

.layout-sider-mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  background: hsl(var(--surface));
  box-shadow: 4px 0 24px hsl(var(--shadow) / 0.2);
  display: flex;
  flex-direction: column;
  z-index: var(--z-modal);
}

.layout-sider-mobile-header {
  flex-shrink: 0;
  padding: 16px 20px;
  border-bottom: 1px solid hsl(var(--border));
}

.default-mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.default-mobile-header .layout-sider-logo {
  height: auto;
  padding: 0;
  border: none;
}

.mobile-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.layout-sider-mobile-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.layout-sider-mobile-footer {
  flex-shrink: 0;
  padding: 16px;
  border-top: 1px solid hsl(var(--border));
  /* 与侧边栏容器保持同一表面层级 */
  background: transparent;
}

/* 遮罩层动画 */
.drawer-mask-enter-active,
.drawer-mask-leave-active {
  transition: opacity 0.3s var(--ease-out);
}

.drawer-mask-enter-from,
.drawer-mask-leave-to {
  opacity: 0;
}

/* 抽屉动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s var(--ease-out);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}

/* 响应式隐藏 */
@media (max-width: 767.98px) {
  .layout-sider-inner {
    display: none;
  }
  
  /* 移动端LayoutSider默认隐藏，不占据空间 */
  .layout-sider {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-overlay);
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
  }
  
  /* 当抽屉显示时，恢复可见性和指针事件 */
  .layout-sider:has(.layout-sider-mobile-mask) {
    pointer-events: auto;
    opacity: 1;
    visibility: visible;
  }
  
  /* 确保遮罩层可以接收点击事件 */
  .layout-sider-mobile-mask {
    pointer-events: auto;
  }
  
  /* 移动端抽屉恢复指针事件 */
  .layout-sider-mobile-drawer {
    pointer-events: auto;
  }
}

@media (min-width: 768px) {
  .layout-sider-mobile-mask,
  .layout-sider-mobile-drawer {
    display: none !important;
  }
  
  /* 桌面端恢复LayoutSider正常布局 */
  .layout-sider {
    position: relative;
    pointer-events: auto;
  }
}
</style>
