<template>
  <button
    type="button"
    :class="backTopClass"
    v-bind="$attrs"
    :aria-label="t('components.navigation.backTop.backToTop')"
    @click="handleClick"
  >
    <slot>
      <div class="back-top-icon">
        <Icon name="arrow-up" :size="20" />
      </div>
    </slot>
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import { Icon } from '../utility';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

/**
 * 返回顶部组件，用于快速回到页面顶部
 * 
 * @props visibilityHeight - 显示高度阈值，默认为 400
 * @props target - 滚动目标元素，默认为 window
 * @props customClass - 自定义类名
 * 
 * @emits click - 点击时触发，参数为鼠标事件
 * 
 * @usage
 * <BackTop />
 * <BackTop :visibilityHeight="300" />
 */

interface Props {
  visibilityHeight?: number;
  target?: () => HTMLElement | Window;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visibilityHeight: 400,
  target: () => window,
  customClass: '',
});

const emit = defineEmits<{
  'click': [event: MouseEvent];
}>();

const visible = ref(false);

const backTopClass = computed(() => {
  const classes = ['back-top'];
  if (visible.value) {
    classes.push('back-top--visible');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

// 滚动节流：trailing 语义，作用域销毁自动清理
const handleScroll = useThrottleFn(() => {
  const targetElement = props.target();
  if (!targetElement) return;

  const scrollTop = targetElement instanceof Window ? targetElement.pageYOffset : targetElement.scrollTop;
  visible.value = scrollTop >= props.visibilityHeight;
}, 16, true, false);

const handleClick = (event: MouseEvent) => {
  const targetElement = props.target();
  if (!targetElement) return;
  
  try {
    if (targetElement instanceof Window) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else if (targetElement instanceof HTMLElement) {
      targetElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    console.warn('BackTop: Error scrolling to top:', error);
  }
  
  emit('click', event);
};

onMounted(() => {
  const targetElement = props.target();
  if (targetElement) {
    targetElement.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  const targetElement = props.target();
  if (targetElement) {
    targetElement.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.back-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(16px);
  transition: opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.3s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-fixed);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 0;
}

.back-top--visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-top:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--primary));
  box-shadow: var(--shadow-md);
}

.back-top-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--text));
}

.back-top:hover .back-top-icon {
  color: hsl(var(--primary));
}

@media (max-width: 768px) {
  .back-top {
    right: 16px;
    bottom: 16px;
    width: 40px;
    height: 40px;
  }
}
</style>
