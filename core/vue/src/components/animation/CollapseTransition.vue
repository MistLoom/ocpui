&lt;!--
CollapseTransition 组件

功能：提供元素的折叠和展开过渡动画

使用方式：
&lt;CollapseTransition&gt;
  &lt;div v-if="isVisible"&gt;内容&lt;/div&gt;
&lt;/CollapseTransition&gt;

公开属性：无

处理器：无
--&gt;
<template>
  <Transition
    name="collapse"
    @before-enter="handleBeforeEnter"
    @enter="handleEnter"
    @after-enter="handleAfterEnter"
    @before-leave="handleBeforeLeave"
    @leave="handleLeave"
    @after-leave="handleAfterLeave"
  >
    <slot />
  </Transition>
</template>

<script setup lang="ts">
const handleBeforeEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.maxHeight = '0';
  element.style.overflow = 'hidden';
  element.style.opacity = '0';
};

const handleEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.maxHeight = `${element.scrollHeight}px`;
  element.style.opacity = '1';
};

const handleAfterEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.maxHeight = '';
  element.style.overflow = '';
};

const handleBeforeLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.maxHeight = `${element.scrollHeight}px`;
  element.style.overflow = 'hidden';
};

const handleLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.maxHeight = '0';
  element.style.opacity = '0';
};

const handleAfterLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.maxHeight = '';
  element.style.overflow = '';
  element.style.opacity = '';
};
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
              opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
