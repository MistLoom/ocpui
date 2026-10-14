<template>
  <li
    :class="itemClass"
    data-part="menu-item"
    :tabindex="item.disabled ? -1 : 0"
    role="menuitem"
    :aria-disabled="item.disabled"
    :aria-haspopup="hasChildren ? 'menu' : undefined"
    :aria-expanded="hasChildren ? expanded : undefined"
    @click.stop="onClick"
    @keydown="onKeydown"
  >
    <span v-if="item.icon || item.iconSvg" :class="iconClass">
      <component :is="item.icon" v-if="isComponent(item.icon)" />
      <Icon v-else-if="item.iconSvg" :svg="item.iconSvg" :size="depth > 0 ? 16 : 18" />
      <Icon v-else-if="typeof item.icon === 'string'" :name="item.icon" :size="depth > 0 ? 16 : 18" />
    </span>
    <span :class="labelClass">{{ item.label }}</span>
    <Badge v-if="item.badge" :count="item.badge" :class="badgeClass" />
    <span
      v-if="hasChildren"
      class="menu-item-arrow"
      :class="{ 'menu-item-arrow--rotated': expanded }"
      @click.stop="onToggle"
    >
      <Icon name="chevron-down" :size="12" />
    </span>
  </li>
  <CollapseTransition>
    <li v-if="hasChildren && expanded" class="menu-sub-list-wrapper">
      <ul class="menu-sub-list">
        <MenuBranch
          v-for="child in item.children"
          :key="child.key"
          :item="child"
          :parent="item"
          :depth="depth + 1"
          :selected-key="selectedKey"
          :expanded-keys="expandedKeys"
          @activate="(node, ancestor) => emit('activate', node, ancestor ?? item)"
          @toggle="(node) => emit('toggle', node)"
        />
      </ul>
    </li>
  </CollapseTransition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'MenuBranch' });
import { CollapseTransition } from '../animation';
import { Badge, Icon } from '../utility';
import type { MenuItem } from './types';

const props = defineProps<{
  item: MenuItem;
  parent?: MenuItem;
  depth: number;
  selectedKey: string | number;
  expandedKeys: string[];
}>();

const emit = defineEmits<{
  activate: [item: MenuItem, parent?: MenuItem];
  toggle: [item: MenuItem];
}>();

const hasChildren = computed(() => Boolean(props.item.children && props.item.children.length > 0));
const expanded = computed(() => props.expandedKeys.includes(String(props.item.key)));

function isActive(node: MenuItem): boolean {
  if (props.selectedKey === node.key) return true;
  return Boolean(node.children?.some((child) => isActive(child)));
}

const itemClass = computed(() => {
  const active = isActive(props.item);
  if (props.depth === 0) {
    return {
      'menu-item': true,
      'menu-item--active': active,
      'menu-item--disabled': props.item.disabled,
      'menu-item--has-children': hasChildren.value,
      'menu-item--expanded': expanded.value,
    };
  }
  return {
    'menu-sub-item': true,
    'menu-sub-item--active': active && !hasChildren.value,
    'menu-sub-item--disabled': props.item.disabled,
    'menu-sub-item--has-children': hasChildren.value,
    'menu-sub-item--expanded': expanded.value,
  };
});

const iconClass = computed(() => (props.depth === 0 ? 'menu-item-icon' : 'menu-sub-item-icon'));
const labelClass = computed(() => (props.depth === 0 ? 'menu-item-label' : 'menu-sub-item-label'));
const badgeClass = computed(() => (props.depth === 0 ? 'menu-item-badge' : 'menu-sub-item-badge'));

function isComponent(icon: MenuItem['icon']): boolean {
  return typeof icon === 'object' || (typeof icon === 'function' && Boolean((icon as { name?: string }).name));
}

function onClick() {
  if (props.item.disabled) return;
  emit('activate', props.item, props.parent);
}

function onToggle() {
  if (props.item.disabled || !hasChildren.value) return;
  emit('toggle', props.item);
}

function onKeydown(event: KeyboardEvent) {
  if (props.item.disabled) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick();
  }
}
</script>

<style scoped>
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
  margin: 2px 8px;
}

.menu-sub-item:hover:not(.menu-sub-item--disabled) {
  background: hsl(var(--primary) / 0.08);
  color: hsl(var(--primary));
}

.menu-sub-item--active,
.menu-sub-item--expanded {
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
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.menu-sub-item-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  width: 24px;
  height: 24px;
  color: hsl(var(--text-secondary));
  flex-shrink: 0;
  transition: transform var(--duration-normal) var(--ease-standard);
}

.menu-item-arrow--rotated {
  transform: rotate(180deg);
}

.menu-sub-list-wrapper {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-sub-list {
  list-style: none;
  margin: 0 0 0 16px;
  padding: 4px 0 4px 8px;
  border-left: 2px solid hsl(var(--border));
}
</style>
