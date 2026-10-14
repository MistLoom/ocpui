<!--
LoadState 加载/错误/缺失态（消费端克制排版，非 admin 告警条）

属性：
- variant: 'error' | 'not-found' | 'offline' | 'timeout'
- title / description / errorMessage
- size: 'sm' | 'md'
- backTo / backLabel

事件：retry、back
-->
<template>
  <Flex
    vertical
    align="start"
    :gap="size === 'sm' ? 'sm' : 'md'"
    :class="['load-state', `load-state--${size}`, `load-state--${resolvedVariant}`]"
    role="status"
  >
    <p class="load-state__title">
      {{ title || defaultTitle }}
    </p>
    <p v-if="resolvedDescription" class="load-state__desc">
      {{ resolvedDescription }}
    </p>
    <Flex wrap="wrap" gap="sm" class="load-state__actions">
      <Button
        v-if="showRetry"
        type="button"
        :variant="resolvedVariant === 'not-found' ? 'secondary' : 'primary'"
        :size="size === 'sm' ? 'sm' : 'md'"
        @click="emit('retry')"
      >
        {{ retryLabel || t('feedback.loadState.retry') }}
      </Button>
      <Button
        v-if="backTo"
        type="button"
        :variant="resolvedVariant === 'not-found' ? 'primary' : 'secondary'"
        :size="size === 'sm' ? 'sm' : 'md'"
        @click="handleBack"
      >
        {{ backLabel || t('feedback.loadState.back') }}
      </Button>
      <slot name="actions" />
    </Flex>
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUiT } from '../../composables/useUiT';
import { Button } from '../utility';
import { Flex } from '../layout';
import {
  resolveLoadStateVariant,
  type LoadStateVariant,
} from './resolve-load-state';

const props = withDefaults(
  defineProps<{
    error?: unknown;
    variant?: LoadStateVariant;
    title?: string;
    description?: string;
    errorMessage?: string;
    size?: 'sm' | 'md';
    backTo?: string;
    backLabel?: string;
    retryLabel?: string;
  }>(),
  {
    error: undefined,
    variant: undefined,
    title: '',
    description: '',
    errorMessage: '',
    size: 'md',
    backTo: '',
    backLabel: '',
    retryLabel: '',
  },
);

const emit = defineEmits<{ retry: []; back: [] }>();

const { uiT: t } = useUiT();
const router = useRouter();

const resolvedVariant = computed(() =>
  resolveLoadStateVariant(props.error, props.variant),
);

const defaultTitle = computed(() => {
  const map: Record<LoadStateVariant, string> = {
    error: t('feedback.loadState.loadFailed'),
    'not-found': t('feedback.loadState.notFound'),
    offline: t('feedback.loadState.offline'),
    timeout: t('feedback.loadState.timeout'),
  };
  return map[resolvedVariant.value];
});

const resolvedDescription = computed(() => {
  const apiMessage = props.errorMessage || props.description || '';
  if (resolvedVariant.value === 'not-found') {
    return apiMessage || undefined;
  }
  if (apiMessage) return apiMessage;
  if (resolvedVariant.value === 'offline') {
    return t('feedback.loadState.offlineHint');
  }
  if (resolvedVariant.value === 'timeout') {
    return t('feedback.loadState.timeoutHint');
  }
  return t('feedback.loadState.loadFailedHint');
});

const showRetry = computed(() =>
  resolvedVariant.value !== 'not-found',
);

function handleBack(): void {
  emit('back');
  if (props.backTo) {
    void router.push(props.backTo);
  }
}
</script>

<style scoped>
.load-state {
  padding-block: var(--space-6, 1.5rem);
  max-width: 28rem;
}

.load-state--sm {
  padding-block: var(--space-3, 0.75rem);
}

.load-state__title {
  margin: 0;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.load-state__desc {
  margin: 0;
  line-height: 1.55;
}

.load-state__actions {
  margin-top: var(--space-1, 0.25rem);
}
</style>
