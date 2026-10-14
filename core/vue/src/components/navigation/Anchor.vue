<template>
  <div ref="anchorRef" :class="anchorClass">
    <div class="anchor-wrapper">
      <div
        v-for="item in items"
        :key="item.href"
        class="anchor-link"
        :class="{ 'anchor-link--active': activeHref === item.href }"
      >
        <a
          :href="item.href"
          class="anchor-link-title"
          @click.prevent="handleClick(item)"
        >
          {{ item.title }}
        </a>
        <div v-if="item.children && item.children.length > 0" class="anchor-children">
          <a
            v-for="child in item.children"
            :key="child.href"
            :href="child.href"
            class="anchor-link-title anchor-link-title--sub"
            :class="{ 'anchor-link-title--active': activeHref === child.href }"
            @click.prevent="handleClick(child)"
          >
            {{ child.title }}
          </a>
        </div>
      </div>
    </div>
    <div class="anchor-indicator" :style="indicatorStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useThrottleFn } from '@vueuse/core';

/**
 * 锚点组件，用于页面导航和滚动定位
 * 
 * @props items - 锚点项数组，包含 href 和 title 属性，支持嵌套子项
 * @props offsetTop - 偏移顶部距离，默认为 0
 * @props bounds - 滚动边界值，默认为 5
 * @props targetOffset - 目标偏移量，默认为 0
 * @props customClass - 自定义类名
 * 
 * @emits change - 当活动锚点变化时触发，参数为当前活动锚点的 href
 * @emits click - 当点击锚点时触发，参数为点击的锚点项
 * 
 * @usage
 * <Anchor
 *   :items="[
 *     { href: '#section1', title: '第一节' },
 *     { href: '#section2', title: '第二节', children: [
 *       { href: '#section2-1', title: '第二节第一部分' }
 *     ]}
 *   ]"
 * />
 */

interface AnchorItem {
  href: string;
  title: string;
  children?: AnchorItem[];
}

interface Props {
  items: AnchorItem[];
  offsetTop?: number;
  bounds?: number;
  targetOffset?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  offsetTop: 0,
  bounds: 5,
  targetOffset: 0,
  customClass: '',
});

const emit = defineEmits<{
  change: [href: string];
  click: [item: AnchorItem];
}>();

const anchorRef = ref<HTMLElement>();
const activeHref = ref('');
const indicatorTop = ref(0);

const anchorClass = computed(() => {
  const classes = ['anchor'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const indicatorStyle = computed(() => ({
  top: `${indicatorTop.value}px`,
}));

const getAllItems = (items: AnchorItem[]): AnchorItem[] => {
  const result: AnchorItem[] = [];
  items.forEach(item => {
    result.push(item);
    if (item.children && item.children.length > 0) {
      result.push(...getAllItems(item.children));
    }
  });
  return result;
};

// 滚动节流：trailing 语义（原私有实现首次延迟 delay 执行）；作用域销毁自动清理
const handleScroll = useThrottleFn(() => {
  const allItems = getAllItems(props.items);
  if (allItems.length === 0) return;
  
  // scroll position check omitted
  
  let currentHref = '';
  let minDistance = Infinity;
  
  allItems.forEach(item => {
    try {
      const element = document.querySelector(item.href);
      if (element) {
        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.top - props.offsetTop - props.bounds);
        
        if (rect.top <= props.offsetTop + props.bounds && distance < minDistance) {
          minDistance = distance;
          currentHref = item.href;
        }
      }
    } catch (error) {
      console.warn('Anchor: Error querying element:', error);
    }
  });
  
  if (currentHref && currentHref !== activeHref.value) {
    activeHref.value = currentHref;
    updateIndicator();
    emit('change', currentHref);
  }
}, 16, true, false);

const updateIndicator = () => {
  if (!anchorRef.value) return;
  
  const activeLink = anchorRef.value.querySelector(`.anchor-link--active .anchor-link-title`);
  if (activeLink) {
    const rect = activeLink.getBoundingClientRect();
    const containerRect = anchorRef.value.getBoundingClientRect();
    indicatorTop.value = rect.top - containerRect.top + rect.height / 2 - 10;
  }
};

const handleClick = (item: AnchorItem) => {
  emit('click', item);
  
  try {
    const element = document.querySelector(item.href);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - props.targetOffset;
      window.scrollTo({
        top,
        behavior: 'smooth',
      });
      
      activeHref.value = item.href;
      updateIndicator();
    }
  } catch (error) {
    console.warn('Anchor: Error scrolling to element:', error);
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

defineExpose({
  activeHref,
});
</script>

<style scoped>
.anchor {
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.anchor-wrapper {
  position: relative;
  padding-left: 12px;
}

.anchor-indicator {
  position: absolute;
  left: 0;
  width: 2px;
  height: 20px;
  background: hsl(var(--primary));
  border-radius: 1px;
  transition: top 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.anchor-link {
  margin-bottom: 8px;
}

.anchor-link-title {
  display: block;
  padding: 4px 12px;
  font-size: 14px;
  color: hsl(var(--text-muted));
  text-decoration: none;
  border-radius: 6px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.anchor-link-title:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-hover));
}

.anchor-link--active > .anchor-link-title {
  color: hsl(var(--primary));
  font-weight: 500;
}

.anchor-link-title--sub {
  padding-left: 24px;
  font-size: 13px;
}

.anchor-link-title--active {
  color: hsl(var(--primary));
}

.anchor-children {
  margin-top: 4px;
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .anchor {
    font-size: var(--font-size-sm);
  }
  
  .anchor-wrapper {
    padding-left: 8px;
  }
  
  .anchor-link {
    margin-bottom: 4px;
  }
  
  .anchor-link-title {
    padding: 8px 12px;
    min-height: 44px;
    font-size: 15px;
  }
  
  .anchor-link-title--sub {
    padding-left: 20px;
    font-size: 14px;
  }
  
  .anchor-indicator {
    width: 3px;
    height: 24px;
  }
}
</style>
