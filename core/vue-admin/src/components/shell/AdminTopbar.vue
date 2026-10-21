<template>
  <header class="ocp-admin-topbar">
    <div class="ocp-admin-topbar-left">
      <button
        v-if="showMenuButton"
        type="button"
        class="ocp-admin-icon-btn ocp-admin-menu-btn"
        :aria-label="menuLabel"
        :aria-controls="sidebarId"
        @click="emit('menu')"
      >
        <slot name="menu-icon">
          <Icon name="menu" :size="19" />
        </slot>
      </button>
      <slot name="leading" />
    </div>
    <div v-if="$slots.center" class="ocp-admin-topbar-center">
      <slot name="center" />
    </div>
    <div class="ocp-admin-topbar-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { Icon } from '@ocpui/vue';

withDefaults(
  defineProps<{
    showMenuButton?: boolean;
    menuLabel?: string;
    sidebarId?: string;
  }>(),
  {
    showMenuButton: true,
    menuLabel: '打开导航',
    sidebarId: 'admin-sidebar',
  },
);

const emit = defineEmits<{ menu: [] }>();
</script>

<script lang="ts">
export default { name: 'AdminTopbar' };
</script>

<style scoped>
.ocp-admin-topbar-center {
  flex: 1;
  max-width: 420px;
  margin-inline: auto;
  min-width: 0;
}

.ocp-admin-topbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.ocp-admin-menu-btn {
  display: none;
}

@media (max-width: 979.98px) {
  .ocp-admin-menu-btn {
    display: grid;
  }

  .ocp-admin-topbar {
    padding: 0 16px;
    gap: 8px;
  }

  .ocp-admin-topbar-left {
    min-width: 0;
  }
}
</style>
