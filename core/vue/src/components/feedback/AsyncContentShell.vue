<!--
AsyncContentShell 异步内容三态壳（错误 / pending / 正文）

可选 interactiveReveal：SSR 保留 DOM 供抓取，有头浏览默认遮罩正文直至 pending 结束（配合全局 reveal CSS/脚本）。

属性：
- pending / error
- interactiveReveal: 是否启用客户端 reveal 遮罩
- showProgress / skeletonPreset / skeletonRows
- gap: pending 区与进度条间距（Flex）
- loadState* 透传 LoadState

插槽：default、pending、error

事件：retry、phase-change(pending|error|ready)、reveal-ready
-->
<template>
  <Flex
    vertical
    :gap="gap"
    :class="rootClass"
    data-part="async-content-shell"
  >
    <slot v-if="showError" name="error">
      <LoadState
        :error="error"
        :size="loadStateSize"
        :back-to="errorBackTo"
        :error-message="errorMessage"
        @retry="emit('retry')"
      />
    </slot>

    <template v-else-if="shellPending">
      <slot name="pending">
        <RegionLoadingBar v-if="showProgress" />
        <SkeletonScene
          :preset="skeletonPreset"
          :rows="skeletonRows"
        />
      </slot>
    </template>

    <div
      v-if="!showError"
      class="ocp-async-reveal__main"
      :class="{ 'ocp-async-reveal__main--masked': maskMain }"
      :aria-hidden="maskMain ? true : undefined"
      :inert="maskMain ? true : undefined"
    >
      <slot />
    </div>
  </Flex>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { Flex } from '../layout';
import { SkeletonScene } from '../utility';
import type { SkeletonScenePreset } from '../utility/SkeletonScene.vue';
import LoadState from './LoadState.vue';
import RegionLoadingBar from './RegionLoadingBar.vue';
import { useAsyncRevealDocumentGate } from '../../composables/useAsyncReveal';

type ShellPhase = 'pending' | 'error' | 'ready';

const props = withDefaults(
  defineProps<{
    pending?: boolean;
    error?: unknown;
    interactiveReveal?: boolean;
    showProgress?: boolean;
    skeletonPreset?: SkeletonScenePreset;
    skeletonRows?: number;
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    loadStateSize?: 'sm' | 'md';
    errorBackTo?: string;
    errorMessage?: string;
  }>(),
  {
    pending: false,
    error: undefined,
    interactiveReveal: false,
    showProgress: true,
    skeletonPreset: 'list',
    skeletonRows: 3,
    gap: 'md',
    loadStateSize: 'md',
    errorBackTo: '',
    errorMessage: '',
  },
);

const emit = defineEmits<{
  retry: [];
  'phase-change': [phase: ShellPhase];
  'reveal-ready': [];
}>();

const showError = computed(() => props.error != null);

const shellPending = computed(() => !showError.value && Boolean(props.pending));

const maskMain = computed(
  () => props.interactiveReveal && shellPending.value,
);

/** 与 interactiveReveal 无关，供站点样式区分三态 */
const shellPhaseClass = computed(() => {
  if (showError.value) return 'ocp-async-shell--error';
  if (shellPending.value) return 'ocp-async-shell--pending';
  return 'ocp-async-shell--ready';
});

const revealPhaseClass = computed(() => {
  if (!props.interactiveReveal) return '';
  if (showError.value) return 'ocp-async-reveal--error';
  if (maskMain.value) return 'ocp-async-reveal--masked';
  return 'ocp-async-reveal--ready';
});

const rootClass = computed(() => [
  'ocp-async-content-shell',
  shellPhaseClass.value,
  props.interactiveReveal ? 'ocp-async-reveal' : '',
  props.interactiveReveal ? 'ocp-async-reveal--interactive' : '',
  revealPhaseClass.value,
]);

const phase = computed((): ShellPhase => {
  if (showError.value) return 'error';
  if (shellPending.value) return 'pending';
  return 'ready';
});

watch(
  phase,
  (p, prev) => {
    if (p !== prev) emit('phase-change', p);
    if (p === 'ready' && props.interactiveReveal) emit('reveal-ready');
  },
  { immediate: true },
);

useAsyncRevealDocumentGate(shellPending, computed(() => props.interactiveReveal));
</script>
