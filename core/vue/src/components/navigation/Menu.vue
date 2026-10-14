<template>
  <nav
    ref="menuRef"
    data-part="menu-root"
    :class="menuClass"
    :aria-label="t('components.navigation.menu.ariaLabel')"
  >
    <ul class="menu-list" data-part="menu-list" :role="mode === 'horizontal' ? 'menubar' : 'menu'">
      <template v-for="item in items" :key="item.key">
        <li
          class="menu-item"
          data-part="menu-item"
          :class="{
            'menu-item--active': isItemActive(item),
            'menu-item--disabled': item.disabled,
            'menu-item--has-children': hasChildren(item),
            'menu-item--expanded': isExpanded(item.key)
          }"
          @click="handleItemClick(item)"
          @keydown="handleKeydown(item, $event)"
          @mouseenter="handleMouseEnter(item, $event)"
          @mouseleave="handleMouseLeave($event)"
          :tabindex="item.disabled ? -1 : 0"
          role="menuitem"
          :aria-disabled="item.disabled"
          :aria-haspopup="hasChildren(item) ? 'menu' : undefined"
          :aria-expanded="hasChildren(item) ? isExpanded(item.key) : undefined"
        >
          <Tooltip v-if="collapsed && !hasChildren(item)" :content="item.label" placement="right">
            <span class="menu-item-hit">
              <span class="menu-item-icon">
                <component :is="item.icon" v-if="isComponent(item.icon)" />
                <Icon v-else-if="item.iconSvg" :svg="item.iconSvg" :size="18" />
                <Icon v-else-if="typeof item.icon === 'string'" :name="item.icon" :size="18" />
              </span>
            </span>
          </Tooltip>
          <span v-else class="menu-item-icon">
            <component :is="item.icon" v-if="isComponent(item.icon)" />
            <Icon v-else-if="item.iconSvg" :svg="item.iconSvg" :size="18" />
            <Icon v-else-if="typeof item.icon === 'string'" :name="item.icon" :size="18" />
          </span>
          <span v-if="!collapsed" class="menu-item-label" data-part="menu-item-label">{{ item.label }}</span>
          <Badge
            v-if="!collapsed && item.badge"
            :count="item.badge"
            class="menu-item-badge"
          />
          <span
            v-if="!collapsed && hasChildren(item)"
            class="menu-item-arrow"
            :class="{ 'menu-item-arrow--rotated': isExpanded(item.key) }"
            @click="handleArrowClick(item, $event)"
          >
            <Icon name="chevron-down" :size="12" />
          </span>
        </li>

        <!-- 子菜单 -->
        <CollapseTransition>
          <li
            v-if="!collapsed && hasChildren(item) && isExpanded(item.key)"
            class="menu-sub-list-wrapper"
          >
            <ul class="menu-sub-list">
              <MenuBranch
                v-for="child in item.children"
                :key="child.key"
                :item="child"
                :parent="item"
                :depth="1"
                :selected-key="selectedKey"
                :expanded-keys="expandedKeys"
                @activate="handleActivate"
                @toggle="toggleExpand"
              />
            </ul>
          </li>
        </CollapseTransition>
      </template>
    </ul>

    <!-- 折叠状态下的子菜单弹出面板 -->
    <Teleport to="body">
      <Transition name="sub-popup">
        <div
          v-if="collapsed && showSubPopup && hoveredItem && hasChildren(hoveredItem)"
          ref="popupRef"
          class="sub-menu-popup"
          @mouseenter="handleSubPopupMouseEnter"
          @mouseleave="handleSubPopupMouseLeave"
        >
          <div class="sub-menu-popup-title">{{ hoveredItem.label }}</div>
          <ul class="sub-menu-popup-list">
            <li
              v-for="child in collectLeaves(hoveredItem.children)"
              :key="child.key"
              class="sub-menu-popup-item"
              :class="{
                'sub-menu-popup-item--active': selectedKey === child.key,
                'sub-menu-popup-item--disabled': child.disabled
              }"
              @click="handleChildClickInPopup(child, hoveredItem)"
            >
              <span v-if="child.icon || child.iconSvg" class="sub-menu-popup-item-icon">
                  <component :is="child.icon" v-if="isComponent(child.icon)" />
                  <Icon v-else-if="child.iconSvg" :svg="child.iconSvg" :size="16" />
                  <Icon v-else-if="typeof child.icon === 'string'" :name="child.icon" :size="16" />
                </span>
              <span class="sub-menu-popup-item-label">{{ child.label }}</span>
              <Badge
                v-if="child.badge"
                :count="child.badge"
                class="sub-menu-popup-item-badge"
              />
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { CollapseTransition } from '../animation';
import { Badge, Icon } from '../utility';
import { Tooltip } from '../feedback';
import { useFloatingPosition } from '../composables/useFloatingPosition';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

/**
 * 导航菜单组件，用于显示层级导航
 *
 * @props items - 菜单项数组，支持嵌套子菜单
 * @props modelValue - 绑定值，当前选中的菜单项 key
 * @props mode - 菜单模式，可选 'horizontal' 或 'vertical'，默认为 'vertical'
 * @props collapsed - 是否折叠，默认为 false
 * @props accordion - 是否为手风琴模式，默认为 false
 * @props customClass - 自定义类名
 *
 * @emits update:modelValue - 当选中项变化时触发
 * @emits select - 当选择菜单项时触发，参数为选中的项和父项
 *
 * @usage
 * <Menu
 *   :items="[
 *     { key: '1', label: '首页', icon: 'home' },
 *     { key: '2', label: '设置', children: [
 *       { key: '2-1', label: '用户设置' },
 *       { key: '2-2', label: '系统设置' }
 *     ]}
 *   ]"
 *   v-model="selectedKey"
 * />
 */

import type { MenuItem } from './types';
import MenuBranch from './MenuBranch.vue';

interface Props {
  items: MenuItem[];
  modelValue?: string | number;
  mode?: 'horizontal' | 'vertical';
  collapsed?: boolean;
  accordion?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  modelValue: '',
  mode: 'vertical',
  collapsed: false,
  accordion: false,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [string | number];
  'select': [item: MenuItem, parent?: MenuItem];
  'expand': [keys: string[]];
}>();

const menuRef = ref<HTMLElement>();
const popupRef = ref<HTMLElement>();
const hoverAnchorRef = ref<HTMLElement | null>(null);
const selectedKey = computed(() => props.modelValue);
const expandedKeys = ref<string[]>([]);
const hoveredKey = ref<string | number | null>(null);
const showSubPopup = ref(false);
let hideTimeout: ReturnType<typeof setTimeout> | null = null;
let enterPopup = false;

const popupFloating = useFloatingPosition({
  reference: hoverAnchorRef,
  floating: popupRef,
  placement: 'right-start',
  offsetPx: 6,
});

const hoveredItem = computed(() => {
  if (!hoveredKey.value) return null;
  const findItem = (items: MenuItem[]): MenuItem | null => {
    for (const item of items) {
      if (item.key === hoveredKey.value) return item;
      if (item.children) {
        const found = findItem(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  return findItem(props.items);
});

// 监听modelValue变化，自动展开父菜单
watch(() => props.modelValue, (newVal) => {
  if (!newVal) return;
  const keys = collectAncestorKeys(props.items, newVal) ?? [];
  let changed = false;
  for (const key of keys) {
    if (!expandedKeys.value.includes(key)) {
      expandedKeys.value.push(key);
      changed = true;
    }
  }
  if (changed) emit('expand', expandedKeys.value);
}, { immediate: true });

const menuClass = computed(() => {
  const classes = ['menu', `menu--${props.mode}`];
  if (props.collapsed) {
    classes.push('menu--collapsed');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const hasChildren = (item: MenuItem): boolean => {
  return !!(item.children && item.children.length > 0);
};

const isExpanded = (key: string | number): boolean => {
  return expandedKeys.value.includes(key as string);
};

const isItemActive = (item: MenuItem): boolean => {
  if (selectedKey.value === item.key) return true;
  return Boolean(item.children?.some((child) => isItemActive(child)));
};

function collectLeaves(items: MenuItem[] | undefined): MenuItem[] {
  if (!items?.length) return [];
  const out: MenuItem[] = [];
  for (const node of items) {
    if (node.children?.length) out.push(...collectLeaves(node.children));
    else out.push(node);
  }
  return out;
}

function collectAncestorKeys(
  items: MenuItem[],
  target: string | number,
  trail: string[] = [],
): string[] | null {
  for (const node of items) {
    if (node.key === target) return trail;
    if (node.children?.length) {
      const found = collectAncestorKeys(node.children, target, [...trail, String(node.key)]);
      if (found) return found;
    }
  }
  return null;
}

const isComponent = (icon: any): boolean => {
  return typeof icon === 'object' || (typeof icon === 'function' && icon.name);
};

function siblingKeys(items: MenuItem[], target: string): string[] | null {
  if (items.some((node) => String(node.key) === target)) {
    return items.filter((node) => node.children?.length).map((node) => String(node.key));
  }
  for (const node of items) {
    if (node.children?.length) {
      const found = siblingKeys(node.children, target);
      if (found) return found;
    }
  }
  return null;
}

const toggleExpand = (item: MenuItem) => {
  const key = item.key as string;
  const index = expandedKeys.value.indexOf(key);

  if (props.accordion) {
    const peers = siblingKeys(props.items, key) ?? [key];
    expandedKeys.value = expandedKeys.value.filter((k) => !peers.includes(k));
    if (index < 0) expandedKeys.value.push(key);
  } else if (index > -1) {
    expandedKeys.value.splice(index, 1);
  } else {
    expandedKeys.value.push(key);
  }
  emit('expand', expandedKeys.value);
};

const handleItemClick = (item: MenuItem) => {
  if (item.disabled) return;

  if (hasChildren(item)) {
    toggleExpand(item);
    if (item.path) {
      emit('update:modelValue', item.key);
      emit('select', item);
    }
    return;
  }

  emit('update:modelValue', item.key);
  emit('select', item);
};

const handleArrowClick = (item: MenuItem, event: MouseEvent) => {
  event.stopPropagation();
  if (item.disabled || !hasChildren(item)) return;
  toggleExpand(item);
};

const handleActivate = (item: MenuItem, parent?: MenuItem) => {
  if (item.disabled) return;
  if (hasChildren(item)) {
    toggleExpand(item);
    if (item.path) {
      emit('update:modelValue', item.key);
      emit('select', item, parent);
    }
    return;
  }
  emit('update:modelValue', item.key);
  emit('select', item, parent);
};

const handleChildClick = (child: MenuItem, parent: MenuItem) => {
  handleActivate(child, parent);
};

const focusableItems = (): HTMLElement[] => {
  return Array.from(
    menuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
  );
};

const moveFocus = (delta: number) => {
  const items = focusableItems();
  if (items.length === 0) return;
  const current = document.activeElement as HTMLElement | null;
  const index = current ? items.indexOf(current) : -1;
  const nextIndex = index < 0 ? 0 : (index + delta + items.length) % items.length;
  items[nextIndex]?.focus();
};

const handleKeydown = (item: MenuItem, event: KeyboardEvent) => {
  if (item.disabled) return;

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleItemClick(item);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    moveFocus(1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    moveFocus(-1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    if (hasChildren(item) && !isExpanded(item.key)) toggleExpand(item);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    if (hasChildren(item) && isExpanded(item.key)) toggleExpand(item);
  } else if (event.key === 'Home') {
    event.preventDefault();
    focusMenuItem(true);
  } else if (event.key === 'End') {
    event.preventDefault();
    focusMenuItem(false);
  }
};

const focusMenuItem = (fromStart: boolean) => {
  const selector = '.menu-item[tabindex="0"]';
  const items = Array.from(menuRef.value?.querySelectorAll<HTMLElement>(selector) ?? []);
  if (items.length === 0) return;
  const index = fromStart ? 0 : items.length - 1;
  items[index].focus();
};

const handleMouseEnter = (item: MenuItem, event: MouseEvent) => {
  if (props.collapsed && !item.disabled) {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    hoveredKey.value = item.key;
    hoverAnchorRef.value = event.currentTarget as HTMLElement;
    if (hasChildren(item)) {
      showSubPopup.value = true;
    }
  }
};

const handleMouseLeave = (event: MouseEvent) => {
  if (props.collapsed) {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (relatedTarget && popupRef.value?.contains(relatedTarget)) {
      return;
    }
    hideTimeout = setTimeout(() => {
      if (!enterPopup) {
        hoveredKey.value = null;
        showSubPopup.value = false;
      }
    }, 150);
  }
};

const handleSubPopupMouseEnter = () => {
  if (props.collapsed) {
    enterPopup = true;
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }
};

const handleSubPopupMouseLeave = () => {
  if (props.collapsed) {
    enterPopup = false;
    hoveredKey.value = null;
    showSubPopup.value = false;
  }
};

const handleChildClickInPopup = (child: MenuItem, parent: MenuItem) => {
  if (child.disabled) return;
  showSubPopup.value = false;
  hoveredKey.value = null;
  emit('update:modelValue', child.key);
  emit('select', child, parent);
};

onUnmounted(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
});

watch(showSubPopup, (visible) => {
  if (visible) {
    nextTick(() => popupFloating.start());
  } else {
    popupFloating.stop();
  }
});

// 提供展开/折叠方法
defineExpose({
  expandedKeys,
  expand: (key: string | number) => {
    const keyStr = key as string;
    if (!expandedKeys.value.includes(keyStr)) {
      expandedKeys.value.push(keyStr);
      emit('expand', expandedKeys.value);
    }
  },
  collapse: (key: string | number) => {
    const keyStr = key as string;
    const index = expandedKeys.value.indexOf(keyStr);
    if (index > -1) {
      expandedKeys.value.splice(index, 1);
      emit('expand', expandedKeys.value);
    }
  },
});
</script>

<style scoped>
.menu {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 8px;
}

.menu--horizontal .menu-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.menu--vertical .menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  transition: var(--transition-wash);
}

.menu--horizontal .menu-item::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: hsl(var(--primary));
  border-radius: 2px;
  transition: width var(--duration-normal) var(--ease-out-soft, var(--ease-standard));
}

.menu-item:hover:not(.menu-item--disabled) {
  background: hsl(var(--primary) / 0.08);
  color: hsl(var(--primary));
}

.menu--horizontal .menu-item:hover:not(.menu-item--disabled)::after {
  width: 60%;
}

.menu-item--active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  font-weight: 600;
}

.menu--horizontal .menu-item--active::after {
  width: 70%;
}

.menu-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item-hit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.menu--collapsed :deep(.tooltip-trigger) {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.menu-item--disabled:hover {
  transform: none;
  background: transparent;
}

.menu-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.menu-item-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.menu-item-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item-badge {
  flex-shrink: 0;
}

.menu-item-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  width: 24px;
  height: 24px;
  transition: transform var(--duration-normal) var(--ease-out-soft, var(--ease-standard));
  color: hsl(var(--text-secondary));
  flex-shrink: 0;
  border-radius: 4px;
}

.menu-item-arrow--rotated {
  transform: rotate(180deg);
}

.menu--collapsed .menu-list {
  padding: 8px 0;
}

.menu--collapsed .menu-item {
  padding: 0;
  justify-content: center;
  margin: 4px auto;
  width: 40px;
  height: 40px;
}

.menu--collapsed .menu-item-icon {
  width: 24px;
  height: 24px;
  font-size: 20px;
}

.menu--collapsed .menu-item-label,
.menu--collapsed .menu-item-badge,
.menu--collapsed .menu-item-arrow {
  display: none;
}

.menu--vertical .menu-item {
  justify-content: flex-start;
}

.menu--vertical.menu--collapsed .menu-item {
  justify-content: center;
}

.menu--vertical .menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: hsl(var(--primary));
  border-radius: 0 2px 2px 0;
  transition: height var(--duration-normal) var(--ease-out-soft, var(--ease-standard));
}

.menu--vertical .menu-item:hover:not(.menu-item--disabled)::before,
.menu--vertical .menu-item--active::before {
  height: 70%;
}

.menu--vertical.menu--collapsed .menu-item::before {
  left: 2px;
  width: 3px;
  border-radius: 2px;
}

.menu--vertical.menu--collapsed .menu-item:hover:not(.menu-item--disabled)::before,
.menu--vertical.menu--collapsed .menu-item--active::before {
  height: 70%;
}

.menu-sub-list-wrapper {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu--vertical .menu-sub-list-wrapper {
  margin-left: 8px;
}

.menu-sub-list {
  list-style: none;
  padding: 4px 0;
  margin: 0;
  background: transparent;
  overflow: hidden;
}

.menu--vertical .menu-sub-list {
  border-left: 2px solid hsl(var(--border));
  margin-left: 27px;
  padding: 4px 0 4px 8px;
}

.menu-sub-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  border-radius: 6px;
  background: transparent;
  border: none;
  transition: background-color var(--duration-normal) var(--ease-standard),
              color var(--duration-normal) var(--ease-standard);
  margin: 2px 8px;
}

.menu-sub-item:hover:not(.menu-sub-item--disabled) {
  background: hsl(var(--primary) / 0.08);
  color: hsl(var(--primary));
}

.menu-sub-item--active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  font-weight: 600;
}

.menu-sub-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-sub-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.menu-sub-item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-sub-item-badge {
  flex-shrink: 0;
}

/* 折叠状态子菜单弹出面板 */
.sub-menu-popup {
  min-width: 180px;
  max-width: 240px;
  z-index: var(--z-popover);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.sub-menu-popup-title {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--text));
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--background-elevated));
  white-space: nowrap;
}

.sub-menu-popup-list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.sub-menu-popup-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard),
              background-color var(--duration-fast) var(--ease-standard);
}

.sub-menu-popup-item:hover:not(.sub-menu-popup-item--disabled) {
  background: hsl(var(--primary) / 0.08);
  color: hsl(var(--primary));
}

.sub-menu-popup-item--active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  font-weight: 600;
}

.sub-menu-popup-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sub-menu-popup-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.sub-menu-popup-item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-menu-popup-item-badge {
  flex-shrink: 0;
}

@keyframes subPopupIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sub-popup-enter-active {
  animation: subPopupIn var(--duration-normal) var(--ease-out-soft, var(--ease-standard));
}

.sub-popup-leave-active {
  animation: subPopupIn var(--duration-fast) var(--ease-standard) reverse;
}

@keyframes subPopupOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .menu--horizontal .menu-list {
    gap: 8px;
  }
  
  .menu-item {
    padding: 12px 16px;
    min-height: 44px;
    font-size: 14px;
  }
  
  .menu--collapsed .menu-item {
    padding: 12px;
    min-height: 44px;
  }
  
  .menu-item-icon {
    font-size: 20px;
    width: 24px;
    height: 24px;
  }
  
  .menu-sub-item {
    padding: 10px 16px;
    min-height: 40px;
  }
}
</style>
