<!--
SearchTrigger：顶栏搜索入口（图标 + 文案 + 快捷键提示）
-->
<template>
  <button
    type="button"
    class="ocp-search-trigger"
    :class="{ 'ocp-search-trigger--compact': compact }"
    :aria-label="ariaLabel"
    @click="emit('click', $event)"
  >
    <span class="ocp-search-trigger__icon" aria-hidden="true">
      <slot name="icon">
        <Icon name="search" size="sm" />
      </slot>
    </span>
    <span v-if="label" class="ocp-search-trigger__label">{{ label }}</span>
    <kbd v-if="shortcut" class="ocp-kbd-hint">{{ shortcut }}</kbd>
  </button>
</template>

<script setup lang="ts">
import Icon from './Icon.vue';

withDefaults(
  defineProps<{
    label?: string;
    shortcut?: string;
    ariaLabel: string;
    /** 仅图标（窄屏） */
    compact?: boolean;
  }>(),
  {
    label: '',
    shortcut: '',
    compact: false,
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>
