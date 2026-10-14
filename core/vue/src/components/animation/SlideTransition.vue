<template>
  <Transition :name="slideDirection">
    <slot />
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  direction?: 'left' | 'right' | 'up' | 'down';
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'right',
});

const slideDirection = computed(() => `slide-${props.direction}`);
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform var(--duration-medium) var(--ease-standard),
              opacity var(--duration-medium) var(--ease-standard);
}

.slide-left-enter-from,
.slide-right-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-right-enter-from,
.slide-left-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform var(--duration-medium) var(--ease-standard),
              opacity var(--duration-medium) var(--ease-standard);
}

.slide-up-enter-from,
.slide-down-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.slide-down-enter-from,
.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>