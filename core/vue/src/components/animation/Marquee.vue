<!--
Marquee 组件

功能：实现内容的滚动动画效果，支持水平和垂直方向

使用方式：
<Marquee
  direction="left"
  :speed="50"
  :gap="20"
  :pause-on-hover="true"
>
  滚动的内容
</Marquee>

公开属性：
- autoFill: 是否自动填充内容（当内容不足时克隆），默认 true
- duration: 动画持续时间（秒），默认 0（根据速度自动计算）
- direction: 滚动方向，可选值：'left', 'right', 'up', 'down'，默认 'left'
- pauseOnHover: 鼠标悬停时是否暂停，默认 true
- speed: 滚动速度（像素/秒），默认 50
- gap: 克隆内容之间的间隙（像素），默认 16
- customClass: 自定义类名，默认 ''

处理器：无

暴露方法：
- pause: 暂停滚动
- resume: 恢复滚动
- checkNeedClone: 检查是否需要克隆内容
-->
<template>
  <div :class="marqueeClass" @mouseenter="pause" @mouseleave="resume">
    <div
      ref="contentRef"
      class="marquee-content"
      :style="contentStyle"
    >
      <slot />
      <template v-if="needClone">
        <span
          class="marquee-separator"
          :style="separatorStyle"
        ></span>
        <slot />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface Props {
  autoFill?: boolean;
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  pauseOnHover?: boolean;
  speed?: number;
  gap?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  autoFill: true,
  duration: 0,
  direction: 'left',
  pauseOnHover: true,
  speed: 50,
  gap: 16,
  customClass: '',
});

const contentRef = ref<HTMLElement>();
const isPaused = ref(false);
const needClone = ref(false);
const contentWidth = ref(0);
const contentHeight = ref(0);
const containerWidth = ref(0);
const containerHeight = ref(0);

const marqueeClass = computed(() => {
  const classes = ['marquee', `marquee--${props.direction}`];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const actualDuration = computed(() => {
  if (props.duration > 0) return props.duration;

  if (props.direction === 'left' || props.direction === 'right') {
    return (contentWidth.value + props.gap) / props.speed;
  }
  return (contentHeight.value + props.gap) / props.speed;
});

const contentStyle = computed(() => {
  const style: Record<string, string> = {
    animationDuration: `${actualDuration.value}s`,
    animationPlayState: isPaused.value ? 'paused' : 'running',
  };
  return style;
});

const separatorStyle = computed(() => {
  if (props.direction === 'left' || props.direction === 'right') {
    return {
      width: `${props.gap}px`,
      minWidth: `${props.gap}px`,
    };
  }
  return {
    height: `${props.gap}px`,
    minHeight: `${props.gap}px`,
  };
});

const checkNeedClone = () => {
  if (!contentRef.value || !props.autoFill) {
    needClone.value = false;
    return;
  }

  const container = contentRef.value.parentElement;
  if (!container) return;

  if (props.direction === 'left' || props.direction === 'right') {
    contentWidth.value = contentRef.value.scrollWidth / (needClone.value ? 2 : 1);
    containerWidth.value = container.offsetWidth;
    needClone.value = contentWidth.value < containerWidth.value;
  } else {
    contentHeight.value = contentRef.value.scrollHeight / (needClone.value ? 2 : 1);
    containerHeight.value = container.offsetHeight;
    needClone.value = contentHeight.value < containerHeight.value;
  }
};

const pause = () => {
  isPaused.value = true;
};

const resume = () => {
  isPaused.value = false;
};

onMounted(() => {
  checkNeedClone();
  window.addEventListener('resize', checkNeedClone);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkNeedClone);
});

defineExpose({
  pause,
  resume,
  checkNeedClone,
});
</script>

<style scoped>
.marquee {
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.marquee-content {
  display: inline-flex;
  align-items: center;
  animation: marquee-scroll-left linear infinite;
}

.marquee--left .marquee-content {
  animation-name: marquee-scroll-left;
}

.marquee--right .marquee-content {
  animation-name: marquee-scroll-right;
}

.marquee--up .marquee-content {
  display: flex;
  flex-direction: column;
  animation-name: marquee-scroll-up;
}

.marquee--down .marquee-content {
  display: flex;
  flex-direction: column;
  animation-name: marquee-scroll-down;
}

.marquee-separator {
  flex-shrink: 0;
}

@keyframes marquee-scroll-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes marquee-scroll-right {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes marquee-scroll-up {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50%);
  }
}

@keyframes marquee-scroll-down {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
