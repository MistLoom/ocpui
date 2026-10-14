<template>
  <aside
    class="doc-admonition"
    :class="`doc-admonition--${type}`"
    :data-admonition-type="type"
  >
    <p v-if="title || type" class="doc-admonition__title">
      <svg class="doc-admonition__icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <template v-if="type === 'tip'">
          <path d="M8 1.5a5 5 0 100 10 5 5 0 000-10zM8 3v3m0 2.5h.007" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </template>
        <template v-else-if="type === 'warning' || type === 'caution'">
          <path d="M8 2L1.5 13h13L8 2zM8 6v3.5m0 1.5h.007" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </template>
        <template v-else-if="type === 'danger'">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5" />
          <path d="M8 5v3.5m0 2.5h.007" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </template>
        <template v-else>
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5" />
          <path d="M8 7v4m0-6.5h.007" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </template>
      </svg>
      {{ title || typeLabel }}
    </p>
    <div v-if="$slots.default" class="doc-admonition__body">
      <slot />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type AdmonitionType = 'note' | 'tip' | 'info' | 'warning' | 'danger' | 'caution';

interface Props {
  type?: AdmonitionType;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'note',
  title: '',
});

const typeLabel = computed(() => {
  const map: Record<AdmonitionType, string> = {
    note: '注意',
    tip: '提示',
    info: '信息',
    warning: '警告',
    danger: '危险',
    caution: '注意',
  };
  return map[props.type] ?? '';
});
</script>

<style scoped>
.doc-admonition {
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid hsl(var(--border));
  padding: 0.875rem 1rem;
  margin-block: 1rem;
}

.doc-admonition__title {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0 0 0.5rem;
  font-weight: 600;
}

.doc-admonition__icon {
  flex-shrink: 0;
}

.doc-admonition--tip .doc-admonition__icon {
  color: hsl(var(--success));
}

.doc-admonition--warning .doc-admonition__icon,
.doc-admonition--caution .doc-admonition__icon {
  color: hsl(var(--warning));
}

.doc-admonition--danger .doc-admonition__icon {
  color: hsl(var(--error));
}

.doc-admonition--info .doc-admonition__icon,
.doc-admonition--note .doc-admonition__icon {
  color: hsl(var(--primary));
}

.doc-admonition--tip {
  border-color: hsl(var(--success) / 0.35);
  background: hsl(var(--success) / 0.08);
}

.doc-admonition--warning,
.doc-admonition--caution {
  border-color: hsl(var(--warning) / 0.35);
  background: hsl(var(--warning) / 0.08);
}

.doc-admonition--danger {
  border-color: hsl(var(--danger) / 0.35);
  background: hsl(var(--danger) / 0.08);
}

.doc-admonition--info,
.doc-admonition--note {
  border-color: hsl(var(--primary) / 0.25);
  background: hsl(var(--primary) / 0.06);
}
</style>
