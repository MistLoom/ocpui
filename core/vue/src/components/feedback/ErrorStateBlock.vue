<!--
ErrorStateBlock 错误态块组件

admin 端统一错误态组件，用于页面加载失败、数据获取失败等场景的可见错误态展示。
提供"可见 + 可重试 + 可返回"三要素，替代仅 Toast 一闪而过的错误处理模式。

属性：
- title: 错误标题，默认值：根据 size 自动显示 i18n 默认标题
- description: 错误描述，可选，默认值：i18n 默认描述
- errorMessage: 后端原始错误消息，可选，透传展示（便于排查）
- size: 尺寸，'sm'（卡片内紧凑）| 'md'（页面级），默认值：'md'
- backTo: 返回目标路径，可选，提供时显示"返回"按钮
- backLabel: 返回按钮文案，默认值：i18n 默认返回文案

事件：
- retry: 用户点击"重试"按钮时触发，由调用方执行重试逻辑

使用方式：
【页面级错误态】
<ErrorStateBlock
  :error-message="teamError?.userMessage"
  @retry="loadTeam"
/>

【页面级错误态 + 返回】
<ErrorStateBlock
  :title="t('pages.teams.detail.loadFailedTitle')"
  :error-message="errorMessage"
  :back-to="TEAMS_LIST_PATH"
  @retry="loadTeam"
/>

【卡片内错误态】
<ErrorStateBlock
  size="sm"
  :error-message="membersError?.userMessage"
  @retry="loadMembers"
/>
-->
<template>
  <div :class="['error-state-block', `error-state-block--${size}`]" role="alert" aria-live="assertive">
    <div class="error-state-block__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>

    <div class="error-state-block__body">
      <h4 class="error-state-block__title">{{ title || defaultTitle }}</h4>
      <p v-if="description || defaultDescription" class="error-state-block__description">
        {{ description || defaultDescription }}
      </p>
      <p v-if="errorMessage" class="error-state-block__error-message">
        {{ errorMessage }}
      </p>

      <div class="error-state-block__actions">
        <Button
          variant="primary"
          :size="size === 'sm' ? 'sm' : 'md'"
          @click="handleRetry"
        >
          {{ t('common.retry') }}
        </Button>
        <Button
          v-if="backTo"
          variant="text"
          :size="size === 'sm' ? 'sm' : 'md'"
          @click="handleBack"
        >
          {{ backLabel || t('components.feedback.errorStateBlock.defaultBackLabel') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { Button } from '@ocpui/vue/utility';

type ErrorStateSize = 'sm' | 'md';

interface Props {
  title?: string;
  description?: string;
  errorMessage?: string;
  size?: ErrorStateSize;
  backTo?: string;
  backLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  errorMessage: '',
  size: 'md',
  backTo: '',
  backLabel: '',
});

const emit = defineEmits<{ retry: [] }>();

const { uiT: t } = useUiT();
const router = useRouter();

const defaultTitle = computed(() => {
  return t('components.feedback.errorStateBlock.defaultTitle');
});

const defaultDescription = computed(() => {
  return t('components.feedback.errorStateBlock.defaultDescription');
});

function handleRetry(): void {
  emit('retry');
}

function handleBack(): void {
  if (props.backTo) {
    router.push(props.backTo);
  }
}
</script>

<style scoped>
.error-state-block {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 32px 24px;
  border-radius: 12px;
  border: 1px solid hsl(var(--error) / 0.2);
  background: hsl(var(--error) / 0.05);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.error-state-block__icon {
  flex-shrink: 0;
  color: hsl(var(--error));
}

.error-state-block__icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.error-state-block__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.error-state-block__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--text));
  line-height: 1.4;
}

.error-state-block__description {
  margin: 0;
  font-size: 14px;
  color: hsl(var(--text-secondary));
  line-height: 1.5;
}

.error-state-block__error-message {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--text-muted));
  line-height: 1.5;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  word-break: break-all;
  padding: 6px 10px;
  background: hsl(var(--surface-inset));
  border-radius: 6px;
  border: 1px solid hsl(var(--border) / 0.6);
}

.error-state-block__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

/* size: md（页面级） */
.error-state-block--md {
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
  gap: 20px;
}

.error-state-block--md .error-state-block__icon {
  width: 56px;
  height: 56px;
}

.error-state-block--md .error-state-block__body {
  align-items: center;
  max-width: 480px;
}

.error-state-block--md .error-state-block__error-message {
  max-width: 100%;
}

.error-state-block--md .error-state-block__actions {
  justify-content: center;
}

/* size: sm（卡片内） */
.error-state-block--sm {
  padding: 16px 20px;
  gap: 12px;
}

.error-state-block--sm .error-state-block__icon {
  width: 24px;
  height: 24px;
  margin-top: 2px;
}

.error-state-block--sm .error-state-block__title {
  font-size: 14px;
}

.error-state-block--sm .error-state-block__description {
  font-size: 13px;
}

.error-state-block--sm .error-state-block__error-message {
  font-size: 11px;
  padding: 4px 8px;
}

.error-state-block--sm .error-state-block__actions {
  margin-top: 4px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .error-state-block--md {
    padding: 32px 16px;
  }

  .error-state-block--md .error-state-block__icon {
    width: 48px;
    height: 48px;
  }

  .error-state-block--md .error-state-block__title {
    font-size: 15px;
  }

  .error-state-block--sm {
    padding: 14px 16px;
  }
}
</style>
