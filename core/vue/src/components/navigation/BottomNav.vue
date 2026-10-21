<!--
BottomNav 组件

公开属性：
- items: BottomNavItem[] - 导航项
- modelValue: string | number - 当前激活项 key（v-model）
- activeKey: string | number - 当前激活项 key（modelValue 别名）
- customClass: string - 自定义类名

事件：
- update:modelValue - 激活项变化
- select - 选中项，参数为 item
-->
<template>
  <nav
    :class="navClass"
    role="navigation"
    :style="navStyle"
  >
    <button
      v-for="item in items"
      :key="String(item.key)"
      type="button"
      class="bottom-nav-item"
      :class="{ 'bottom-nav-item--active': isActive(item.key) }"
      :aria-current="isActive(item.key) ? 'page' : undefined"
      @click="handleSelect(item)"
    >
      <span v-if="item.icon" class="bottom-nav-item__icon-wrap">
        <Icon :name="item.icon" size="sm" />
        <span
          v-if="item.badge != null && item.badge !== ''"
          class="bottom-nav-item__badge"
        >{{ item.badge }}</span>
      </span>
      <span class="bottom-nav-item__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '../utility';
import type { BottomNavItem } from './types';

interface Props {
  items: BottomNavItem[];
  modelValue?: string | number;
  activeKey?: string | number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  activeKey: undefined,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [key: string | number];
  select: [item: BottomNavItem];
}>();

const currentKey = computed(() => {
  if (props.modelValue !== undefined) {
    return props.modelValue;
  }
  if (props.activeKey !== undefined) {
    return props.activeKey;
  }
  return props.items[0]?.key ?? '';
});

const navClass = computed(() => {
  const classes = ['bottom-nav'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const navStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.max(props.items.length, 1)}, 1fr)`,
}));

const isActive = (key: string | number) => String(currentKey.value) === String(key);

const handleSelect = (item: BottomNavItem) => {
  if (!isActive(item.key)) {
    emit('update:modelValue', item.key);
  }
  emit('select', item);
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  display: grid;
  min-height: var(--bottom-nav-h);
  padding-top: var(--space-1);
  padding-bottom: calc(var(--space-1) + var(--safe-area-bottom));
  padding-left: var(--safe-area-left);
  padding-right: var(--safe-area-right);
  background: color-mix(in srgb, var(--color-bg, hsl(var(--background))) 74%, transparent);
  backdrop-filter: blur(16px) saturate(1.15);
  -webkit-backdrop-filter: blur(16px) saturate(1.15);
  border-top: 1px solid var(--color-border, hsl(var(--border)));
  box-shadow: 0 -2px 8px hsl(var(--shadow));
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-height: var(--touch-min-size);
  min-width: var(--touch-min-size);
  padding: var(--space-1) var(--space-2);
  border: none;
  background: transparent;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.bottom-nav-item:hover {
  color: hsl(var(--text-secondary));
}

.bottom-nav-item--active {
  color: hsl(var(--primary));
}

.bottom-nav-item__icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-nav-item__badge {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: hsl(var(--error));
  color: hsl(var(--primary-foreground));
  font-size: var(--font-size-xs);
  line-height: 16px;
  text-align: center;
  font-weight: 600;
}

.bottom-nav-item__label {
  font-size: var(--font-size-xs);
  line-height: 1.2;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
