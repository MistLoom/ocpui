<template>
  <nav :class="breadcrumbClass" :aria-label="t('components.navigation.breadcrumb.ariaLabel')">
    <ol class="breadcrumb-list" v-if="items.length > 0">
      <li
        v-for="(item, index) in items"
        :key="item.href || item.label + index"
        class="breadcrumb-item"
        :class="{ 'breadcrumb-item-current': index === items.length - 1 }"
      >
        <a
          v-if="item.href && index < items.length - 1"
          :href="item.href"
          class="breadcrumb-link"
          @click="handleClick(item, $event)"
        >
          <span v-if="item.icon" class="breadcrumb-icon">
            <component :is="item.icon" />
          </span>
          <span>{{ item.label }}</span>
        </a>
        <span v-else class="breadcrumb-text">
          <span v-if="item.icon" class="breadcrumb-icon">
            <component :is="item.icon" />
          </span>
          <span>{{ item.label }}</span>
        </span>
        <span v-if="index < items.length - 1" class="breadcrumb-separator">
          <slot name="separator">
            <svg viewBox="0 0 12 12" fill="currentColor">
              <path d="M4.5 2L9 6L4.5 10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </slot>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

/**
 * 面包屑导航组件，用于显示页面层级路径
 * 
 * @props items - 面包屑项数组，每项包含 label、href 和可选的 icon
 * @props separator - 分隔符，默认为 '/'（仅在使用默认分隔符时生效）
 * @props customClass - 自定义类名
 * 
 * @emits click - 点击面包屑项时触发，参数为点击的项和鼠标事件
 * 
 * @usage
 * <Breadcrumb
 *   :items="[
 *     { label: '首页', href: '/' },
 *     { label: '设置', href: '/settings' },
 *     { label: '用户设置' }
 *   ]"
 * />
 */

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string | object;
}

interface Props {
  items: BreadcrumbItem[];
  separator?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  separator: '/',
  customClass: '',
});

const emit = defineEmits<{
  click: [item: BreadcrumbItem, event: MouseEvent];
}>();

const breadcrumbClass = computed(() => {
  const classes = ['breadcrumb'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const handleClick = (item: BreadcrumbItem, event: MouseEvent) => {
  emit('click', item, event);
};
</script>

<style scoped>
.breadcrumb {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link,
.breadcrumb-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: hsl(var(--text-secondary));
  transition: color 0.2s;
}

.breadcrumb-link {
  cursor: pointer;
}

.breadcrumb-link:hover {
  color: hsl(var(--primary));
}

.breadcrumb-item-current .breadcrumb-text {
  color: hsl(var(--text));
  font-weight: 500;
}

.breadcrumb-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.breadcrumb-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 8px;
  color: hsl(var(--text-muted));
}

.breadcrumb-separator svg {
  width: 12px;
  height: 12px;
}
/* 响应式样式 */
@media (max-width: 575.98px) {
  .breadcrumb-link,
  .breadcrumb-text {
    font-size: var(--font-size-sm);
    gap: 4px;
  }
  
  .breadcrumb-separator {
    margin: 0 6px;
  }
  
  .breadcrumb-separator svg {
    width: 10px;
    height: 10px;
  }
  
  .breadcrumb-icon {
    font-size: 14px;
  }
  
  .breadcrumb-list {
    gap: 4px;
  }
}
</style>