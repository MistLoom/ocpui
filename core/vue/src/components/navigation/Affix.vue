<template>
  <div ref="affixRef" :class="affixClass" :style="affixStyle" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useThrottleFn } from '@vueuse/core';

/**
 * 固定组件，用于将元素固定在视口的指定位置
 * 
 * @props offsetTop - 距离顶部的偏移量，默认为 0
 * @props offsetBottom - 距离底部的偏移量，未定义时使用顶部偏移
 * @props target - 滚动目标元素，默认为 window
 * @props customClass - 自定义类名
 * 
 * @emits change - 固定状态变化时触发，参数为当前是否固定
 * 
 * @usage
 * <Affix :offsetTop="100">
 *   <div>固定内容</div>
 * </Affix>
 */

interface Props {
  offsetTop?: number;
  offsetBottom?: number;
  target?: () => HTMLElement | Window;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  offsetTop: 0,
  offsetBottom: undefined,
  target: () => window,
  customClass: '',
});

const emit = defineEmits<{
  'change': [fixed: boolean];
}>();

const affixRef = ref<HTMLElement>();
const isFixed = ref(false);
const affixStyle = ref<Record<string, string>>({});
const originalWidth = ref('');

const affixClass = computed(() => {
  const classes = ['affix'];
  if (isFixed.value) {
    classes.push('affix--fixed');
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
  const targetHeight = targetElement instanceof Window ? targetElement.innerHeight : targetElement.offsetHeight;
  
  if (props.offsetBottom !== undefined) {
    const offset = targetHeight - scrollTop - props.offsetBottom;
    if (offset <= 0) {
      if (!isFixed.value) {
        isFixed.value = true;
        if (affixRef.value) {
          originalWidth.value = affixRef.value.offsetWidth + 'px';
        }
        affixStyle.value = {
          position: 'fixed',
          bottom: `${props.offsetBottom}px`,
          width: originalWidth.value,
        };
        emit('change', true);
      }
    } else {
      if (isFixed.value) {
        isFixed.value = false;
        affixStyle.value = {};
        emit('change', false);
      }
    }
  } else if (scrollTop >= props.offsetTop) {
    if (!isFixed.value) {
      isFixed.value = true;
      if (affixRef.value) {
        originalWidth.value = affixRef.value.offsetWidth + 'px';
      }
      affixStyle.value = {
        position: 'fixed',
        top: `${props.offsetTop}px`,
        width: originalWidth.value,
      };
      emit('change', true);
    }
  } else {
    if (isFixed.value) {
      isFixed.value = false;
      affixStyle.value = {};
      emit('change', false);
    }
  }
}, 16, true, false);

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
.affix {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.affix--fixed {
  z-index: var(--z-fixed);
}
</style>
