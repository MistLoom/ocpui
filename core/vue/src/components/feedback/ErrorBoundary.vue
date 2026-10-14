<!--
ErrorBoundary 错误边界组件

功能：捕获子组件渲染错误，展示友好的错误回退界面，支持错误详情查看、复制与报告提交。

属性：
- title: 错误标题
- description: 错误描述
- retryText: 重试按钮文本
- homeText: 首页按钮文本
- showDetails: 是否显示错误详情
- showReport: 是否显示报告按钮
- onRetry: 重试回调函数
- onReport: 报告回调函数

事件：
- retry: 重试时触发
- go-home: 点击返回首页时触发
- report: 提交报告时触发

使用方式：
<ErrorBoundary @retry="handleRetry" @report="handleReport">
  <YourComponent />
</ErrorBoundary>
-->
<template>
  <div class="error-boundary">
    <slot v-if="!hasError" />

    <div v-else class="error-boundary-fallback">
      <div class="error-boundary-content">
        <div class="error-boundary-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>

        <h3 class="error-boundary-title">{{ title }}</h3>
        <p class="error-boundary-description">{{ description }}</p>

        <div class="error-boundary-actions">
          <Button variant="primary" @click="handleRetry">
            <Icon name="refresh-cw" :size="16" />
            {{ retryText }}
          </Button>
          <Button variant="secondary" @click="handleGoHome">
            {{ homeText }}
          </Button>
        </div>

        <div v-if="showDetails" class="error-boundary-details">
          <button
            type="button"
            class="error-boundary-details-header"
            :aria-expanded="detailsOpen"
            @click="toggleDetails"
          >
            <span>{{ t('components.feedback.errorBoundary.errorDetails') }}</span>
            <Icon :name="detailsOpen ? 'chevron-up' : 'chevron-down'" :size="16" />
          </button>
          <CollapseTransition>
            <div v-show="detailsOpen" class="error-boundary-details-content">
              <pre class="error-boundary-stack">{{ error?.stack }}</pre>
              <Button
                variant="text"
                size="sm"
                class="error-boundary-copy"
                @click="copyError"
              >
                <Icon name="copy" :size="14" />
                {{ copySuccess ? t('components.feedback.errorBoundary.copySuccess') : t('components.feedback.errorBoundary.copyError') }}
              </Button>
            </div>
          </CollapseTransition>
        </div>

        <div v-if="showReport" class="error-boundary-report">
          <Button variant="text" size="sm" @click="showReportForm = true">
            <Icon name="flag" :size="14" />
            {{ t('components.feedback.errorBoundary.reportIssue') }}
          </Button>

          <Modal
            v-model="showReportForm"
            :title="t('components.feedback.errorBoundary.reportIssueTitle')"
            width="480"
          >
            <div class="error-report-form">
              <div class="error-report-field">
                <label>{{ t('components.feedback.errorBoundary.issueDescription') }}</label>
                <Textarea
                  v-model="reportForm.description"
                  :placeholder="t('components.feedback.errorBoundary.issueDescriptionPlaceholder')"
                  :rows="4"
                />
              </div>
              <div class="error-report-field">
                <label>{{ t('components.feedback.errorBoundary.contactEmail') }}</label>
                <Input v-model="reportForm.email" placeholder="your@email.com" />
              </div>
              <div class="error-report-field">
                <Checkbox v-model="reportForm.includeContext">
                  {{ t('components.feedback.errorBoundary.includeErrorContext') }}
                </Checkbox>
              </div>
              <div v-if="reportError" class="error-report-error">
                {{ reportError }}
              </div>
            </div>
            <template #footer>
              <Button variant="secondary" @click="showReportForm = false">
                {{ t('components.feedback.errorBoundary.cancel') }}
              </Button>
              <Button variant="primary" :loading="submitting" @click="submitReport">
                {{ t('components.feedback.errorBoundary.submitReport') }}
              </Button>
            </template>
          </Modal>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured } from 'vue';
import { Button, Icon } from '../utility';
import Modal from './Modal.vue';
import { Input, Textarea, Checkbox } from '../data-entry';
import { CollapseTransition } from '../animation';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface Props {
  title?: string;
  description?: string;
  retryText?: string;
  homeText?: string;
  showDetails?: boolean;
  showReport?: boolean;
  onRetry?: () => void;
  onReport?: (report: { description: string; email: string; error: Error | null }) => void;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  retryText: '',
  homeText: '',
  showDetails: true,
  showReport: true,
});

const emit = defineEmits<{
  retry: [];
  'go-home': [];
  report: [report: { description: string; email: string; error: Error | null }];
}>();

const hasError = ref(false);
const error = ref<Error | null>(null);
const detailsOpen = ref(false);
const showReportForm = ref(false);
const submitting = ref(false);
const copySuccess = ref(false);
const reportError = ref<string | null>(null);

const reportForm = ref({
  description: '',
  email: '',
  includeContext: true,
});

// 解析后的回退文案：未传 prop 时走 i18n
const resolvedTitle = computed(() => props.title || t('components.feedback.errorBoundary.defaultTitle'));
const resolvedDescription = computed(() => props.description || t('components.feedback.errorBoundary.defaultDescription'));
const resolvedRetryText = computed(() => props.retryText || t('components.feedback.errorBoundary.defaultRetryText'));
const resolvedHomeText = computed(() => props.homeText || t('components.feedback.errorBoundary.defaultHomeText'));

onErrorCaptured((err) => {
  error.value = err;
  hasError.value = true;

  // 可在此处接入错误上报通道
  // eslint-disable-next-line no-console
  console.error('ErrorBoundary captured error:', err);

  return false; // 阻止错误继续传播
});

const toggleDetails = () => {
  detailsOpen.value = !detailsOpen.value;
};

const copyError = async () => {
  if (!error.value) return;

  const errorText = `${error.value.message}\n\n${error.value.stack}`;
  try {
    await navigator.clipboard.writeText(errorText);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch {
    // 复制失败：静默降级，避免抛出未捕获异常破坏错误边界
  }
};

const handleRetry = () => {
  emit('retry');
  props.onRetry?.();

  hasError.value = false;
  error.value = null;
};

const handleGoHome = () => {
  emit('go-home');
  window.location.href = '/';
};

const submitReport = async () => {
  if (!reportForm.value.description.trim()) {
    reportError.value = t('components.feedback.errorBoundary.descriptionRequired');
    return;
  }

  submitting.value = true;
  reportError.value = null;

  const report = {
    description: reportForm.value.description,
    email: reportForm.value.email,
    error: reportForm.value.includeContext ? error.value : null,
  };

  try {
    emit('report', report);
    await props.onReport?.(report);

    // 模拟提交（业务方应通过 onReport prop 注入真实实现）
    await new Promise(resolve => setTimeout(resolve, 1000));

    submitting.value = false;
    showReportForm.value = false;

    reportForm.value = {
      description: '',
      email: '',
      includeContext: true,
    };
  } catch {
    reportError.value = t('components.feedback.errorBoundary.submitFailed');
    submitting.value = false;
  }
};

defineExpose({
  hasError,
  error,
  reset: handleRetry,
});
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-boundary-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 48px 24px;
}

.error-boundary-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 480px;
}

.error-boundary-icon {
  width: 64px;
  height: 64px;
  color: hsl(var(--error));
  margin-bottom: 24px;
}

.error-boundary-icon svg {
  width: 100%;
  height: 100%;
}

.error-boundary-title {
  font-size: 20px;
  font-weight: 600;
  color: hsl(var(--text));
  margin: 0 0 12px;
}

.error-boundary-description {
  font-size: 14px;
  color: hsl(var(--text-secondary));
  line-height: 1.6;
  margin: 0 0 24px;
}

.error-boundary-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.error-boundary-details {
  width: 100%;
  background: hsl(var(--surface-container-high));
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.error-boundary-details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text));
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
}

.error-boundary-details-header:hover {
  background: hsl(var(--surface-hover));
}

.error-boundary-details-content {
  padding: 0 16px 16px;
}

.error-boundary-stack {
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  font-family: 'SF Mono', 'Monaco', 'JetBrains Mono', monospace;
  color: hsl(var(--text-secondary));
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  margin: 0 0 12px;
}

.error-boundary-copy {
  color: hsl(var(--text-muted));
}

.error-boundary-report {
  margin-top: 8px;
}

.error-report-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-report-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-report-field label {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text));
}

.error-report-error {
  font-size: 12px;
  color: hsl(var(--error));
  margin-top: -8px;
  margin-bottom: 8px;
}
</style>
