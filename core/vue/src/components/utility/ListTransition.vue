<!--
ListTransition 组件

功能：列表过渡动画组件，用于列表项的进入和离开动画

属性：
- type: 过渡类型，可选值：fade, slide, scale, flip, custom，默认值：fade
- direction: 过渡方向，可选值：up, down, left, right，默认值：up
- tag: 容器标签，默认值：div
- duration: 动画持续时间（毫秒），默认值：300
- delay: 动画延迟（毫秒），默认值：0
- stagger: 交错动画间隔（毫秒），默认值：50
- group: 是否为组动画，默认值：true
- customClass: 自定义类名
- easing: 缓动函数，默认值：ease-out

事件：
- before-enter: 进入前事件
- enter: 进入事件
- leave: 离开事件
- after-leave: 离开后事件

使用方式：
<ListTransition type="fade" direction="up" :duration="300" :stagger="50">
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</ListTransition>
-->

<template>
  <TransitionGroup
    :name="transitionName"
    :tag="tag"
    :class="listTransitionClass"
    :move-class="moveClass"
    @before-enter="handleBeforeEnter"
    @enter="handleEnter"
    @leave="handleLeave"
    @after-leave="handleAfterLeave"
  >
    <slot />
  </TransitionGroup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export type ListTransitionType = 'fade' | 'slide' | 'scale' | 'flip' | 'custom';
export type ListDirection = 'up' | 'down' | 'left' | 'right';

type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;

interface Props {
  type?: ListTransitionType;
  direction?: ListDirection;
  tag?: string;
  duration?: number;
  delay?: number;
  stagger?: number;
  group?: boolean;
  customClass?: string;
  easing?: EasingFunction;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'fade',
  direction: 'up',
  tag: 'div',
  duration: 300,
  delay: 0,
  stagger: 50,
  group: true,
  customClass: '',
  easing: 'ease-out',
});

const emit = defineEmits<{
  'before-enter': [el: Element];
  'enter': [el: Element, done: () => void];
  'leave': [el: Element, done: () => void];
  'after-leave': [el: Element];
}>();

// itemIndex 追踪：每次进入前自增，每次 after-leave 重置，实现交错动画
const itemIndex = ref(0);

const transitionName = computed(() => `list-${props.type}-${props.direction}`);
const moveClass = computed(() => `list-move-${props.type}`);

const listTransitionClass = computed(() => {
  const classes = ['list-transition'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const setTransitionVars = (el: HTMLElement): void => {
  el.style.setProperty('--list-transition-duration', `${props.duration}ms`);
  el.style.setProperty('--list-transition-easing', props.easing);
};

const handleBeforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement;
  setTransitionVars(htmlEl);
  htmlEl.style.setProperty('--list-transition-delay', `${props.delay + itemIndex.value * props.stagger}ms`);
  emit('before-enter', el);
  itemIndex.value++;
};

const handleEnter = (el: Element, done: () => void) => {
  emit('enter', el, done);
};

const handleLeave = (el: Element, done: () => void) => {
  setTransitionVars(el as HTMLElement);
  emit('leave', el, done);
};

const handleAfterLeave = (el: Element) => {
  emit('after-leave', el);
  itemIndex.value = 0;
};
</script>

<style>
/* 基础列表过渡样式 */
.list-transition {
  position: relative;
}

/* 缓动函数变量（全局基础变量） */
:root {
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

.list-fade-up-enter-active,
.list-fade-up-leave-active,
.list-fade-down-enter-active,
.list-fade-down-leave-active,
.list-fade-left-enter-active,
.list-fade-left-leave-active,
.list-fade-right-enter-active,
.list-fade-right-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  transition-delay: var(--list-transition-delay, 0ms);
}

.list-fade-up-enter-from,
.list-fade-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.list-fade-down-enter-from,
.list-fade-down-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.list-fade-left-enter-from,
.list-fade-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.list-fade-right-enter-from,
.list-fade-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-slide-up-enter-active,
.list-slide-up-leave-active,
.list-slide-down-enter-active,
.list-slide-down-leave-active,
.list-slide-left-enter-active,
.list-slide-left-leave-active,
.list-slide-right-enter-active,
.list-slide-right-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  transition-delay: var(--list-transition-delay, 0ms);
}

.list-slide-up-enter-from,
.list-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.list-slide-down-enter-from,
.list-slide-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.list-slide-left-enter-from,
.list-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.list-slide-right-enter-from,
.list-slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.list-scale-up-enter-active,
.list-scale-up-leave-active,
.list-scale-down-enter-active,
.list-scale-down-leave-active,
.list-scale-left-enter-active,
.list-scale-left-leave-active,
.list-scale-right-enter-active,
.list-scale-right-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  transition-delay: var(--list-transition-delay, 0ms);
}

.list-scale-up-enter-from,
.list-scale-up-leave-to,
.list-scale-down-enter-from,
.list-scale-down-leave-to,
.list-scale-left-enter-from,
.list-scale-left-leave-to,
.list-scale-right-enter-from,
.list-scale-right-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.list-flip-up-enter-active,
.list-flip-up-leave-active,
.list-flip-down-enter-active,
.list-flip-down-leave-active,
.list-flip-left-enter-active,
.list-flip-left-leave-active,
.list-flip-right-enter-active,
.list-flip-right-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  transition-delay: var(--list-transition-delay, 0ms);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.list-flip-up-enter-from,
.list-flip-up-leave-to {
  opacity: 0;
  transform: rotateX(-90deg);
}

.list-flip-down-enter-from,
.list-flip-down-leave-to {
  opacity: 0;
  transform: rotateX(90deg);
}

.list-flip-left-enter-from,
.list-flip-left-leave-to {
  opacity: 0;
  transform: rotateY(-90deg);
}

.list-flip-right-enter-from,
.list-flip-right-leave-to {
  opacity: 0;
  transform: rotateY(90deg);
}

.list-move-fade,
.list-move-slide,
.list-move-scale,
.list-move-flip {
  transition: transform var(--list-transition-duration, 300ms) var(--list-transition-easing, var(--ease-out));
}

.list-transition > * {
  will-change: transform, opacity;
  position: relative;
}

.list-fade-up-leave-active,
.list-fade-down-leave-active,
.list-fade-left-leave-active,
.list-fade-right-leave-active,
.list-slide-up-leave-active,
.list-slide-down-leave-active,
.list-slide-left-leave-active,
.list-slide-right-leave-active,
.list-scale-up-leave-active,
.list-scale-down-leave-active,
.list-scale-left-leave-active,
.list-scale-right-leave-active,
.list-flip-up-leave-active,
.list-flip-down-leave-active,
.list-flip-left-leave-active,
.list-flip-right-leave-active {
  position: absolute;
  width: 100%;
  pointer-events: none;
}

@media (max-width: 768px) {
  .list-transition > * {
    transition-duration: calc(var(--list-transition-duration, 300ms) * 0.8);
  }
}
</style>
