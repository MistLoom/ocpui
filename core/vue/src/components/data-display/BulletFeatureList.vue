<script setup lang="ts">
/**
 * 要点列表：图标槽 + 文案，适用于能力清单、特性枚举等。
 */
withDefaults(defineProps<{
  items: string[]
  columns?: 1 | 2
  density?: 'comfortable' | 'compact'
}>(), {
  columns: 2,
  density: 'comfortable',
})
</script>

<template>
  <ul
    v-if="items.length"
    class="ocp-bullet-feature-list"
    :class="[
      `ocp-bullet-feature-list--cols-${columns}`,
      `ocp-bullet-feature-list--${density}`,
    ]"
  >
    <li v-for="(item, index) in items" :key="index" class="ocp-bullet-feature-list__item">
      <span class="ocp-bullet-feature-list__mark" aria-hidden="true">
        <slot name="mark">✓</slot>
      </span>
      <span class="ocp-bullet-feature-list__text">{{ item }}</span>
    </li>
  </ul>
</template>

<style scoped>
.ocp-bullet-feature-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-3, 0.75rem);
}

.ocp-bullet-feature-list--cols-2 {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
}

.ocp-bullet-feature-list--cols-1 {
  grid-template-columns: 1fr;
}

.ocp-bullet-feature-list--compact {
  gap: var(--space-2, 0.5rem);
}

.ocp-bullet-feature-list__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2, 0.5rem);
  padding: var(--space-3, 0.75rem);
  border-radius: var(--radius-control, 10px);
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.08));
  background: color-mix(in srgb, hsl(var(--color-bg-subtle)) 88%, transparent);
}

.ocp-bullet-feature-list--compact .ocp-bullet-feature-list__item {
  padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
}

.ocp-bullet-feature-list__mark {
  flex-shrink: 0;
  display: inline-grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.1em;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  color: hsl(var(--color-primary));
  background: color-mix(in srgb, hsl(var(--color-primary)) 14%, transparent);
}

.ocp-bullet-feature-list__text {
  font-size: var(--text-l5-size, 0.875rem);
  line-height: 1.55;
  color: hsl(var(--color-text-secondary));
}
</style>
