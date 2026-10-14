<template>
  <Transition name="fade">
    <slot />
  </Transition>
</template>

<script setup lang="ts">
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal) var(--ease-standard);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>