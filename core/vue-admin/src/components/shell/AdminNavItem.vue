<template>
  <a
    v-if="as === 'link' && href"
    :href="href"
    class="ocp-admin-nav-item"
    :class="{ 'is-active': active }"
    :aria-current="active ? 'page' : undefined"
    @click="onClick"
  >
    <NavItemInner
      :count="count"
      :count-aria-label="countAriaLabel"
    >
      <template v-if="$slots.icon" #icon>
        <slot name="icon" />
      </template>
      <slot>{{ label }}</slot>
    </NavItemInner>
  </a>
  <button
    v-else
    type="button"
    class="ocp-admin-nav-item"
    :class="{ 'is-active': active }"
    :disabled="disabled"
    :aria-current="active ? 'page' : undefined"
    @click="onClick"
  >
    <NavItemInner
      :count="count"
      :count-aria-label="countAriaLabel"
    >
      <template v-if="$slots.icon" #icon>
        <slot name="icon" />
      </template>
      <slot>{{ label }}</slot>
    </NavItemInner>
  </button>
</template>

<script setup lang="ts">
import NavItemInner from './AdminNavItemInner.vue';

withDefaults(
  defineProps<{
    label?: string;
    active?: boolean;
    disabled?: boolean;
    count?: string | number;
    countAriaLabel?: string;
    as?: 'button' | 'link';
    href?: string;
  }>(),
  {
    label: '',
    active: false,
    disabled: false,
    count: undefined,
    countAriaLabel: '',
    as: 'button',
    href: '',
  },
);

const emit = defineEmits<{ click: [MouseEvent] }>();

function onClick(e: MouseEvent) {
  emit('click', e);
}
</script>

<script lang="ts">
export default { name: 'AdminNavItem' };
</script>
