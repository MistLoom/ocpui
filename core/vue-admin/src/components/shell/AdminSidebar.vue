<template>
  <aside
    class="ocp-admin-sider"
    :class="{ 'ocp-admin-sider--open': mobileOpen }"
    :aria-label="ariaLabel"
  >
    <div class="ocp-admin-sider-head">
      <slot name="brand" />
      <button
        v-if="showMobileClose"
        type="button"
        class="ocp-admin-icon-btn ocp-admin-menu-close"
        :aria-label="closeLabel"
        @click="emit('close-mobile')"
      >
        <slot name="close-icon">
          <Icon name="x" :size="19" />
        </slot>
      </button>
    </div>
    <nav class="ocp-admin-nav">
      <slot />
    </nav>
    <div v-if="$slots.footer" class="ocp-admin-sider-foot">
      <slot name="footer" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Icon } from '@ocpui/vue';

interface Props {
  mobileOpen?: boolean;
  showMobileClose?: boolean;
  ariaLabel?: string;
  closeLabel?: string;
}

withDefaults(defineProps<Props>(), {
  mobileOpen: false,
  showMobileClose: true,
  ariaLabel: '侧边导航',
  closeLabel: '关闭导航',
});

const emit = defineEmits<{ 'close-mobile': [] }>();
</script>

<script lang="ts">
export default { name: 'AdminSidebar' };
</script>

<style scoped>
.ocp-admin-menu-close {
  display: none;
}

@media (max-width: 979.98px) {
  .ocp-admin-menu-close {
    display: grid;
  }
}
</style>
