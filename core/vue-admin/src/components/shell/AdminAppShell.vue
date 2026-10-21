<template>
  <div class="ocp-admin-shell" :class="customClass">
    <slot name="sider" />
    <div class="ocp-admin-workspace">
      <slot name="header" />
      <main :id="mainId" class="ocp-admin-main" tabindex="-1">
        <slot />
      </main>
    </div>
    <Transition name="ocp-admin-fade">
      <div
        v-if="mobileNavOpen"
        class="ocp-admin-mobile-scrim"
        aria-hidden="true"
        @click="emit('update:mobileNavOpen', false)"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mobileNavOpen?: boolean;
  mainId?: string;
  customClass?: string;
}

withDefaults(defineProps<Props>(), {
  mobileNavOpen: false,
  mainId: 'admin-main',
  customClass: '',
});

const emit = defineEmits<{ 'update:mobileNavOpen': [boolean] }>();
</script>

<script lang="ts">
export default { name: 'AdminAppShell' };
</script>

<style scoped>
.ocp-admin-main {
  max-width: 1500px;
  margin: 0 auto;
  padding: 30px 32px 64px;
  min-width: 0;
}

@media (max-width: 979.98px) {
  .ocp-admin-main {
    padding: 24px 20px 54px;
  }
}

.ocp-admin-fade-enter-active,
.ocp-admin-fade-leave-active {
  transition: opacity 0.16s ease;
}

.ocp-admin-fade-enter-from,
.ocp-admin-fade-leave-to {
  opacity: 0;
}
</style>
