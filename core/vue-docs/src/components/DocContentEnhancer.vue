<template>
  <Teleport to="body">
    <div
      v-if="overlay.visible"
      class="doc-content-enhancer__layer"
      data-ui-dispatch-role="overlay-host"
      :style="overlayStyle"
      @mouseenter="keepOpen = true"
      @mouseleave="hideOverlay"
    >
      <DocCrossPreview
        v-if="overlay.kind === 'cross'"
        :state="overlay.crossState"
        :title="overlay.title"
        :excerpt="overlay.excerpt"
        :path="overlay.path"
      />
      <div v-else class="doc-content-enhancer__glossary">
        <p class="doc-content-enhancer__glossary-term">{{ overlay.term }}</p>
        <p class="doc-content-enhancer__glossary-def">{{ overlay.definition }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch, type Ref } from 'vue';
import type { DocCrossPreviewResolver } from '../types/doc-enhance.js';
import DocCrossPreview from './DocCrossPreview.vue';

interface Props {
  root: Ref<HTMLElement | null> | HTMLElement | null;
  glossary?: Record<string, string>;
  resolveCrossPreview?: DocCrossPreviewResolver;
}

const props = withDefaults(defineProps<Props>(), {
  glossary: () => ({}),
});

const keepOpen = ref(false);
let hoverTimer: ReturnType<typeof setTimeout> | null = null;
let activeTarget: HTMLElement | null = null;
let abortController: AbortController | null = null;

const overlay = reactive({
  visible: false,
  x: 0,
  y: 0,
  kind: 'glossary' as 'glossary' | 'cross',
  term: '',
  definition: '',
  title: '',
  excerpt: '',
  path: '',
  crossState: 'ready' as 'loading' | 'ready' | 'error',
});

const overlayStyle = computed(() => ({
  left: `${overlay.x}px`,
  top: `${overlay.y}px`,
}));

function resolveRoot(): HTMLElement | null {
  const source = props.root;
  if (!source) {
    return null;
  }
  return typeof source === 'object' && 'value' in source ? source.value : source;
}

function positionNear(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  overlay.x = Math.min(rect.left, window.innerWidth - 320);
  overlay.y = rect.bottom + 8;
}

function hideOverlay() {
  keepOpen.value = false;
  window.setTimeout(() => {
    if (!keepOpen.value) {
      overlay.visible = false;
      activeTarget = null;
      abortController?.abort();
    }
  }, 120);
}

function showGlossary(target: HTMLElement, term: string) {
  const definition = props.glossary[term];
  if (!definition) {
    return;
  }
  overlay.kind = 'glossary';
  overlay.term = term;
  overlay.definition = definition;
  overlay.crossState = 'ready';
  positionNear(target);
  overlay.visible = true;
}

async function showCrossPreview(target: HTMLElement, href: string) {
  if (!props.resolveCrossPreview) {
    return;
  }
  overlay.kind = 'cross';
  overlay.crossState = 'loading';
  overlay.title = '';
  overlay.excerpt = '';
  overlay.path = href;
  positionNear(target);
  overlay.visible = true;

  abortController?.abort();
  abortController = new AbortController();

  try {
    const data = await props.resolveCrossPreview(href);
    if (abortController.signal.aborted || activeTarget !== target) {
      return;
    }
    if (!data) {
      overlay.crossState = 'error';
      return;
    }
    overlay.title = data.title;
    overlay.excerpt = data.excerpt;
    overlay.path = data.path ?? href;
    overlay.crossState = 'ready';
  } catch {
    if (!abortController.signal.aborted) {
      overlay.crossState = 'error';
    }
  }
}

function handlePointerOver(event: Event) {
  const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
    '[data-doc-glossary-term], [data-doc-cross-href]',
  );
  if (!target || target === activeTarget) {
    return;
  }

  if (hoverTimer) {
    clearTimeout(hoverTimer);
  }

  hoverTimer = setTimeout(() => {
    activeTarget = target;
    keepOpen.value = true;

    const glossaryTerm = target.getAttribute('data-doc-glossary-term');
    if (glossaryTerm) {
      showGlossary(target, glossaryTerm);
      return;
    }

    const crossHref = target.getAttribute('data-doc-cross-href') ?? target.getAttribute('href');
    if (crossHref) {
      void showCrossPreview(target, crossHref);
    }
  }, 180);
}

function handlePointerOut(event: MouseEvent) {
  const related = event.relatedTarget as HTMLElement | null;
  if (related?.closest('.doc-content-enhancer__layer')) {
    return;
  }
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
  hideOverlay();
}

function attachListeners(root: HTMLElement) {
  root.addEventListener('mouseover', handlePointerOver);
  root.addEventListener('mouseout', handlePointerOut);
}

function detachListeners(root: HTMLElement | null | undefined) {
  if (!root) {
    return;
  }
  root.removeEventListener('mouseover', handlePointerOver);
  root.removeEventListener('mouseout', handlePointerOut);
}

watch(
  () => resolveRoot(),
  (next, prev) => {
    detachListeners(prev);
    if (next) {
      attachListeners(next);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  detachListeners(resolveRoot());
  abortController?.abort();
});
</script>

<style scoped>
.doc-content-enhancer__layer {
  position: fixed;
  z-index: 1200;
  pointer-events: auto;
  animation: doc-overlay-enter var(--duration-fast, 0.12s) var(--ease-standard, ease) forwards;
}

@keyframes doc-overlay-enter {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.doc-content-enhancer__glossary {
  width: min(18rem, 80vw);
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  box-shadow: var(--shadow-md, 0 8px 24px rgb(0 0 0 / 12%));
}

.doc-content-enhancer__glossary-term {
  margin: 0 0 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
}

.doc-content-enhancer__glossary-def {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: hsl(var(--text-muted));
}
</style>
