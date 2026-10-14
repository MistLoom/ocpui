&lt;!--
ContextMenu 上下文菜单组件

## 组件说明
用于创建自定义上下文菜单，支持多级子菜单、快捷键显示、禁用状态等功能。

## 公开属性
- items: ContextMenuItem[] - 菜单项配置数组
- minWidth: number - 菜单最小宽度，默认为 160
- maxWidth: number - 菜单最大宽度，默认为 320

## 事件
- select: 选中菜单项时触发，参数为选中的菜单项
- visible-change: 菜单显示状态变化时触发，参数为布尔值

## 暴露方法
- open: 打开菜单，参数为鼠标事件
- close: 关闭菜单

## 使用方式
```vue
&lt;ContextMenu
  :items="menuItems"
  @select="handleMenuSelect"
&gt;
  &lt;template #default="{ open, close }"&gt;
    &lt;div @contextmenu="open"&gt;
      右键点击这里打开上下文菜单
    &lt;/div&gt;
  &lt;/template&gt;
&lt;/ContextMenu&gt;
```

## 菜单项配置
```typescript
interface ContextMenuItem {
  key?: string;           // 菜单项唯一标识
  label: string;          // 菜单项文本
  icon?: string;          // 菜单项图标
  shortcut?: string;      // 快捷键
  disabled?: boolean;     // 是否禁用
  danger?: boolean;       // 是否为危险操作
  checked?: boolean;      // 是否选中
  divided?: boolean;      // 是否显示分隔线
  children?: ContextMenuItem[];  // 子菜单
  handler?: () =&gt; void;   // 点击处理函数
}
```
--&gt;

<template>
  <div class="context-menu-wrapper">
    <slot :open="openMenu" :close="closeMenu" />
  </div>

  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="visible"
        ref="menuRef"
        class="context-menu"
        :style="menuStyle"
        tabindex="-1"
        @mouseleave="handleMenuLeave"
      >
        <div class="context-menu-content">
          <template v-for="(item, index) in processedItems" :key="item.key || index">
            <div
              v-if="item.divided && index > 0"
              class="context-menu-divider"
            />
            <div
              v-if="!item.divided"
              :class="menuItemClass(item)"
              @click="handleItemClick(item)"
              @mouseenter="handleItemHover(item, $event)"
              @mouseleave="handleItemLeave"
            >
              <span v-if="item.icon" class="context-menu-item-icon">
                <Icon :name="item.icon" />
              </span>
              <span v-if="item.label" class="context-menu-item-label">{{ item.label }}</span>
              <span v-if="item.shortcut" class="context-menu-item-shortcut">
                <ShortcutLabel :shortcut="item.shortcut" size="sm" />
              </span>
              <span v-if="item.children" class="context-menu-item-arrow">
                <svg viewBox="0 0 12 12" fill="currentColor">
                  <path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span v-if="item.checked !== undefined" class="context-menu-item-check">
                <svg v-if="item.checked" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M2 6L4.5 8.5L10 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>

            <!-- 子菜单 -->
            <div
              v-if="item.children && activeSubmenu === item.key"
              class="context-submenu"
              :style="submenuStyle"
              @mouseenter="clearSubmenuCloseTimer"
              @mouseleave="handleSubmenuLeave"
            >
              <div
                v-for="(child, childIndex) in item.children"
                :key="child.key || childIndex"
                :class="menuItemClass(child)"
                @click="handleItemClick(child)"
              >
                <span v-if="child.icon" class="context-menu-item-icon">
                  <Icon :name="child.icon" />
                </span>
                <span class="context-menu-item-label">{{ child.label }}</span>
                <span v-if="child.shortcut" class="context-menu-item-shortcut">
                  <ShortcutLabel :shortcut="child.shortcut" size="sm" />
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';
import { onClickOutside } from '@vueuse/core';
import ShortcutLabel from './ShortcutLabel.vue';
import Icon from '../utility/Icon.vue';
import { useOverlayLayer } from '@ocpui/vue/system';
import type { ContextMenuItem } from '../types';

interface Props {
  items: ContextMenuItem[];
  minWidth?: number;
  maxWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  minWidth: 160,
  maxWidth: 320,
});

const emit = defineEmits<{
  select: [item: ContextMenuItem];
  'visible-change': [visible: boolean];
}>();

const visible = ref(false);
const menuRef = ref<HTMLElement>();
const menuPosition = ref({ x: 0, y: 0 });
const activeSubmenu = ref<string | null>(null);
const submenuPosition = ref({ x: 0, y: 0 });
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const processedItems = computed(() => {
  return props.items.map((item, index) => ({
    ...item,
    key: item.key || `item-${index}`,
  }));
});

const menuStyle = computed(() => {
  return {
    position: 'fixed',
    left: `${menuPosition.value.x}px`,
    top: `${menuPosition.value.y}px`,
    minWidth: `${props.minWidth}px`,
    maxWidth: `${props.maxWidth}px`,
  } as Record<string, string>;
});

const submenuStyle = computed(() => {
  return {
    position: 'fixed',
    left: `${submenuPosition.value.x}px`,
    top: `${submenuPosition.value.y}px`,
    minWidth: `${props.minWidth}px`,
    maxWidth: `${props.maxWidth}px`,
  } as Record<string, string>;
});

const menuItemClass = (item: ContextMenuItem) => {
  const classes = ['context-menu-item'];
  if (item.disabled) {
    classes.push('context-menu-item--disabled');
  }
  if (item.danger) {
    classes.push('context-menu-item--danger');
  }
  if (item.checked) {
    classes.push('context-menu-item--checked');
  }
  return classes;
};

const calculatePosition = (x: number, y: number) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const menuWidth = props.minWidth;
  const menuHeight = Math.min(props.items.length * 40 + 16, 400);

  let posX = x;
  let posY = y;

  // 右边界检测
  if (posX + menuWidth > viewportWidth - 16) {
    posX = x - menuWidth;
  }

  // 下边界检测
  if (posY + menuHeight > viewportHeight - 16) {
    posY = viewportHeight - menuHeight - 16;
  }

  // 确保不超出左上角
  posX = Math.max(16, posX);
  posY = Math.max(16, posY);

  return { x: posX, y: posY };
};

const openMenu = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();

  visible.value = true;
  activeSubmenu.value = null;

  nextTick(() => {
    menuPosition.value = calculatePosition(event.clientX, event.clientY);
    menuRef.value?.focus();
  });

  emit('visible-change', true);
};

const closeMenu = () => {
  visible.value = false;
  activeSubmenu.value = null;
  clearSubmenuCloseTimer();
  emit('visible-change', false);
};

const handleItemClick = (item: ContextMenuItem) => {
  if (item.disabled) return;

  if (item.children) {
    activeSubmenu.value = activeSubmenu.value === item.key ? null : item.key as string;
    return;
  }

  emit('select', item);

  if (item.handler) {
    item.handler();
  }

  closeMenu();
};

const handleItemHover = (item: ContextMenuItem, event: MouseEvent) => {
  if (!item.children) {
    activeSubmenu.value = null;
    return;
  }

  clearSubmenuCloseTimer();

  activeSubmenu.value = item.key as string;

  nextTick(() => {
    const menuRect = menuRef.value?.getBoundingClientRect();
    if (!menuRect) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const submenuWidth = props.minWidth;
    const submenuHeight = (item.children?.length || 0) * 40 + 16;

    let posX = menuRect.right + 4;
    let posY = menuRect.top;

    // 使用鼠标事件的目标元素位置作为参考
    const target = event.currentTarget as HTMLElement;
    const targetRect = target.getBoundingClientRect();
    posY = targetRect.top;

    // 右边界检测 - 如果超出则显示在左侧
    if (posX + submenuWidth > viewportWidth - 16) {
      posX = menuRect.left - submenuWidth - 4;
    }

    // 下边界检测
    if (posY + submenuHeight > viewportHeight - 16) {
      posY = viewportHeight - submenuHeight - 16;
    }

    // 确保不超出顶部
    posY = Math.max(16, posY);

    submenuPosition.value = { x: posX, y: posY };
  });
};

const handleItemLeave = () => {
  startSubmenuCloseTimer();
};

const handleMenuLeave = () => {
  startSubmenuCloseTimer();
};

const handleSubmenuLeave = () => {
  startSubmenuCloseTimer();
};

const startSubmenuCloseTimer = () => {
  clearSubmenuCloseTimer();
  closeTimer = setTimeout(() => {
    activeSubmenu.value = null;
  }, 200);
};

const clearSubmenuCloseTimer = () => {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
};

const handleClickOutside = () => {
  closeMenu();
};

// 非模态浮层：入栈统一 Esc（按栈顶派发）；无离场动画，隐藏即出栈
useOverlayLayer(visible, {
  modal: false,
  lockScroll: false,
  deemphasis: false,
  isolate: false,
  releaseWhenHidden: true,
  onRequestClose: closeMenu,
});

// 菜单外点击关闭（仅可见时以菜单为激活目标；onClickOutside 自动忽略打开当次事件）
onClickOutside(
  () => (visible.value ? menuRef.value : null),
  handleClickOutside,
);

onUnmounted(() => {
  clearSubmenuCloseTimer();
});

defineExpose({
  open: openMenu,
  close: closeMenu,
});
</script>

<style scoped>
.context-menu-wrapper {
  display: contents;
}

.context-menu {
  z-index: var(--z-popover);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.context-menu-content {
  padding: 8px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 2px;
  font-size: 14px;
  color: hsl(var(--text));
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative;
}

.context-menu-item:last-child {
  margin-bottom: 0;
}

.context-menu-item:hover:not(.context-menu-item--disabled) {
  background: hsl(var(--surface-hover));
}

.context-menu-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.context-menu-item--danger {
  color: hsl(var(--error));
}

.context-menu-item--danger:hover:not(.context-menu-item--disabled) {
  background: hsl(var(--error) / 0.1);
}

.context-menu-item--checked {
  background: hsl(var(--primary) / 0.08);
}

.context-menu-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: hsl(var(--text-secondary));
}

.context-menu-item-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.context-menu-item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.context-menu-item-shortcut {
  flex-shrink: 0;
}

.context-menu-item-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: hsl(var(--text-muted));
}

.context-menu-item-arrow svg {
  width: 12px;
  height: 12px;
}

.context-menu-item-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: hsl(var(--primary));
}

.context-menu-item-check svg {
  width: 14px;
  height: 14px;
}

.context-menu-divider {
  height: 1px;
  background: hsl(var(--border));
  margin: 8px 0;
}

/* 子菜单 */
.context-submenu {
  z-index: var(--z-popover);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: 8px;
  min-width: 160px;
}

/* 动画 */
.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.context-menu-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
