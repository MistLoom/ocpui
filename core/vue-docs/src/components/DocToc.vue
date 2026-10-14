<template>
  <nav
    v-if="items.length > 0"
    class="doc-toc"
    :aria-label="ariaLabel"
  >
    <p v-if="title" class="doc-toc__title">{{ title }}</p>
    <ul class="doc-toc__list">
      <li
        v-for="item in items"
        :key="item.id"
        class="doc-toc__item"
        :class="{ 'doc-toc__item--active': item.id === activeId }"
        :style="{ paddingInlineStart: `${(item.depth - minDepth) * 0.75}rem` }"
      >
        <a
          :href="`#${item.id}`"
          class="doc-toc__link"
          :aria-current="item.id === activeId ? 'location' : undefined"
          @click.prevent="scrollTo(item.id)"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { DocHeading } from '@ocpui/markdown-core';

interface Props {
  headings?: DocHeading[];
  /** 正文根元素，用于 scroll spy */
  container?: HTMLElement | null;
  title?: string;
  ariaLabel?: string;
  /** 纳入目录的最小标题级别 */
  minDepth?: number;
  /** 纳入目录的最大标题级别 */
  maxDepth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  headings: () => [],
  title: '',
  ariaLabel: '目录',
  minDepth: 2,
  maxDepth: 4,
});

const activeId = defineModel<string>('activeId', { default: '' });

const items = computed(() =>
  props.headings.filter((h) => h.depth >= props.minDepth && h.depth <= props.maxDepth),
);

const minDepth = computed(() =>
  items.value.reduce((min, item) => Math.min(min, item.depth), props.minDepth),
);

let observer: IntersectionObserver | null = null;

function scrollTo(id: string) {
  const el = props.container?.querySelector(`#${CSS.escape(id)}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  activeId.value = id;
}

function setupObserver(container: HTMLElement | null | undefined) {
  observer?.disconnect();
  observer = null;
  if (!container || items.value.length === 0) {
    return;
  }

  const elements = items.value
    .map((h) => container.querySelector(`#${CSS.escape(h.id)}`))
    .filter((el): el is HTMLElement => el instanceof HTMLElement);

  if (elements.length === 0) {
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const top = visible[0]?.target;
      if (top?.id) {
        activeId.value = top.id;
      }
    },
    { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 },
  );

  elements.forEach((el) => observer?.observe(el));
}

onMounted(() => setupObserver(props.container));
onUnmounted(() => observer?.disconnect());

watch(
  () => [props.container, props.headings] as const,
  () => setupObserver(props.container),
  { deep: true },
);
</script>

<style scoped>
.doc-toc {
  font-size: 0.875rem;
  line-height: 1.5;
}

.doc-toc__title {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: hsl(var(--text-muted));
}

.doc-toc__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.doc-toc__link {
  display: block;
  padding-block: 0.3125rem;
  padding-inline-start: 0.75rem;
  color: hsl(var(--text-muted));
  text-decoration: none;
  border-inline-start: 2px solid transparent;
  border-radius: 0 var(--radius-sm, 0.25rem) var(--radius-sm, 0.25rem) 0;
  transition:
    color var(--duration-light, 150ms) var(--ease-standard, ease),
    border-color var(--duration-light, 150ms) var(--ease-standard, ease),
    background-color var(--duration-light, 150ms) var(--ease-standard, ease);
}

.doc-toc__item--active .doc-toc__link,
.doc-toc__link:hover {
  color: hsl(var(--text));
  background: hsl(var(--primary) / 0.06);
}

.doc-toc__item--active .doc-toc__link {
  border-inline-start-color: hsl(var(--primary));
  color: hsl(var(--primary));
  font-weight: 500;
}
</style>
