<template>
  <component
    :is="href ? 'a' : 'div'"
    class="ocp-admin-brand"
    :href="href || undefined"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <span class="ocp-admin-brand-mark">
      <slot name="mark">
        <Icon v-if="icon" :name="icon" :size="21" />
      </slot>
    </span>
    <span class="ocp-admin-brand-text">
      <strong>{{ title }}</strong>
      <span v-if="subtitle">{{ subtitle }}</span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { Icon } from '@ocpui/vue';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    icon?: string;
    href?: string;
    ariaLabel?: string;
  }>(),
  {
    subtitle: '',
    icon: '',
    href: '',
    ariaLabel: '',
  },
);

const emit = defineEmits<{ click: [MouseEvent] }>();

function onClick(e: MouseEvent) {
  if (!props.href) emit('click', e);
}
</script>

<script lang="ts">
export default { name: 'AdminBrand' };
</script>
