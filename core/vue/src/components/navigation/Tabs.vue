<!--
Tabs 组件

功能：标签页容器，用于管理多个TabPane组件

公开属性：
- modelValue: string - 当前激活的标签值
- type: 'line' | 'card' | 'plain' - 标签样式（plain：浮层内下划线，无 ink 与 hover 底）
- size: 'sm' | 'md' | 'lg' - 标签尺寸
- navOnly: boolean - 仅导航条，内容由外部切换
- bleed: boolean - 在带水平内边距的容器内横向贴边
- ariaLabel: string - 覆盖默认 tablist 无障碍名称
- customClass: string - 自定义类名
- items: { key, label, disabled?, count? }[] - 显式标签项（可不依赖 TabPane 注册）

事件：
- update:modelValue - 激活标签变化时触发
- change - 激活标签变化时触发

使用方式：
<template>
  <Tabs v-model:value="activeTab" type="line" size="md">
    <TabPane tab="标签1" value="1">
      内容1
    </TabPane>
    <TabPane tab="标签2" value="2" disabled>
      内容2
    </TabPane>
  </Tabs>
</template>

<script setup>
import { ref } from 'vue';
import Tabs from './Tabs.vue';
import TabPane from './TabPane.vue';

const activeTab = ref('1');
</script>
-->
<template>
  <div :class="tabsClass" data-part="tabs-root">
    <div
      ref="navElRef"
      class="tabs-nav"
      data-part="tabs-nav"
      role="tablist"
      :aria-label="ariaLabel ?? t('components.navigation.tabs.ariaLabel')"
    >
      <div
        v-for="tab in displayTabs"
        :key="tab.key"
        class="tabs-tab"
        data-part="tabs-tab"
        :class="{ 
          'tabs-tab-active': activeKey === tab.key, 
          'tabs-tab-disabled': tab.disabled 
        }"
        :id="`tab-${tab.key}`"
        :role="'tab'"
        :aria-selected="activeKey === tab.key"
        :aria-disabled="tab.disabled"
        :aria-controls="`tabpanel-${tab.key}`"
        :tabindex="activeKey === tab.key ? 0 : -1"
        :ref="(el) => setTabEl(tab.key, el as HTMLElement)"
        @click="handleTabClick(tab)"
        @keydown.enter="handleTabClick(tab)"
        @keydown.space="handleTabClick(tab)"
        @keydown.left="handleKeyDown('prev')"
        @keydown.right="handleKeyDown('next')"
        @keydown.home.prevent="handleBoundaryKey('start')"
        @keydown.end.prevent="handleBoundaryKey('end')"
      >
        <span class="tabs-tab-label" data-part="tabs-tab-label">{{ tab.label }}</span>
        <span
          v-if="tab.count != null && tab.count > 0"
          class="tabs-tab-count tabular-nums"
          data-part="tabs-tab-count"
        >{{ tab.count }}</span>
      </div>
      <div
        v-if="type !== 'plain'"
        class="tabs-ink-bar"
        data-part="tabs-ink"
        :style="inkBarStyle"
      />
    </div>
    <div v-if="!navOnly" class="tabs-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, provide, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { TABS_ACTIVE_KEY, TABS_REGISTRATION_KEY } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import type { TabItem } from './types';

const { uiT: t } = useUiT();

interface Tab {
  label: string;
  key: string;
  disabled?: boolean;
  count?: number;
  el?: HTMLElement | null;
}

interface Props {
  modelValue?: string;
  type?: 'line' | 'card' | 'plain';
  size?: 'sm' | 'md' | 'lg';
  /** 仅渲染导航，面板内容由外部管理 */
  navOnly?: boolean;
  /** 抵消父级水平 padding，使导航贴齐容器边缘 */
  bleed?: boolean;
  ariaLabel?: string;
  customClass?: string;
  /** 显式标签项：首屏即可画出导航，不必等 TabPane 注册 */
  items?: TabItem[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'line',
  size: 'md',
  navOnly: false,
  bleed: false,
  ariaLabel: '',
  customClass: '',
  items: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [string];
  'change': [string];
}>();

// 当前激活的标签
const activeKey = ref(props.modelValue);

// 注册的标签列表
const registeredTabs = ref<Tab[]>([]);

const navElRef = ref<HTMLElement | null>(null);
/** 滚动/尺寸变化时递增，驱动 ink-bar 重算 */
const inkMeasureTick = ref(0);

function resolveActiveKey(preferred: string, tabs: Tab[]): string {
  if (tabs.length === 0) return '';
  const key = preferred.trim();
  if (key && tabs.some((t) => t.key === key && !t.disabled)) return key;
  const firstEnabled = tabs.find((t) => !t.disabled);
  return firstEnabled?.key ?? tabs[0].key;
}

function syncActiveFromTabs() {
  const tabs = displayTabs.value;
  if (tabs.length === 0) {
    if (activeKey.value) activeKey.value = '';
    return;
  }
  const resolved = resolveActiveKey(props.modelValue || activeKey.value, tabs);
  if (resolved !== activeKey.value) {
    activeKey.value = resolved;
  }
}

const displayTabs = computed(() => {
  if (props.items.length) {
    return props.items.map((item) => {
      const existing = registeredTabs.value.find((tab) => tab.key === item.key);
      return {
        key: item.key,
        label: item.label,
        disabled: item.disabled,
        count: item.count,
        el: existing?.el,
      };
    });
  }
  return registeredTabs.value;
});

// ink-bar 样式（相对 tabs-nav 内容坐标，兼容横向滚动）
const inkBarStyle = computed(() => {
  void inkMeasureTick.value;
  if (displayTabs.value.length === 0) {
    return { width: '0px', transform: 'translateX(0px)', opacity: '0' };
  }

  const activeTab = displayTabs.value.find((t) => t.key === activeKey.value);
  if (!activeTab?.el) {
    return { width: '0px', transform: 'translateX(0px)', opacity: '0' };
  }

  const tabEl = activeTab.el;
  const navEl = navElRef.value ?? (tabEl.closest('.tabs-nav') as HTMLElement | null);
  if (!navEl) {
    return { width: '0px', transform: 'translateX(0px)', opacity: '0' };
  }

  const left = tabEl.offsetLeft;
  const width = tabEl.offsetWidth;

  return {
    width: `${width}px`,
    transform: `translateX(${left}px)`,
    opacity: width > 0 ? '1' : '0',
  };
});

// 提供依赖注入
provide(TABS_ACTIVE_KEY, activeKey);
provide(TABS_REGISTRATION_KEY, {
  register: (key: string, label: string, disabled?: boolean, el?: HTMLElement | null) => {
    if (!key) return;

    const existingIndex = registeredTabs.value.findIndex(t => t.key === key);
    if (existingIndex === -1) {
      registeredTabs.value.push({ key, label, disabled, el });
      // 如果没有激活的tab，默认激活第一个
      if (registeredTabs.value.length === 1) {
        activeKey.value = resolveActiveKey(activeKey.value, registeredTabs.value);
      }
    } else {
      // 更新已存在 tab 的 el 引用
      registeredTabs.value[existingIndex].el = el;
    }
  },
  unregister: (key: string) => {
    if (!key) return;

    const index = registeredTabs.value.findIndex(t => t.key === key);
    if (index > -1) {
      registeredTabs.value.splice(index, 1);
      // 如果删除的是当前激活的tab，激活第一个可用的tab
      if (registeredTabs.value.length > 0) {
        activeKey.value = resolveActiveKey(
          key === activeKey.value ? '' : activeKey.value,
          registeredTabs.value,
        );
      }
    }
  }
});

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    const resolved = resolveActiveKey(val ?? '', displayTabs.value);
    if (resolved !== activeKey.value) {
      activeKey.value = resolved;
    }
  },
);

watch(
  displayTabs,
  () => {
    syncActiveFromTabs();
    nextTick(bumpInkMeasure);
  },
  { deep: true },
);

// 监听内部变化并同步
watch(activeKey, (val) => {
  emit('update:modelValue', val);
  emit('change', val);
  nextTick(() => {
    bumpInkMeasure();
    const tab = displayTabs.value.find((t) => t.key === val);
    tab?.el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
});

// 设置 tab 元素引用
const setTabEl = (key: string, el: HTMLElement | null) => {
  const tab = registeredTabs.value.find(t => t.key === key);
  if (tab) {
    if (tab.el === el) return;
    tab.el = el;
    nextTick(bumpInkMeasure);
    return;
  }
  const fromItems = props.items.find((item) => item.key === key);
  if (fromItems) {
    registeredTabs.value.push({
      key: fromItems.key,
      label: fromItems.label,
      disabled: fromItems.disabled,
      el,
    });
    nextTick(bumpInkMeasure);
  }
};

let inkLeft = -1;
let inkWidth = -1;

function bumpInkMeasure() {
  const activeTab = displayTabs.value.find((t) => t.key === activeKey.value);
  const tabEl = activeTab?.el;
  const navEl = navElRef.value ?? (tabEl?.closest('.tabs-nav') as HTMLElement | null);
  if (!tabEl || !navEl) return;
  const left = tabEl.offsetLeft;
  const width = tabEl.offsetWidth;
  if (left === inkLeft && width === inkWidth) return;
  inkLeft = left;
  inkWidth = width;
  inkMeasureTick.value += 1;
}

let resizeObserver: ResizeObserver | null = null;
let scrollTarget: HTMLElement | null = null;

onMounted(() => {
  syncActiveFromTabs();
  nextTick(() => {
    bumpInkMeasure();
    const nav = navElRef.value;
    if (!nav) return;
    scrollTarget = nav;
    scrollTarget.addEventListener('scroll', bumpInkMeasure, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => bumpInkMeasure());
      resizeObserver.observe(nav);
    }
  });
});

onBeforeUnmount(() => {
  scrollTarget?.removeEventListener('scroll', bumpInkMeasure);
  resizeObserver?.disconnect();
  resizeObserver = null;
  scrollTarget = null;
});

const tabsClass = computed(() => {
  const classes = ['tabs', `tabs-${props.type}`, `tabs-${props.size}`];
  if (props.navOnly) classes.push('tabs-nav-only');
  if (props.bleed) classes.push('tabs-bleed');
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const activeIndex = computed(() => {
  const index = displayTabs.value.findIndex(tab => tab.key === activeKey.value);
  return Math.max(0, index);
});

const handleTabClick = (tab: Tab) => {
  if (tab.disabled) return;
  activeKey.value = tab.key;
};

const handleKeyDown = (direction: 'prev' | 'next') => {
  const currentIndex = activeIndex.value;
  let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

  // 循环处理
  if (newIndex < 0) {
    newIndex = displayTabs.value.length - 1;
  } else if (newIndex >= displayTabs.value.length) {
    newIndex = 0;
  }

  // 找到第一个可用的标签
  let attempts = 0;
  while (attempts < displayTabs.value.length) {
    const tab = displayTabs.value[newIndex];
    if (!tab.disabled) {
      activeKey.value = tab.key;
      break;
    }
    newIndex = direction === 'prev' ? newIndex - 1 : newIndex + 1;
    if (newIndex < 0) newIndex = displayTabs.value.length - 1;
    if (newIndex >= displayTabs.value.length) newIndex = 0;
    attempts++;
  }
};

const handleBoundaryKey = (direction: 'start' | 'end') => {
  if (displayTabs.value.length === 0) return;
  const step = direction === 'start' ? 1 : -1;
  let index = direction === 'start' ? 0 : displayTabs.value.length - 1;
  while (index >= 0 && index < displayTabs.value.length) {
    const tab = displayTabs.value[index];
    if (!tab.disabled) {
      activeKey.value = tab.key;
      break;
    }
    index += step;
  }
};
</script>

<style scoped>
.tabs {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.tabs-nav {
  position: relative;
  display: flex;
  border-bottom: 1px solid hsl(var(--border));
  flex-wrap: wrap;
}

.tabs-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  transition: var(--transition-wash);
  position: relative;
  white-space: nowrap;
  flex: 1 1 auto;
  text-align: center;
}

.tabs-nav:has(.tabs-tab:nth-child(n + 6)) .tabs-tab,
.tabs-nav[style*='overflow'] .tabs-tab {
  flex: 0 0 auto;
}

.tabs-tab::before {
  content: '';
  position: absolute;
  inset: 0;
  background: hsl(var(--primary) / 0.08);
  border-radius: 8px;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.tabs-tab:hover:not(.tabs-tab-disabled)::before {
  opacity: 1;
}

.tabs-tab:hover:not(.tabs-tab-disabled) {
  color: hsl(var(--primary));
}

.tabs-tab-active {
  color: hsl(var(--primary));
}

.tabs-tab-active::before {
  opacity: 1;
  background: hsl(var(--primary) / 0.12);
}

.tabs-tab-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tabs-tab-label {
  position: relative;
  z-index: 1;
}

.tabs-ink-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: hsl(var(--primary));
  transition: var(--transition-ink);
}

.tabs-card .tabs-nav {
  border-bottom: none;
  gap: 4px;
}

.tabs-card .tabs-tab {
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 8px 8px 0 0;
  margin-bottom: -1px;
  transition: var(--transition-wash);
}

.tabs-card .tabs-tab::before {
  display: none;
}

.tabs-card .tabs-tab:hover:not(.tabs-tab-disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--primary));
  border-bottom-color: transparent;
}

.tabs-card .tabs-tab-active {
  background: hsl(var(--surface));
  border-bottom-color: hsl(var(--surface));
  /* box-shadow: 0 -2px 8px hsl(var(--shadow)); */
}

.tabs-card .tabs-ink-bar {
  display: none;
}

/* plain：浮层/详情内分段，下划线激活，无 ink 与 hover 底 */
.tabs-plain {
  gap: 0;
}

.tabs-plain .tabs-nav {
  flex-wrap: wrap;
  background: transparent;
}

.tabs-plain .tabs-tab {
  flex: none;
  padding: 0.65rem 1.25rem;
  font-size: 0.8125rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tabs-plain .tabs-tab::before {
  display: none;
}

.tabs-plain .tabs-tab:hover:not(.tabs-tab-disabled) {
  color: hsl(var(--primary));
}

.tabs-plain .tabs-tab-active {
  font-weight: 600;
  border-bottom-color: hsl(var(--primary));
}

.tabs-plain .tabs-tab-active::before {
  display: none;
}

.tabs-tab-count {
  margin-left: 0.35rem;
  font-size: 11px;
  font-weight: 500;
  opacity: 0.72;
}

.tabs-nav-only {
  gap: 0;
}

.tabs-bleed {
  margin-inline: calc(-1 * var(--tabs-bleed-inline, var(--space-6, 1.5rem)));
  width: calc(100% + 2 * var(--tabs-bleed-inline, var(--space-6, 1.5rem)));
}

.tabs-sm .tabs-tab {
  padding: 8px 16px;
  font-size: 13px;
}

.tabs-lg .tabs-tab {
  padding: 16px 32px;
  font-size: 16px;
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .tabs-nav {
    gap: 4px;
  }
  
  .tabs-tab {
    padding: 12px 16px;
    min-height: 44px;
    font-size: var(--font-size-sm);
  }
  
  .tabs-sm .tabs-tab {
    padding: 10px 14px;
    min-height: 44px;
    font-size: var(--font-size-sm);
  }
  
  .tabs-lg .tabs-tab {
    padding: 14px 20px;
    min-height: 44px;
    font-size: var(--font-size-sm);
  }
  
  .tabs-card .tabs-tab {
    border-radius: 8px;
    margin-bottom: 0;
  }
}
</style>
